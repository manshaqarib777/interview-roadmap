'use client';

import { useEffect } from 'react';
import { run, type LogLine, type RunHandle } from '@/lib/runner';
import { mountDebugger, type DebugHandle } from '@/lib/debug-ui';

/**
 * Turns the static, build-time-highlighted blocks into GitHub-style panels:
 * a header bar with the language and always-visible actions, line numbers,
 * and a terminal below for anything the snippet logs.
 *
 * The markup arrives fully rendered from the server — this only attaches
 * behaviour, so the page still paints with zero JavaScript.
 */

const RUNNABLE = new Set(['js', 'javascript', 'jsx', 'mjs', 'cjs']);

const I = {
  copy: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
  check: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  play: '<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.1v13.8L19 12z"/></svg>',
  stop: '<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>',
  edit: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  reset: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
  chevDown: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  chevUp: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>',
  x: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  bug: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2 9.5 4M16 2l-1.5 2M12 20v-9M3 13h3M18 13h3M4.5 7.5 7 9M19.5 7.5 17 9M5 18l2.5-1.5M19 18l-2.5-1.5"/><rect x="7" y="6" width="10" height="12" rx="5"/></svg>',
  term: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 8 3 3-3 3M11 14h5"/></svg>',
};

/* Sandpack labels its editor with a filename, not a language. */
const FILENAME: Record<string, string> = {
  js: 'App.js', javascript: 'App.js', jsx: 'App.js', mjs: 'App.js', cjs: 'App.js',
  ts: 'App.ts', typescript: 'App.ts', tsx: 'App.tsx',
  json: 'data.json', css: 'styles.css', html: 'index.html',
  bash: 'terminal', sh: 'terminal', text: 'output',
};

const LABEL: Record<string, string> = {
  js: 'JavaScript', javascript: 'JavaScript', jsx: 'JSX', ts: 'TypeScript',
  typescript: 'TypeScript', tsx: 'TSX', json: 'JSON', bash: 'Shell', sh: 'Shell',
  css: 'CSS', html: 'HTML', text: 'Text', md: 'Markdown',
};

function hint(text: string) {
  const el = document.createElement('div');
  el.className = 'code-out-line';
  el.style.color = 'var(--faint)';
  el.append(document.createTextNode(text));
  return el;
}

function tool(label: string, icon: string, title: string, primary = false) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'code-tool';
  b.title = title;
  if (primary) b.dataset.primary = 'true';
  b.innerHTML = `${icon}<span>${label}</span>`;
  return b;
}

function languageOf(pre: HTMLElement): string {
  const code = pre.querySelector('code');
  const fromClass = /language-([\w+-]+)/.exec(code?.className ?? '')?.[1];
  return (fromClass ?? pre.dataset.language ?? '').toLowerCase();
}

export function useEnhancedCode(ref: React.RefObject<HTMLElement | null>, key: string | number) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const cleanups: (() => void)[] = [];

    const enhance = () => root.querySelectorAll<HTMLElement>('pre').forEach((pre) => {
      // `closest`, not `parentElement` — an enhanced block sits inside
      // .code-wrap > .code-body > .code-editor, so a parent check would miss
      // it and wrap the same block again on every pass.
      if (pre.closest('.code-wrap')) return;
      const code = pre.querySelector('code');
      if (!code) return;

      const original = code.textContent ?? '';
      const pristine = code.innerHTML;
      const lang = languageOf(pre);
      const lines = original.trimEnd().split('\n').length;

      // ```js {2,5-7} → highlight those lines.
      const hl = new Set<number>();
      const meta = pre.dataset.meta ?? code.dataset.meta ?? '';
      for (const part of (/\{([\d,\s-]+)\}/.exec(meta)?.[1] ?? '').split(',')) {
        const [a, b] = part.split('-').map((n) => parseInt(n.trim(), 10));
        if (!Number.isNaN(a)) for (let n = a; n <= (Number.isNaN(b) ? a : b); n += 1) hl.add(n);
      }
      if (hl.size) {
        code.querySelectorAll<HTMLElement>('.line').forEach((el, idx) => {
          if (hl.has(idx + 1)) el.dataset.hl = 'true';
        });
      }
      const runnable =
        RUNNABLE.has(lang) || (lang === '' && /console\.log|function |=>/.test(original));

      /* ---- shell ------------------------------------------------ */
      const wrap = document.createElement('div');
      wrap.className = 'code-wrap';
      // Numbers only earn their space once a block is worth scanning.
      if (lines > 3 && lang !== 'text') wrap.dataset.numbered = 'true';
      pre.replaceWith(wrap);

      const head = document.createElement('div');
      head.className = 'code-head';
      const tab = document.createElement('span');
      tab.className = 'code-tab';
      tab.textContent = FILENAME[lang] ?? (LABEL[lang] ?? 'snippet');
      head.appendChild(tab);

      const tools = document.createElement('div');
      tools.className = 'code-tools';
      head.appendChild(tools);

      const bodyRow = document.createElement('div');
      bodyRow.className = 'code-body';
      const editor = document.createElement('div');
      editor.className = 'code-editor';
      editor.appendChild(pre);
      bodyRow.appendChild(editor);
      wrap.append(head, bodyRow);

      /* ---- collapse tall blocks, like the "Show more" footer ------ */
      if (lines > 18) {
        editor.dataset.collapsed = 'true';
        const foot = document.createElement('button');
        foot.type = 'button';
        foot.className = 'code-foot';
        const setLabel = () => {
          const open = editor.dataset.collapsed !== 'true';
          foot.innerHTML =
            (open ? I.chevUp : I.chevDown) + `<span>Show ${open ? 'less' : 'more'}</span>`;
        };
        foot.onclick = () => {
          editor.dataset.collapsed = editor.dataset.collapsed === 'true' ? 'false' : 'true';
          setLabel();
        };
        setLabel();
        wrap.appendChild(foot);
      }

      /* ---- copy -------------------------------------------------- */
      const copy = tool('Copy', I.copy, 'Copy to clipboard');
      copy.onclick = async () => {
        try {
          await navigator.clipboard.writeText(code.textContent ?? '');
          copy.innerHTML = `${I.check}<span>Copied</span>`;
          copy.style.color = 'var(--success)';
          setTimeout(() => {
            copy.innerHTML = `${I.copy}<span>Copy</span>`;
            copy.style.color = '';
          }, 1400);
        } catch {
          copy.innerHTML = '<span>Press ⌘C</span>';
        }
      };

      if (!runnable) {
        tools.appendChild(copy);
        cleanups.push(() => wrap.replaceWith(pre));
        return;
      }

      /* ---- terminal ---------------------------------------------- */
      const out = document.createElement('div');
      out.className = 'code-out';
      wrap.dataset.split = 'true';

      const outHead = document.createElement('div');
      outHead.className = 'code-out-head';
      outHead.innerHTML = `${I.term}<span>Console</span>`;

      const body = document.createElement('div');
      body.className = 'code-out-body';

      const addLine = (line: LogLine) => {
        const el = document.createElement('div');
        el.className = 'code-out-line';
        el.style.color =
          line.level === 'error' ? 'var(--destructive)'
          : line.level === 'warn' ? 'var(--warning)'
          : 'var(--foreground)';
        el.append(document.createTextNode(line.text));
        body.appendChild(el);
        out.scrollTop = out.scrollHeight;
      };

      bodyRow.appendChild(out);

      /* ---- run --------------------------------------------------- */
      let handle: RunHandle | null = null;
      const runBtn = tool('Run', I.play, 'Run this snippet  (⌘↵)', true);

      const setRunning = (on: boolean) => {
        runBtn.innerHTML = on ? `${I.stop}<span>Stop</span>` : `${I.play}<span>Run</span>`;
        runBtn.style.color = on ? 'var(--warning)' : '';
      };

      const doRun = () => {
        if (handle) handle.cancel();
        runBtn.dataset.auto = 'on';
        out.replaceChildren(outHead, body);
        body.replaceChildren();
        setRunning(true);

        let count = 0;
        handle = run(
          code.textContent ?? '',
          (line) => { count += 1; addLine(line); },
          ({ timedOut }) => {
            handle = null;
            setRunning(false);
            if (count === 0) {
              const el = document.createElement('div');
              el.className = 'code-out-line';
              el.style.color = 'var(--faint)';
              el.append(document.createTextNode('No output — add a console.log to see values.'));
              body.appendChild(el);
            }
            if (timedOut) addLine({ level: 'warn', text: 'Stopped after 4s (possible infinite loop).' });
          },
        );
      };

      runBtn.onclick = () => (handle ? handle.cancel() : doRun());

      /* Run once when the block first scrolls into view, so the pane is
         never an empty box the reader has to figure out. */
      const io = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting) return;
          io.disconnect();
          doRun();
        },
        { rootMargin: '0px 0px -15% 0px' },
      );
      io.observe(wrap);

      /* ---- live editor ------------------------------------------- *
       * Always editable, the way a sandbox should be. Typing re-runs
       * after a pause rather than on every keystroke.
       *
       * Caveat: highlighting is baked at build time, so tokens you type
       * arrive unstyled until Reset. Re-highlighting live would mean
       * shipping Shiki to the browser — not worth ~300KB for this. */
      code.setAttribute('contenteditable', 'plaintext-only');
      code.setAttribute('spellcheck', 'false');
      code.style.outline = 'none';

      let debounce: ReturnType<typeof setTimeout> | undefined;
      const onInput = () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => runBtn.dataset.auto === 'on' && doRun(), 700);
      };
      code.addEventListener('input', onInput);

      const reset = tool('Reset', I.reset, 'Restore the original snippet');
      reset.onclick = () => {
        code.innerHTML = pristine;
        body.replaceChildren(hint('Press Run to execute.'));
      };

      const clear = tool('Clear', I.x, 'Clear the console');
      clear.onclick = () => body.replaceChildren(hint('Console cleared.'));

      /* ---- debugger ---------------------------------------------- */
      let dbg: DebugHandle | null = null;
      const debugBtn = tool('Debug', I.bug, 'Step through this snippet line by line');
      debugBtn.onclick = () => {
        if (dbg) {
          dbg.destroy();
          dbg = null;
          debugBtn.dataset.primary = 'false';
          return;
        }
        handle?.cancel();
        dbg = mountDebugger(wrap, code, () => code.textContent ?? '');
        debugBtn.dataset.primary = 'true';
      };

      tools.append(runBtn, debugBtn, clear, reset, copy);
      body.appendChild(hint('Running…'));

      const onKey = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
          e.preventDefault();
          runBtn.click();
        }
      };
      code.addEventListener('keydown', onKey);

      cleanups.push(() => {
        dbg?.destroy();
        io.disconnect();
        clearTimeout(debounce);
        handle?.cancel();
        code.removeEventListener('keydown', onKey);
        code.removeEventListener('input', onInput);
      });
    });

    /**
     * The section bodies are injected with dangerouslySetInnerHTML, and React
     * re-creates that markup whenever the reader subtree remounts — which
     * silently throws away everything attached above. Watching for raw <pre>
     * elements reappearing and re-running the pass keeps the controls present
     * regardless of what the tree does around us.
     */
    let queued = false;
    const unenhanced = () =>
      [...root.querySelectorAll<HTMLElement>('pre')].some((pre) => !pre.closest('.code-wrap'));

    const observer = new MutationObserver(() => {
      if (queued || !unenhanced()) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        observer.disconnect();
        enhance();
        observer.observe(root, { childList: true, subtree: true });
      });
    });

    enhance();
    observer.observe(root, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      cleanups.forEach((fn) => fn());
    };
  }, [ref, key]);
}
