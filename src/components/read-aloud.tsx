'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { NarrationNotes } from '@/lib/narration';
import { Narrator, loadVoices, supported, type NarratorState } from '@/lib/narrator';
import { useStore } from '@/lib/store';

/**
 * Read aloud: the control, the transport, and the checkpoint.
 *
 * The narrator itself is a plain class in `narrator.ts` — it owns speech and
 * the highlight, and React owns only what is on screen. Keeping the two apart
 * matters because speech outlives render: an utterance in flight has to be
 * cancelled on unmount, and a component that also drove the queue would have
 * to re-derive it on every state change.
 */
export function ReadAloud({
  bodyRef,
  notes,
}: {
  bodyRef: React.RefObject<HTMLDivElement | null>;
  notes: NarrationNotes;
}) {
  const { state: store, setPrefs } = useStore();
  const { prefs } = store;

  const narratorRef = useRef<Narrator | null>(null);
  const [state, setState] = useState<NarratorState>({
    status: 'idle',
    at: -1,
    total: 0,
    sectionId: null,
    checkpoint: null,
    error: null,
  });
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [panel, setPanel] = useState(false);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    setAvailable(supported());
    if (!supported()) return;
    const narrator = new Narrator(setState);
    narratorRef.current = narrator;
    // Resolved here, on mount, and handed straight to the narrator: `play()`
    // must reach its first `speak()` without awaiting anything, or the click's
    // user activation has expired by the time it gets there.
    void loadVoices().then((found) => {
      setVoices(found);
      narrator.setVoices(found);
    });
    return () => {
      // Speech is global to the tab, not to this component: without this a
      // lesson keeps talking over the next one after a client-side navigation.
      narrator.stop();
      narratorRef.current = null;
    };
  }, []);

  // Preferences are read at speak time rather than captured when playback
  // started, so moving the rate slider mid-lesson takes effect on the next
  // sentence instead of the next lesson.
  useEffect(() => {
    narratorRef.current?.setPrefs({
      rate: prefs.rate,
      voiceURI: prefs.voiceURI,
      checkpoints: prefs.checkpoints,
      debug: prefs.narrateDebug,
    });
  }, [prefs.rate, prefs.voiceURI, prefs.checkpoints, prefs.narrateDebug]);

  const play = useCallback(() => {
    const narrator = narratorRef.current;
    const root = bodyRef.current;
    if (!narrator || !root) return;
    // Indexed at play time, never at mount: by now the code panels have been
    // built and Interview Mode has settled, so the queue matches the page the
    // reader is actually looking at.
    narrator.index(root, notes);
    narrator.play(0);
  }, [bodyRef, notes]);

  if (!available) return null;

  const speaking = state.status === 'speaking';
  const blocked = state.status === 'blocked';
  const active = state.status !== 'idle' && !blocked;

  return (
    <>
      <div className="chrome no-print relative">
        <div className="rail-card flex items-center gap-0.5 p-1.5">
          <button
            onClick={() => {
              if (speaking) narratorRef.current?.pause();
              else if (state.status === 'paused' || state.status === 'checkpoint')
                narratorRef.current?.continue();
              else play();
            }}
            title={state.status === 'idle' ? 'Read aloud' : speaking ? 'Pause' : 'Continue'}
            aria-label={state.status === 'idle' ? 'Read aloud' : speaking ? 'Pause' : 'Continue'}
            className="flex h-8 flex-1 items-center gap-2 rounded-lg px-2 text-[12.5px] transition-colors hover:bg-secondary"
            style={{ color: active ? 'var(--accent)' : 'var(--faint)' }}
          >
            <Icon>
              {speaking ? (
                <>
                  <rect x="7" y="5" width="3.5" height="14" rx="1" fill="currentColor" />
                  <rect x="13.5" y="5" width="3.5" height="14" rx="1" fill="currentColor" />
                </>
              ) : (
                <>
                  <path d="M11 5 6 9H3v6h3l5 4z" />
                  <path d="M16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12" />
                </>
              )}
            </Icon>
            <span className="truncate">
              {speaking ? 'Reading…' : state.status === 'idle' || blocked ? 'Read aloud' : 'Paused'}
            </span>
          </button>

          {active && (
            <button
              onClick={() => narratorRef.current?.stop()}
              title="Stop"
              aria-label="Stop reading"
              className="grid h-8 w-8 place-items-center rounded-lg text-faint transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Icon>
                <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
              </Icon>
            </button>
          )}

          <button
            onClick={() => setPanel(!panel)}
            title="Narration settings"
            aria-label="Narration settings"
            aria-pressed={panel}
            className="grid h-8 w-8 place-items-center rounded-lg transition-colors hover:bg-secondary"
            style={{ color: panel ? 'var(--primary)' : 'var(--faint)' }}
          >
            <Icon>
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 7 19.4a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H1a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 2.6 7a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 7 2.6h.1A2 2 0 1 1 11 2.6V2.7A1.7 1.7 0 0 0 14 4.6" />
            </Icon>
          </button>
        </div>

        {/* A narrator that can't be heard has to say so. The failure it
            replaces looked like the page flickering once and going quiet. */}
        {blocked && state.error && (
          <p className="mt-1.5 rounded-lg border border-[var(--warning)]/40 bg-[var(--warning)]/8 px-2.5 py-2 text-[11.5px] leading-snug text-muted-foreground">
            {state.error}
          </p>
        )}

        <AnimatePresence>
          {panel && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="panel glass absolute top-[calc(100%+6px)] right-0 z-30 w-64 space-y-3.5 p-4"
            >
              <label className="block">
                <span className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                  Speed
                  <span className="num text-faint">{prefs.rate.toFixed(1)}×</span>
                </span>
                <input
                  type="range"
                  min={0.6}
                  max={1.6}
                  step={0.1}
                  value={prefs.rate}
                  onChange={(e) => setPrefs({ rate: Number(e.target.value) })}
                  className="h-1 w-full cursor-pointer appearance-none rounded-full bg-input"
                  style={{ accentColor: 'var(--primary)' }}
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] text-muted-foreground">Voice</span>
                <select
                  value={prefs.voiceURI}
                  onChange={(e) => setPrefs({ voiceURI: e.target.value })}
                  className="w-full rounded-lg border bg-card px-2 py-1.5 text-[12px]"
                >
                  <option value="">System default</option>
                  {voices
                    .filter((v) => v.lang.startsWith('en'))
                    .map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name}
                      </option>
                    ))}
                </select>
              </label>

              <Toggle
                label="Pause between sections"
                hint="Stops at the end of each step and asks whether to carry on."
                on={prefs.checkpoints}
                onChange={(checkpoints) => setPrefs({ checkpoints })}
              />
              <Toggle
                label="Run and explain code"
                hint="Steps runnable snippets and reads the values as they change."
                on={prefs.narrateDebug}
                onChange={(narrateDebug) => setPrefs({ narrateDebug })}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Checkpoint
        state={state}
        onContinue={() => narratorRef.current?.continue()}
        onRepeat={() => narratorRef.current?.repeat()}
        onStop={() => narratorRef.current?.stop()}
      />
    </>
  );
}

/**
 * The checkpoint.
 *
 * Fixed rather than inline: the reader may have scrolled away from the
 * paragraph that just finished, and a prompt they have to go looking for is a
 * prompt that reads as the narration simply having stopped.
 */
function Checkpoint({
  state,
  onContinue,
  onRepeat,
  onStop,
}: {
  state: NarratorState;
  onContinue: () => void;
  onRepeat: () => void;
  onStop: () => void;
}) {
  return (
    <AnimatePresence>
      {state.status === 'checkpoint' && state.checkpoint && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-label="Narration paused"
          className="chrome no-print panel glass fixed bottom-6 left-1/2 z-40 w-[min(26rem,calc(100vw-2rem))] -translate-x-1/2 p-4 shadow-xl"
        >
          <p className="text-[13.5px] font-medium">
            That’s “{state.checkpoint.title}”.
          </p>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            {state.checkpoint.nextTitle
              ? `Next up: ${state.checkpoint.nextTitle}. Carry on, or take a moment with this one?`
              : 'That’s the end of the lesson.'}
          </p>
          <div className="mt-3 flex gap-2">
            <button onClick={onContinue} className="btn btn-solid flex-1 py-1.5 text-[12.5px]">
              Continue
            </button>
            <button onClick={onRepeat} className="btn btn-ghost py-1.5 text-[12.5px]">
              Repeat that
            </button>
            <button onClick={onStop} className="btn btn-ghost py-1.5 text-[12.5px]">
              Stop
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Toggle({
  label,
  hint,
  on,
  onChange,
}: {
  label: string;
  hint: string;
  on: boolean;
  onChange: (on: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      aria-pressed={on}
      className="flex w-full items-start gap-2.5 text-left"
    >
      <span
        className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border text-[9px] transition-colors"
        style={{
          borderColor: on ? 'var(--accent)' : 'var(--input)',
          background: on ? 'var(--accent)' : 'transparent',
          color: on ? 'var(--background)' : 'transparent',
        }}
      >
        ✓
      </span>
      <span>
        <span className="block text-[12px]">{label}</span>
        <span className="block text-[11px] leading-snug text-faint">{hint}</span>
      </span>
    </button>
  );
}

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      {children}
    </svg>
  );
}
