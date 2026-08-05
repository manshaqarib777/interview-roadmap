'use client';

import { trace, type Frame } from './debugger';
import type { NarrationNotes, NarrationNote } from './narration';

/**
 * Reads a lesson aloud and keeps the page underneath it.
 *
 * Built on the Web Speech API — no dependency, no service, no key, and it
 * works offline. The voices are the operating system's, which is the trade:
 * excellent on macOS, iOS and Android, merely serviceable on Windows and
 * Linux. Pre-rendered audio would sound better and would mean 104 MP3s, timing
 * data to drive the highlight, and a bill.
 *
 * Sequencing is a plain async loop rather than a state machine: each cue is
 * awaited, and a token bumped on every stop makes an in-flight loop abandon
 * itself. The alternative — one utterance queued per block up front — gives up
 * the ability to stop cleanly mid-lesson, which is most of what a narrator is
 * asked to do.
 */

export type NarratorStatus = 'idle' | 'speaking' | 'paused' | 'checkpoint' | 'blocked';

export type NarratorState = {
  status: NarratorStatus;
  /** index into the cue list, -1 before anything has been read */
  at: number;
  total: number;
  /** the step being read, so the rail can follow along */
  sectionId: string | null;
  /** set when the narrator has paused to ask whether to carry on */
  checkpoint: { title: string; nextTitle: string | null } | null;
  /** why nothing is being said, when status is 'blocked' */
  error: string | null;
};

export type NarratorPrefs = {
  rate: number;
  voiceURI: string;
  /** pause and ask at the end of every step */
  checkpoints: boolean;
  /** run runnable snippets and narrate the values as they change */
  debug: boolean;
};

type Cue = {
  el: HTMLElement;
  section: HTMLElement | null;
  note: NarrationNote | undefined;
};

export const supported = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

/* ---------------------------------------------------------------- */
/* Voices                                                            */
/* ---------------------------------------------------------------- */

/**
 * `getVoices()` is empty on the first call in every browser that loads them
 * asynchronously, so a naive read at startup finds nothing and silently falls
 * back to the default voice forever.
 */
export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!supported()) return Promise.resolve([]);
  const now = speechSynthesis.getVoices();
  if (now.length) return Promise.resolve(now);
  return new Promise((resolve) => {
    const done = () => resolve(speechSynthesis.getVoices());
    speechSynthesis.addEventListener('voiceschanged', done, { once: true });
    // Some builds never fire the event when the list is already warm.
    setTimeout(done, 1000);
  });
}

function pickVoice(voices: SpeechSynthesisVoice[], wanted: string): SpeechSynthesisVoice | null {
  if (wanted) {
    const exact = voices.find((v) => v.voiceURI === wanted);
    if (exact) return exact;
  }
  const english = voices.filter((v) => v.lang.startsWith('en'));
  // Local voices don't stall on a network round trip mid-sentence.
  return english.find((v) => v.localService) ?? english[0] ?? null;
}

/* ---------------------------------------------------------------- */
/* Sentence lookup                                                   */
/* ---------------------------------------------------------------- */

/**
 * The sentence containing `index`, found on demand from a `boundary` event.
 *
 * Deliberately not precomputed: the utterance text is the element's own
 * `textContent`, so an offset from the speech engine indexes the rendered text
 * directly, and a range built from it lands exactly on screen. Precomputing
 * would mean keeping a second copy of the text in sync with the first.
 */
function sentenceAt(text: string, index: number): [number, number] {
  const isBreak = (i: number) =>
    '.!?'.includes(text[i]) && (i + 1 >= text.length || /\s/.test(text[i + 1]));

  let start = 0;
  for (let i = index - 1; i >= 0; i -= 1) {
    if (isBreak(i)) {
      start = i + 1;
      break;
    }
  }
  let end = text.length;
  for (let i = Math.max(index, start); i < text.length; i += 1) {
    if (isBreak(i)) {
      end = i + 1;
      break;
    }
  }
  while (start < end && /\s/.test(text[start])) start += 1;
  return [start, end];
}

/* ---------------------------------------------------------------- */
/* Highlighting                                                      */
/* ---------------------------------------------------------------- */

const HIGHLIGHT = 'narrator-sentence';

/**
 * The CSS Custom Highlight API, where it exists, is the only way to mark a
 * sentence without touching the DOM — and not touching the DOM is a hard
 * requirement here, not a preference. Wrapping the range in a `<span>` would
 * mutate the same subtree `useEnhancedCode` has already rewritten, destroying
 * an open debugger mid-sentence. Where it's missing the block highlight alone
 * carries the read-along, which is degraded rather than broken.
 */
const canHighlightRanges = () =>
  typeof CSS !== 'undefined' && 'highlights' in CSS && typeof Highlight !== 'undefined';

function markSentence(el: HTMLElement, from: number, to: number) {
  if (!canHighlightRanges()) return;

  // Walk the element's text nodes accumulating length, so a character offset
  // into `textContent` becomes a (node, offset) pair.
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let seen = 0;
  let startNode: Text | null = null;
  let startOffset = 0;
  let endNode: Text | null = null;
  let endOffset = 0;

  for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
    const len = node.data.length;
    if (!startNode && seen + len > from) {
      startNode = node;
      startOffset = from - seen;
    }
    if (startNode && seen + len >= to) {
      endNode = node;
      endOffset = to - seen;
      break;
    }
    seen += len;
  }
  if (!startNode) return;

  const range = document.createRange();
  range.setStart(startNode, Math.max(0, startOffset));
  if (endNode) range.setEnd(endNode, Math.min(endNode.data.length, Math.max(0, endOffset)));
  else range.setEndAfter(el);

  CSS.highlights.set(HIGHLIGHT, new Highlight(range));
}

function clearSentence() {
  if (canHighlightRanges()) CSS.highlights.delete(HIGHLIGHT);
}

/** Centre it only when it isn't comfortably visible — re-centring every block
 *  turns a page into a conveyor belt. */
function keepInView(el: Element) {
  const box = el.getBoundingClientRect();
  const top = window.innerHeight * 0.18;
  const bottom = window.innerHeight * 0.78;
  if (box.top >= top && box.bottom <= bottom) return;
  const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ block: 'center', behavior: smooth ? 'smooth' : 'auto' });
}

/* ---------------------------------------------------------------- */
/* The narrator                                                      */
/* ---------------------------------------------------------------- */

export class Narrator {
  private cues: Cue[] = [];
  private voices: SpeechSynthesisVoice[] = [];
  private prefs: NarratorPrefs = { rate: 1, voiceURI: '', checkpoints: true, debug: true };
  /** Bumped on every stop; an in-flight loop sees the change and abandons. */
  private token = 0;
  private keepAlive: ReturnType<typeof setInterval> | undefined;
  private paused = false;

  state: NarratorState = {
    status: 'idle',
    at: -1,
    total: 0,
    sectionId: null,
    checkpoint: null,
    error: null,
  };

  constructor(private emit: (state: NarratorState) => void) {}

  setPrefs(prefs: NarratorPrefs) {
    this.prefs = prefs;
  }

  /**
   * Voices are handed in from the component, which resolves them on mount.
   *
   * `play()` must not await anything before its first `speak()`: Chrome and
   * Safari only honour speech inside the user-activation window opened by the
   * click, and a single `await` closes it. Loading the voice list lazily on
   * first play looks harmless and silently breaks every first play.
   */
  setVoices(voices: SpeechSynthesisVoice[]) {
    this.voices = voices;
  }

  /**
   * Rebuild the cue list from what is actually on the page.
   *
   * Reading order and prose text both come from the DOM rather than from the
   * build, so this is correct whatever has happened to the markup since — code
   * panels mounted, Interview Mode swapping the whole subtree, a debugger open.
   */
  index(root: HTMLElement, notes: NarrationNotes) {
    this.cues = [...root.querySelectorAll<HTMLElement>('[data-narrate]')].map((el) => ({
      el,
      section: el.closest('section'),
      note: notes[el.dataset.narrate ?? ''],
    }));
    this.update({ total: this.cues.length });
  }

  private update(patch: Partial<NarratorState>) {
    this.state = { ...this.state, ...patch };
    this.emit(this.state);
  }

  /* ---- speech primitives ---------------------------------------- */

  /**
   * Speak one utterance. Resolves true only if it was actually voiced.
   *
   * The return value is the whole point. A browser that accepts an utterance
   * and then drops it — no audio device, no installed voice, a wedged synth —
   * fires `end` immediately and reports nothing wrong. Treating that as
   * success is what turns a lesson into a flicker: every cue "finishes" in
   * microseconds and the narrator races the length of the page in silence.
   * So an utterance only counts as spoken if `start` fired first.
   */
  private say(text: string, onBoundary?: (index: number) => void): Promise<boolean> {
    return new Promise((resolve) => {
      if (!text.trim()) return resolve(true);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = this.prefs.rate;
      const voice = pickVoice(this.voices, this.prefs.voiceURI);
      if (voice) utterance.voice = voice;

      let started = false;
      let settled = false;
      const finish = (ok: boolean) => {
        if (settled) return;
        settled = true;
        clearTimeout(watchdog);
        resolve(ok);
      };

      utterance.onstart = () => {
        started = true;
      };
      // `end` and `error` both settle: cancel() fires one or the other
      // depending on the browser, and a narrator that hangs on a cancelled
      // utterance never stops.
      utterance.onend = () => finish(started);
      utterance.onerror = () => finish(false);
      if (onBoundary) utterance.onboundary = (e) => onBoundary(e.charIndex);

      // Some failures are silent in both directions: no `start`, no `end`, no
      // `error`. Without a watchdog the loop would hang on the first block
      // instead of racing through it — the opposite bug, equally dead.
      const watchdog = setTimeout(() => {
        if (!started && !speechSynthesis.speaking) finish(false);
      }, 3000);

      speechSynthesis.speak(utterance);
    });
  }

  /** Give up, explain why, and leave the page as it was. */
  private block(error: string) {
    this.token += 1;
    this.stopKeepAlive();
    speechSynthesis.cancel();
    this.clearMarks();
    this.update({ status: 'blocked', at: -1, sectionId: null, checkpoint: null, error });
  }

  /**
   * Chrome stops synthesising after roughly fifteen seconds and reports
   * nothing — no `end`, no `error`, just silence. Toggling pause/resume on a
   * timer keeps the queue alive. It is a workaround for a decade-old bug, and
   * removing it makes every paragraph longer than a few sentences cut off.
   */
  private startKeepAlive() {
    this.stopKeepAlive();
    this.keepAlive = setInterval(() => {
      if (this.paused || !speechSynthesis.speaking) return;
      speechSynthesis.pause();
      speechSynthesis.resume();
    }, 10_000);
  }

  private stopKeepAlive() {
    if (this.keepAlive) clearInterval(this.keepAlive);
    this.keepAlive = undefined;
  }

  /* ---- cue playback --------------------------------------------- */

  private async speakProse(cue: Cue): Promise<boolean> {
    // The only edit allowed to prose: a non-breaking space swapped for a
    // plain one, which some engines read as a stumble. One character for one
    // character, so every offset a `boundary` event reports still lines up.
    const text =
      cue.note?.kind === 'say' ? cue.note.text : (cue.el.textContent ?? '').replace(/\u00a0/g, ' ');
    if (!text.trim()) return true;

    cue.el.dataset.narrating = 'true';
    keepInView(cue.el);

    // A `say` note's text differs from the element's, so an offset into it
    // would mark the wrong characters — those blocks get the block highlight
    // and nothing finer.
    const trackable = cue.note?.kind !== 'say';
    const spoke = await this.say(
      text,
      trackable ? (i) => markSentence(cue.el, ...sentenceAt(text, i)) : undefined,
    );

    clearSentence();
    delete cue.el.dataset.narrating;
    return spoke;
  }

  private async speakCode(cue: Cue): Promise<boolean> {
    if (cue.note?.kind !== 'code') return true;
    const { lines, source, runnable } = cue.note;

    cue.el.dataset.narrating = 'true';

    // A tall block ships collapsed. Clicking its own footer rather than
    // setting the attribute keeps the "Show more" label honest.
    const editor = cue.el.closest<HTMLElement>('.code-editor');
    if (editor?.dataset.collapsed === 'true') {
      editor.parentElement?.parentElement?.querySelector<HTMLElement>('.code-foot')?.click();
    }

    keepInView(cue.el);

    const lineEls = [...cue.el.querySelectorAll<HTMLElement>('.line')];
    const mark = (n: number) => {
      lineEls.forEach((el) => delete el.dataset.narrating);
      const el = lineEls[n - 1];
      if (el) {
        el.dataset.narrating = 'true';
        keepInView(el);
      }
    };
    const done = (spoke: boolean) => {
      lineEls.forEach((el) => delete el.dataset.narrating);
      delete cue.el.dataset.narrating;
      return spoke;
    };

    if (runnable && this.prefs.debug) {
      const narrated = await this.speakExecution(cue, source, mark);
      if (narrated !== null) return done(narrated);
    }

    let spoke = await this.say('Here is the code.');
    for (const line of lines) {
      if (!this.alive) return done(spoke);
      mark(line.n);
      spoke = (await this.say(line.say)) && spoke;
    }

    return done(spoke);
  }

  /**
   * Run the snippet and narrate what actually happened.
   *
   * This is the part a static page cannot do: the debugger already records a
   * frame per statement with the variables live at that point, so the narrator
   * can say "count is now two" instead of describing the increment. It drives
   * `trace` directly rather than the mounted debugger panel — the panel is the
   * reader's to steer, and two things stepping the same timeline would fight.
   *
   * Returns null when there is nothing worth narrating, so the caller can fall
   * back to reading the lines; otherwise whether it was actually voiced.
   */
  private async speakExecution(
    cue: Cue,
    source: string,
    mark: (n: number) => void,
  ): Promise<boolean | null> {
    let frames: Frame[];
    try {
      const result = await trace(source);
      if (result.error || result.frames.length < 2) return null;
      frames = result.frames;
    } catch {
      return null;
    }
    if (!this.alive) return true;

    let spoke = await this.say('Let me run this and talk through what happens.');

    let previous = new Map<string, string>();
    // Long traces are a loop the listener does not need narrated forty times.
    for (const frame of frames.slice(0, 40)) {
      if (!this.alive) return spoke;
      mark(frame.line);

      const changed = frame.vars.filter(
        (v) => v.state === 'ok' && previous.get(v.name) !== v.value,
      );
      previous = new Map(frame.vars.map((v) => [v.name, v.value]));

      const said = changed
        .slice(0, 3)
        .map((v) => `${v.name} is now ${v.value}`)
        .join(', ');
      const logged = frame.logs.map((l) => l.text).join('. ');

      const parts = [`Line ${frame.line}.`, said, logged && `It logs ${logged}.`].filter(Boolean);
      // A frame that changed nothing and printed nothing is a step the
      // listener gains nothing from hearing.
      if (parts.length > 1) spoke = (await this.say(parts.join(' '))) && spoke;
    }

    if (frames.length > 40 && this.alive) {
      spoke = (await this.say('The rest of the run repeats the same steps.')) && spoke;
    }
    return spoke;
  }

  private get alive() {
    return this.state.status === 'speaking' || this.state.status === 'paused';
  }

  private clearMarks() {
    clearSentence();
    for (const cue of this.cues) {
      delete cue.el.dataset.narrating;
      cue.el.querySelectorAll<HTMLElement>('.line').forEach((el) => delete el.dataset.narrating);
    }
  }

  /* ---- transport ------------------------------------------------ */

  /**
   * Not async, and deliberately so.
   *
   * Everything up to the first `speak()` runs inside the click that called it.
   * Chrome and Safari only honour speech while the user activation from that
   * click is live, and a single `await` — resolving the voice list, say —
   * closes the window and gets the utterance dropped with no error at all.
   */
  play(from = Math.max(0, this.state.at)) {
    if (!supported() || !this.cues.length) return;

    // A synchronous re-read, in case the list arrived after the mount-time
    // resolve gave up on it. `getVoices()` costs nothing and doesn't await, so
    // it can't cost us the user activation.
    if (!this.voices.length) this.voices = speechSynthesis.getVoices();

    if (!this.voices.length) {
      // Chrome on Linux exposes voices only when speech-dispatcher is running
      // and reachable; elsewhere an empty list means none are installed. Either
      // way there is nothing to speak with, and saying so beats a silent race.
      this.block(
        'No speech voices are available in this browser. On Linux, install speech-dispatcher and a voice such as espeak-ng, then restart the browser.',
      );
      return;
    }

    // cancel() immediately before speak() wedges the queue in Chrome — the new
    // utterance is accepted and never starts. Only cancel if there is really
    // something to stop, and let it settle before speaking.
    const dirty = speechSynthesis.speaking || speechSynthesis.pending;
    if (dirty) speechSynthesis.cancel();
    // A synth left paused by an earlier navigation stays paused, and every
    // later utterance queues behind it in silence.
    speechSynthesis.resume();

    this.paused = false;
    const mine = ++this.token;
    this.update({ status: 'speaking', checkpoint: null, error: null });
    this.startKeepAlive();

    void this.run(mine, from, dirty);
  }

  private async run(mine: number, from: number, settle: boolean) {
    if (settle) await new Promise((r) => setTimeout(r, 60));

    let failures = 0;

    for (let i = from; i < this.cues.length; i += 1) {
      if (mine !== this.token) return;
      const cue = this.cues[i];
      this.update({ at: i, sectionId: cue.section?.id ?? null });

      const spoke =
        cue.note?.kind === 'code' ? await this.speakCode(cue) : await this.speakProse(cue);

      if (mine !== this.token) return;

      // Two silent blocks in a row is not a quirk of one utterance, it is the
      // synthesiser refusing to speak. Stopping here is what keeps a broken
      // setup from strobing through the whole lesson in a second.
      failures = spoke ? 0 : failures + 1;
      if (failures >= 2) {
        this.block(
          'The browser accepted the narration but never played it. Check the tab is not muted, then try a different voice.',
        );
        return;
      }

      // Checkpoint at the seam between two steps: the pause after a hard idea
      // is where it lands, and a wall of speech gives the listener nowhere to
      // stop without losing their place.
      const next = this.cues[i + 1];
      if (this.prefs.checkpoints && next && next.section !== cue.section) {
        this.update({
          status: 'checkpoint',
          at: i,
          checkpoint: {
            title: cue.section?.querySelector('h2')?.textContent ?? 'this section',
            nextTitle: next.section?.querySelector('h2')?.textContent ?? null,
          },
        });
        this.stopKeepAlive();
        return;
      }
    }

    this.stop();
  }

  pause() {
    if (this.state.status !== 'speaking') return;
    this.paused = true;
    speechSynthesis.pause();
    this.update({ status: 'paused' });
  }

  resume() {
    if (this.state.status !== 'paused') return;
    this.paused = false;
    speechSynthesis.resume();
    this.update({ status: 'speaking' });
  }

  /** Continue past a checkpoint, or from wherever the narrator stopped. */
  continue() {
    if (this.state.status === 'paused') return this.resume();
    return this.play(this.state.at + 1);
  }

  /** Re-read the step just finished — the reason to stop is usually that it
   *  didn't land the first time. */
  repeat() {
    const section = this.cues[this.state.at]?.section;
    let from = this.state.at;
    while (from > 0 && this.cues[from - 1].section === section) from -= 1;
    return this.play(from);
  }

  stop() {
    this.token += 1;
    this.paused = false;
    this.stopKeepAlive();
    speechSynthesis.cancel();
    this.clearMarks();
    this.update({ status: 'idle', at: -1, sectionId: null, checkpoint: null, error: null });
  }
}
