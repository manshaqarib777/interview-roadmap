'use client';

import { trace, type Frame } from './debugger';

/**
 * Debugger panel, built with plain DOM to match the rest of the code-block
 * enhancement layer (see enhance-code.tsx). It attaches to an already-rendered
 * block rather than replacing it, so the highlighted source stays exactly as
 * Shiki built it at compile time.
 */

const SVG = (d: string, w = 13) =>
  `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

const ICON = {
  first: SVG('<path d="M19 20 9 12l10-8zM5 19V5"/>'),
  prev: SVG('<path d="m15 18-6-6 6-6"/>'),
  next: SVG('<path d="m9 18 6-6-6-6"/>'),
  last: SVG('<path d="m5 4 10 8-10 8zM19 5v14"/>'),
  play: '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.1v13.8L19 12z"/></svg>',
  pause: '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
  bug: SVG('<path d="M8 2 9.5 4M16 2l-1.5 2M12 20v-9M3 13h3M18 13h3M4.5 7.5 7 9M19.5 7.5 17 9M5 18l2.5-1.5M19 18l-2.5-1.5"/><rect x="7" y="6" width="10" height="12" rx="5"/>'),
  close: SVG('<path d="M18 6 6 18M6 6l12 12"/>'),
};

const STATE_LABEL: Record<string, string> = {
  tdz: 'TDZ',
  'out-of-scope': '—',
};

export type DebugHandle = { destroy: () => void };

export function mountDebugger(
  wrap: HTMLElement,
  codeEl: HTMLElement,
  getSource: () => string,
): DebugHandle {
  const lineEls = Array.from(codeEl.querySelectorAll<HTMLElement>('.line'));

  const panel = document.createElement('div');
  panel.className = 'dbg';
  panel.innerHTML = `
    <div class="dbg-head">
      <span class="dbg-title">${ICON.bug} Debugger</span>
      <span class="dbg-step"></span>
      <button class="dbg-close" title="Close debugger" aria-label="Close debugger">${ICON.close}</button>
    </div>
    <div class="dbg-controls">
      <button class="dbg-btn" data-act="first" title="Back to start">${ICON.first}</button>
      <button class="dbg-btn" data-act="prev" title="Step back">${ICON.prev}</button>
      <button class="dbg-btn dbg-play" data-act="play" title="Play / pause">${ICON.play}</button>
      <button class="dbg-btn" data-act="next" title="Step forward">${ICON.next}</button>
      <button class="dbg-btn" data-act="last" title="Jump to end">${ICON.last}</button>
      <input class="dbg-scrub" type="range" min="0" max="0" value="0" aria-label="Timeline" />
    </div>
    <div class="dbg-body">
      <section class="dbg-col">
        <p class="dbg-label">Variables</p>
        <div class="dbg-vars"></div>
      </section>
      <section class="dbg-col">
        <p class="dbg-label">Call stack</p>
        <div class="dbg-stack"></div>
        <p class="dbg-label" style="margin-top:12px">Console</p>
        <div class="dbg-console"></div>
      </section>
    </div>
  `;

  const $ = <T extends HTMLElement>(sel: string) => panel.querySelector<T>(sel)!;
  const stepEl = $('.dbg-step');
  const scrub = $<HTMLInputElement>('.dbg-scrub');
  const varsEl = $('.dbg-vars');
  const stackEl = $('.dbg-stack');
  const consoleEl = $('.dbg-console');
  const playBtn = $('.dbg-play');

  let frames: Frame[] = [];
  let at = 0;
  let timer: ReturnType<typeof setInterval> | undefined;

  const clearHighlight = () => lineEls.forEach((el) => el.removeAttribute('data-dbg'));

  function render() {
    const f = frames[at];
    stepEl.textContent = frames.length ? `Step ${at + 1} / ${frames.length}` : 'No steps';
    scrub.value = String(at);

    clearHighlight();
    if (f && f.line > 0 && lineEls[f.line - 1]) {
      const el = lineEls[f.line - 1];
      el.dataset.dbg = 'true';
      el.scrollIntoView({ block: 'nearest' });
    }

    // Variables
    varsEl.replaceChildren();
    if (!f || f.vars.length === 0) {
      varsEl.append(row('—', 'nothing declared yet', 'out-of-scope'));
    } else {
      for (const v of f.vars) varsEl.append(row(v.name, v.value, v.state));
    }

    // Call stack, innermost first
    stackEl.replaceChildren();
    for (const name of [...(f?.stack ?? ['(global)'])].reverse()) {
      const el = document.createElement('div');
      el.className = 'dbg-frame';
      el.textContent = name;
      stackEl.append(el);
    }

    // Console — everything logged up to and including this step
    consoleEl.replaceChildren();
    const logs = frames.slice(0, at + 1).flatMap((fr) => fr.logs);
    if (logs.length === 0) {
      const el = document.createElement('div');
      el.className = 'dbg-log dbg-dim';
      el.textContent = 'No output yet.';
      consoleEl.append(el);
    } else {
      for (const l of logs) {
        const el = document.createElement('div');
        el.className = `dbg-log dbg-log-${l.level}`;
        el.textContent = l.text;
        consoleEl.append(el);
      }
    }
  }

  function row(name: string, value: string, state: string) {
    const el = document.createElement('div');
    el.className = 'dbg-var';
    el.dataset.state = state;
    const badge = STATE_LABEL[state];
    el.innerHTML =
      `<span class="dbg-var-name">${escape(name)}</span>` +
      (badge ? `<span class="dbg-badge">${badge}</span>` : '') +
      `<span class="dbg-var-val">${escape(value)}</span>`;
    return el;
  }

  const escape = (s: string) =>
    s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

  function go(n: number) {
    at = Math.max(0, Math.min(n, frames.length - 1));
    render();
  }

  function setPlaying(on: boolean) {
    clearInterval(timer);
    playBtn.innerHTML = on ? ICON.pause : ICON.play;
    playBtn.dataset.on = String(on);
    if (!on) return;
    timer = setInterval(() => {
      if (at >= frames.length - 1) return setPlaying(false);
      go(at + 1);
    }, 550);
  }

  panel.addEventListener('click', (e) => {
    const act = (e.target as HTMLElement).closest<HTMLElement>('[data-act]')?.dataset.act;
    if (!act) return;
    if (act !== 'play') setPlaying(false);
    if (act === 'first') go(0);
    if (act === 'prev') go(at - 1);
    if (act === 'next') go(at + 1);
    if (act === 'last') go(frames.length - 1);
    if (act === 'play') setPlaying(playBtn.dataset.on !== 'true');
  });

  scrub.addEventListener('input', () => {
    setPlaying(false);
    go(Number(scrub.value));
  });

  $('.dbg-close').addEventListener('click', () => destroy());

  // Arrow keys step while the panel has focus.
  const onKey = (e: KeyboardEvent) => {
    if (!panel.contains(document.activeElement)) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); setPlaying(false); go(at + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); setPlaying(false); go(at - 1); }
  };
  panel.addEventListener('keydown', onKey);

  wrap.appendChild(panel);

  // Kick off the trace.
  stepEl.textContent = 'Tracing…';
  trace(getSource()).then(({ frames: f, error }) => {
    if (error && f.length === 0) {
      stepEl.textContent = '';
      panel.querySelector('.dbg-body')!.innerHTML =
        `<div class="dbg-error">${escape(error)}</div>`;
      return;
    }
    frames = f;
    scrub.max = String(Math.max(0, frames.length - 1));
    go(0);
  });

  function destroy() {
    clearInterval(timer);
    clearHighlight();
    panel.removeEventListener('keydown', onKey);
    panel.remove();
  }

  return { destroy };
}
