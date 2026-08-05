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

export type NarratorStatus = 'idle' | 'speaking' | 'paused' | 'checkpoint';

export type NarratorState = {
  status: NarratorStatus;
  /** index into the cue list, -1 before anything has been read */
  at: number;
  total: number;
  /** the step being read, so the rail can follow along */
  sectionId: string | null;
  /** set when the narrator has paused to ask whether to carry on */
  checkpoint: { title: string; nextTitle: string | null } | null;
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

  state: NarratorState = { status: 'idle', at: -1, total: 0, sectionId: null, checkpoint: null };

  constructor(private emit: (state: NarratorState) => void) {}

  setPrefs(prefs: NarratorPrefs) {
    this.prefs = prefs;
  }

  async ready() {
    this.voices = await loadVoices();
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

  private say(text: string, onBoundary?: (index: number) => void): Promise<void> {
    return new Promise((resolve) => {
      const clean = text.trim();
      if (!clean) return resolve();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = this.prefs.rate;
      const voice = pickVoice(this.voices, this.prefs.voiceURI);
      if (voice) utterance.voice = voice;

      // `end` and `error` both resolve: cancel() fires one or the other
      // depending on the browser, and a narrator that hangs on a cancelled
      // utterance never stops.
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      if (onBoundary) {
        utterance.onboundary = (e) => onBoundary(e.charIndex);
      }

      speechSynthesis.speak(utterance);
    });
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

  private async speakProse(cue: Cue) {
    // The only edit allowed to prose: a non-breaking space swapped for a
    // plain one, which some engines read as a stumble. One character for one
    // character, so every offset a `boundary` event reports still lines up.
    const text =
      cue.note?.kind === 'say' ? cue.note.text : (cue.el.textContent ?? '').replace(/ /g, ' ');
    if (!text.trim()) return;

    cue.el.dataset.narrating = 'true';
    keepInView(cue.el);

    // A `say` note's text differs from the element's, so an offset into it
    // would mark the wrong characters — those blocks get the block highlight
    // and nothing finer.
    const trackable = cue.note?.kind !== 'say';
    await this.say(text, trackable ? (i) => markSentence(cue.el, ...sentenceAt(text, i)) : undefined);

    clearSentence();
    delete cue.el.dataset.narrating;
  }

  private async speakCode(cue: Cue) {
    if (cue.note?.kind !== 'code') return;
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

    if (runnable && this.prefs.debug) {
      const narrated = await this.speakExecution(cue, source, mark);
      if (narrated) {
        lineEls.forEach((el) => delete el.dataset.narrating);
        delete cue.el.dataset.narrating;
        return;
      }
    }

    await this.say('Here is the code.');
    for (const line of lines) {
      if (!this.alive) return;
      mark(line.n);
      await this.say(line.say);
    }

    lineEls.forEach((el) => delete el.dataset.narrating);
    delete cue.el.dataset.narrating;
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
   * Returns false when there is nothing worth narrating, so the caller can
   * fall back to reading the lines.
   */
  private async speakExecution(
    cue: Cue,
    source: string,
    mark: (n: number) => void,
  ): Promise<boolean> {
    let frames: Frame[];
    try {
      const result = await trace(source);
      if (result.error || result.frames.length < 2) return false;
      frames = result.frames;
    } catch {
      return false;
    }
    if (!this.alive) return true;

    await this.say('Let me run this and talk through what happens.');

    let previous = new Map<string, string>();
    // Long traces are a loop the listener does not need narrated forty times.
    for (const frame of frames.slice(0, 40)) {
      if (!this.alive) return true;
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
      if (parts.length > 1) await this.say(parts.join(' '));
    }

    if (frames.length > 40 && this.alive) {
      await this.say('The rest of the run repeats the same steps.');
    }
    return true;
  }

  private get alive() {
    return this.state.status === 'speaking' || this.state.status === 'paused';
  }

  /* ---- transport ------------------------------------------------ */

  async play(from = Math.max(0, this.state.at)) {
    if (!supported() || !this.cues.length) return;
    if (!this.voices.length) await this.ready();

    speechSynthesis.cancel();
    this.paused = false;
    const mine = ++this.token;
    this.update({ status: 'speaking', checkpoint: null });
    this.startKeepAlive();

    for (let i = from; i < this.cues.length; i += 1) {
      if (mine !== this.token) return;
      const cue = this.cues[i];
      this.update({ at: i, sectionId: cue.section?.id ?? null });

      if (cue.note?.kind === 'code') await this.speakCode(cue);
      else await this.speakProse(cue);

      if (mine !== this.token) return;

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
    clearSentence();
    for (const cue of this.cues) {
      delete cue.el.dataset.narrating;
      cue.el.querySelectorAll<HTMLElement>('.line').forEach((el) => delete el.dataset.narrating);
    }
    this.update({ status: 'idle', at: -1, sectionId: null, checkpoint: null });
  }
}
