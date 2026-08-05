/**
 * Write the spoken explanation for every code line in the curriculum.
 *
 *   node scripts/generate-narration.ts --dry-run   # what would be sent, and the cost
 *   node scripts/generate-narration.ts             # submit, wait, write the sidecar
 *
 * Output goes to `content/narration.json`, which is committed. That is the
 * point: this runs once when code blocks change, never at build time and never
 * at request time, so a deploy costs nothing and the site keeps working with
 * no API key anywhere near it.
 *
 * Incremental by content hash — a block whose source hasn't changed is never
 * re-sent, so a run after adding one lesson costs one lesson.
 *
 * Uses the Batches API: half price, and the latency doesn't matter for a job
 * nobody is waiting on. Structured outputs mean the per-line mapping comes
 * back validated rather than parsed out of prose.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import Anthropic from '@anthropic-ai/sdk';

import { hashCode, type Sidecar } from '../src/lib/narration.ts';

const MODEL = 'claude-opus-5';
/** $/million tokens at the Batches API's 50% discount. */
const RATE = { input: 5 / 2, output: 25 / 2 };

const CONTENT = path.join(process.cwd(), 'content');
const SIDECAR = path.join(CONTENT, 'narration.json');

const SYSTEM = `You write the spoken narration for a senior-level frontend interview curriculum. A learner is listening to a lesson while the code is highlighted line by line on screen.

For each line of the snippet, write what a good teacher would SAY as that line highlights.

Rules:
- Explain WHY the line is there, not what the syntax is. The listener can see the code; they cannot see the reason. "the closure captures count, which is why it survives the call" — never "const count equals zero".
- One sentence. Spoken register, not written: no bullet points, no markdown, no backticks, no code punctuation read aloud.
- Skip nothing structural, but say so briefly when a line is just scaffolding ("closing the function").
- Never begin with "This line" or "Here we".
- If a line carries the lesson's actual point, that is where to spend the sentence.
- Return one entry per line you want spoken, using the line numbers given. Omit blank lines.`;

const SCHEMA = {
  type: 'object',
  properties: {
    lines: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          n: { type: 'integer', description: '1-based line number from the numbered source' },
          say: { type: 'string', description: 'one spoken sentence' },
        },
        required: ['n', 'say'],
        additionalProperties: false,
      },
    },
  },
  required: ['lines'],
  additionalProperties: false,
} as const;

type Block = { hash: string; lang: string; source: string; lesson: string };

/* ---------------------------------------------------------------- */
/* Collect every code block in the curriculum                        */
/* ---------------------------------------------------------------- */

async function collect(): Promise<Block[]> {
  const blocks = new Map<string, Block>();

  const walk = async (dir: string): Promise<void> => {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
        continue;
      }
      if (!entry.name.endsWith('.md')) continue;

      const md = await fs.readFile(full, 'utf8');
      for (const m of md.matchAll(/```([\w+-]*)[^\n]*\n([\s\S]*?)```/g)) {
        const lang = m[1].toLowerCase();
        // `narrate` fences are the authored override — they are the answer,
        // not the question. Prose fences have nothing to explain.
        if (!lang || lang === 'narrate' || lang === 'text') continue;
        const source = m[2].replace(/\n$/, '');
        if (source.trim().split('\n').length < 2) continue;
        const hash = hashCode(source);
        // Deduped across the whole curriculum: the same snippet quoted in two
        // lessons is one request and one sidecar entry.
        if (!blocks.has(hash)) {
          blocks.set(hash, { hash, lang, source, lesson: path.relative(CONTENT, full) });
        }
      }
    }
  };

  await walk(CONTENT);
  return [...blocks.values()];
}

/** Numbered, so the model's line numbers and ours cannot drift apart. */
function prompt(block: Block): string {
  const numbered = block.source
    .split('\n')
    .map((line, i) => `${String(i + 1).padStart(3)} | ${line}`)
    .join('\n');
  return `Language: ${block.lang}\nLesson: ${block.lesson}\n\n${numbered}`;
}

/* ---------------------------------------------------------------- */

async function readSidecar(): Promise<Sidecar> {
  try {
    return JSON.parse(await fs.readFile(SIDECAR, 'utf8')) as Sidecar;
  } catch {
    return {};
  }
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has('--dry-run');
  const force = args.has('--force');

  const sidecar = await readSidecar();
  const all = await collect();
  const todo = force ? all : all.filter((b) => !sidecar[b.hash]);

  console.log(
    `${all.length} code blocks, ${all.length - todo.length} already narrated, ${todo.length} to generate.`,
  );
  if (!todo.length) return;

  // Rough, and deliberately so — it exists to stop a surprise, not to bill.
  const inputTokens = todo.reduce((n, b) => n + (SYSTEM.length + b.source.length) / 3.5, 0);
  const outputTokens = todo.reduce((n, b) => n + b.source.split('\n').length * 30, 0);
  const cost = (inputTokens / 1e6) * RATE.input + (outputTokens / 1e6) * RATE.output;
  console.log(`Estimated cost at batch rates: $${cost.toFixed(2)}`);

  if (dryRun) {
    console.log('\n--dry-run: nothing submitted. Sample prompt:\n');
    console.log(prompt(todo[0]).slice(0, 600));
    return;
  }

  const client = new Anthropic();

  const batch = await client.messages.batches.create({
    requests: todo.map((b) => ({
      custom_id: b.hash,
      params: {
        model: MODEL,
        max_tokens: 8000,
        system: SYSTEM,
        output_config: { format: { type: 'json_schema', schema: SCHEMA } },
        messages: [{ role: 'user', content: prompt(b) }],
      },
    })),
  });

  console.log(`Batch ${batch.id} submitted. Polling…`);

  let status = batch;
  while (status.processing_status !== 'ended') {
    await new Promise((r) => setTimeout(r, 20_000));
    status = await client.messages.batches.retrieve(batch.id);
    process.stdout.write(
      `\r  ${status.request_counts.succeeded} done, ${status.request_counts.processing} running, ${status.request_counts.errored} errored `,
    );
  }
  console.log('\nBatch ended. Writing sidecar…');

  let written = 0;
  const failed: string[] = [];

  for await (const result of await client.messages.batches.results(batch.id)) {
    if (result.result.type !== 'succeeded') {
      failed.push(result.custom_id);
      continue;
    }
    const message = result.result.message;
    const text = message.content.find((b) => b.type === 'text');
    if (!text || text.type !== 'text') {
      failed.push(result.custom_id);
      continue;
    }

    // Structured outputs guarantee the shape, but this file is committed and
    // read at build time — a malformed entry would break every future build,
    // so it is cheaper to drop one block than to trust the happy path.
    try {
      const parsed = JSON.parse(text.text) as { lines: { n: number; say: string }[] };
      const lines: Record<string, string> = {};
      for (const line of parsed.lines) {
        if (Number.isInteger(line.n) && typeof line.say === 'string' && line.say.trim()) {
          lines[String(line.n)] = line.say.trim();
        }
      }
      if (Object.keys(lines).length) {
        sidecar[result.custom_id] = { lines };
        written += 1;
      }
    } catch {
      failed.push(result.custom_id);
    }
  }

  // Sorted keys: the diff of a regeneration should show what changed, not a
  // reshuffle of every line in a committed file.
  const ordered: Sidecar = {};
  for (const key of Object.keys(sidecar).sort()) ordered[key] = sidecar[key];
  await fs.writeFile(SIDECAR, `${JSON.stringify(ordered, null, 2)}\n`);

  console.log(`Wrote ${written} blocks to content/narration.json.`);
  if (failed.length) {
    // Named, not swallowed: a silently short run reads as "everything is
    // narrated" on the next incremental pass, because the hashes are missing
    // and it just tries them again without anyone knowing why.
    console.log(`${failed.length} failed and were left for the next run:`);
    for (const hash of failed.slice(0, 10)) {
      console.log(`  ${hash}  ${all.find((b) => b.hash === hash)?.lesson ?? ''}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
