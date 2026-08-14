# Lesson 139 — Temperature, Top-p & Sampling

**Interview importance:** ⭐⭐⭐ — "what does temperature do?" is a near-guaranteed question, and the senior answer is *mechanism*, not marketing: it reshapes the probability distribution before sampling.

Lesson 135 said the model samples the next token from a probability distribution. This lesson is about the knobs that shape that distribution — **temperature**, **top-p**, and the sampling family around them. The whole "creativity vs determinism" story, which sounds like a vibe, is actually a precise operation: *reweight the probabilities, then sample*. Get the mechanism and the whole conversation changes register.

The distinction this lesson is built on: a **marketing-flavoured answer** says "temperature controls creativity — higher is more creative". A **mechanism-flavoured answer** says "temperature scales the logits before softmax: higher flattens the distribution so lower-probability tokens get picked more; lower sharpens it toward the most probable token; 0 makes it deterministic." The interview rewards the second one every time.

## Learning Objectives

By the end of this lesson you should be able to:

- Explain temperature as a *distribution-reshaper*, not a creativity dial
- Explain top-p as a *candidate filter*: sample only from the smallest set whose cumulative probability passes the threshold
- Contrast temperature vs top-p and know when to move each knob
- Explain what temperature 0 actually does — and what it doesn't
- Choose sampling settings for a task: deterministic extraction vs exploratory generation

## 1. One-Line Definition

**Temperature and top-p are sampling parameters that reshape the model's next-token probability distribution before a token is chosen — temperature by scaling the logits, top-p by trimming the candidate set — together turning "predict" into "predict with this much variety".**

The one-sentence interview answer: *"The model outputs a probability distribution over the vocabulary; sampling picks a token from it. Temperature scales the logits before softmax — higher flattens the distribution (more variety), lower sharpens it (more deterministic), and 0 always picks the most probable token. Top-p instead trims the candidate set to the smallest group whose cumulative probability reaches p. Same distribution, two different levers on the same choice."*

## 2. Mental Model

Think of the model as a **wheel of fortune over the vocabulary**, where each token's slice is its probability — and the two knobs reshape the wheel before you spin it.

- **Temperature** changes the *size of the slices*: high temperature evens them out (a near-even wheel, lots of variety), low temperature makes the big slice dominate (a lopsided wheel, the favourite wins).
- **Top-p** changes *how many slices are on the wheel at all*: p=0.9 keeps only the smallest set of tokens whose slices together cover 90% — the long tail of weird-but-plausible tokens is removed entirely.

```text
   The raw distribution (next token after "The capital of France is")

   token        prob     temp=0.2        temp=1.0        temp=1.5
   ─────────────────────────────────────────────────────────────
   Paris        0.91     ██████████      ██████████      ████████
   London       0.03     █▏              ███             ████
   the          0.02     █▏              ██              ███
   a            0.01     █                █              ███
   Berlin       0.01     █                █              ███
   ...
   (the rest of ~100k tokens, each tiny)

   temp 0    →  always "Paris"          (deterministic)
   temp 1.5  →  "Paris" still likely,   (more variety, more risk
                but "London" happens       of a wrong-sounding pick)
```

The same wheel, two knobs: **temperature changes the shape; top-p changes the size.**

## 3. Visual Flow — From Logits to a Sampled Token

```text
   model output: logits (raw scores, can be negative)
     Paris   3.2     London  1.1     the  0.8     a  0.4   Berlin  0.3 …
       │
       ▼
   ┌───────────────────────────────────────────┐
   │ ÷ temperature  (the "temp" knob)          │
   │   temp=0.2 → scores × 5   (sharper)       │
   │   temp=1.0 → unchanged                    │
   │   temp=1.5 → scores × 0.67 (flatter)      │
   └──────────────────┬────────────────────────┘
                      ▼
   ┌───────────────────────────────────────────┐
   │ softmax → probabilities (sum to 1)        │
   │   Paris 0.91   London 0.03   …            │
   └──────────────────┬────────────────────────┘
                      ▼
   ┌───────────────────────────────────────────┐
   │ top-p filter (optional)                   │
   │   p=0.9 → keep the smallest set whose     │
   │   cumulative prob ≥ 0.9 → cut the long    │
   │   tail of unlikely tokens                 │
   └──────────────────┬────────────────────────┘
                      ▼
   ┌───────────────────────────────────────────┐
   │ SAMPLE one token from the (filtered)      │
   │ distribution  →  "Paris" (usually)        │
   └───────────────────────────────────────────┘
```

The whole story fits in that pipeline: **temperature reweights, top-p trims, then you sample.** "Creativity" is not a mystical mode — it's this pipeline with the knobs set higher.

## 4. How It Works — The Mechanism Behind the Knobs

### Temperature

The model's final layer outputs raw scores called **logits**. Temperature divides the logits by a scalar **before** softmax:

```text
  softmax(logits / temperature)

  temperature → 0  : logits / tiny → huge gap → the top token wins almost always
  temperature = 1  : unchanged       → sample the raw distribution
  temperature → ∞  : logits / huge → all equal → uniform randomness
```

Two things are *not* what the marketing says:

- **It does not add randomness on top of a "true" answer.** It reshapes the *existing* distribution. The model already thinks Paris is 91% likely; temperature just decides whether "London" gets a shot too.
- **Temperature 0 is not "temperature 0.0 sampling".** At exactly 0, division by zero is avoided by picking the argmax — the most probable token. So temp 0 = greedy decoding = deterministic *for a given input and model* (batching/parallelism can still introduce tiny non-determinism).

### Top-p (nucleus sampling)

Instead of touching the probabilities, top-p **cuts the candidate set**: sort tokens by probability, keep adding the most-likely ones until their cumulative probability reaches p, and sample only from that set. The tail of a thousand tiny-probability tokens is removed — which is exactly where the weird, off-brand, hallucination-flavoured picks live.

- `p=1.0` → keep everything (no filter).
- `p=0.9` → keep the "nucleus" that covers 90% — usually a handful of tokens.
- `p=0.5` → keep only the very top tokens; close to greedy.

### Why the knobs differ

Temperature reshapes *weights*, so it can still pick a long-tail token. Top-p removes the long tail *entirely*. They compose: typical setups set both (e.g. `temperature=0.7, top_p=0.9`), each doing a different job on the same distribution.

> [!NOTE]
> **There are more samplers (top-k, frequency penalties, min-p), and you mostly don't need them by name.** The interview-relevant family is temperature (shape), top-p (set size), and the penalties (L142 touches on them). Know the mechanism of these three and you can reason about the rest on sight.

## 5. Real Project Usage

- **Extraction and classification → low temperature, often 0.** When the answer must be a fact or a label ("is this email a refund request?"), you want greedy, deterministic picks. Temp 0 + structured outputs (L143) is the default for machine-facing tasks.
- **Chat and creative generation → moderate temperature (0.6–1.0).** You want natural, non-repetitive text, but not chaos. Most chat products sit around 0.7–1.0.
- **Brainstorming and exploration → higher temperature.** Divergent ideas, alternative phrasings, "give me ten options" — the flatter distribution is the point.
- **Code generation → low temperature.** Code has a right answer most of the time; you want the most probable continuation, not variety. (This is why "AI writes better code with temp 0.2" is a real, reproducible finding.)
- **Evaluation and evals → set it once, or test it.** A comparison that uses different sampling settings isn't comparing the models (L343). Pin the settings in your eval harness.

## 6. Interview Explanation

Say it in four moves:

1. **The pipeline.** "The model outputs a probability distribution over the vocabulary; sampling picks one token. Temperature and top-p both reshape that distribution before the pick."
2. **Temperature.** "It divides the logits before softmax. High flattens the distribution → more variety; low sharpens it → the favourite wins; exactly 0 is greedy — always the argmax."
3. **Top-p.** "It trims the candidate set — keep the smallest set whose cumulative probability reaches p. It removes the long tail of unlikely tokens, which is where bad picks live."
4. **The practice.** "For extraction and code I use temp 0 and structured outputs. For chat, 0.7–1.0. For ideation, higher. And I pin the settings in evals, because a comparison that moves the knobs isn't comparing the models."

## 7. Senior-Level Insights

- **Sampling is where non-determinism enters — and where you control it.** The model itself is deterministic given the input; sampling is the deliberate random step. "Why did it give a different answer?" is *usually* answered by "because you sampled twice", not "because the model is unpredictable".
- **Temperature 0 is the hidden default in production.** For any system where the output feeds code (tools, extraction, structured data), greedy + structured outputs (L143) is the reliability play. Variety is a product feature you *opt into*.
- **The knobs are task-shaped, not model-shaped.** The right setting is a property of the *task* (fact → 0; creative → higher) — a senior answer names the task first, then the setting.
- **Penalties are prompt-adjacent, not sampling-adjacent.** Repetition penalties and similar (L142) steer the *content*, while temperature/top-p steer the *distribution*. Keeping those two layers separate in your head makes every tuning conversation clearer.

## 8. Common Mistakes

- **Saying temperature "adds creativity".** It reshapes an existing distribution; the "creativity" is the model's learned probability of unusual continuations, amplified by flattening.
- **Using temperature for determinism.** Temperature 0 gives greedy sampling for a given input — but the input includes batching and floating-point order; and for *true* reproducibility you pair it with structured outputs (L143) and pinned settings.
- **Setting both knobs high "for safety".** Temperature and top-p do different jobs; maxing both is not "safe mode", it's "random mode". Use them deliberately, or set one and leave the other at its default.
- **Believing a low temperature prevents hallucinations.** It prevents *sampling variety*; a confidently-wrong distribution still samples confidently-wrong at temp 0 (that's exactly why grounding matters, L191).
- **Comparing models with different sampling settings.** The eval is measuring the knobs, not the model (L343).

## 9. Best Practices

- **Default to temperature 0 for anything machine-facing** (tools, extraction, structured output, code). Add variety only when the *product* needs it.
- **Reserve output tokens accordingly.** A low-temperature "give me one answer" prompt should be short; a high-temperature "give me ten ideas" prompt needs budget for ten.
- **Document your sampling settings in the request.** If you change them per feature, write it down — it's a reproducibility fact, not a detail.
- **Test at the edges.** Pin one prompt and run it at temp 0, 0.7, 1.5 — see *what actually changes* in your domain. That beats any rule of thumb.
- **Never tune temperature to fix a content problem.** Wrong output = prompt/grounding problem (L142, L191); temperature is a distribution knob, not a correctness knob.

## 10. Interview Questions

**Q: What does temperature do, mechanically?**
> A: It divides the logits by a scalar before softmax. A high temperature flattens the probability distribution, so lower-probability tokens get sampled more often; a low temperature sharpens it toward the most probable token. At exactly 0, it's greedy — always the argmax.

**Q: What's the difference between temperature and top-p?**
> A: Temperature reshapes the distribution by reweighting; top-p trims the candidate set to the smallest group whose cumulative probability reaches p. Temperature can still pick a long-tail token; top-p removes the long tail entirely. They operate on the same distribution but do different jobs, and they compose.

**Q: Is temperature 0 fully deterministic?**
> A: For a given input and model, yes — it's greedy decoding. In practice there can be tiny non-determinism from batching or floating-point order, so if I need strict reproducibility I also pin the input, the model version, and structured outputs.

**Q: What temperature would you use for a production extraction task?**
> A: Temperature 0, with structured outputs if available. Extraction has a right answer; I want the most probable tokens, not variety. I'd reserve higher temperatures for chat and ideation, where variety is the point.

## 11. Follow-Up Questions

- What's the difference between temperature and a repetition penalty?
- Why does code generation generally want a low temperature?
- How would you test whether a temperature change actually improved a system?
- What is top-k, and how does it relate to top-p?
- Can temperature make a model *more* hallucination-prone — and why?

## 12. Comparison Table — Sampling Knobs

| Knob | What it changes | Mechanism | Typical range | Best for |
|---|---|---|---|---|
| **Temperature** | shape of the distribution | scales logits before softmax | 0–1.5 | determinism vs variety |
| **Top-p** | size of the candidate set | keeps the nucleus covering p | 0.5–1.0 | cutting the weird tail |
| **Top-k** | count of candidates | keep the k most likely | 10–100 | hard cap on variety |
| **Repetition penalty** | discourages repeats | scales already-seen tokens | 1.0–1.5 | fluency, less looping |

The senior read: **temperature = shape, top-p = size, penalties = content** — three different layers on the same sampling step, and each one is tuned for a task reason, not a vibe.

## 13. Code Example — Sampling Settings in a Real Request

```js
// The knobs, set deliberately per task — not "creative mode" vibes.

const { OpenAI } = require('openai');
const openai = new OpenAI();

// 1 · Extraction — the answer feeds code. Greedy + tight.
async function extractLabel(text) {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Classify as refund|billing|other. One word.' },
      { role: 'user', content: text },
    ],
    temperature: 0,            // greedy — the most probable label
    max_tokens: 5,             // a label, not an essay
  });
  return res.choices[0].message.content;
}

// 2 · Chat — natural, non-repetitive. Moderate.
async function chat(reply) {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: reply }],
    temperature: 0.8,          // variety, without chaos
    top_p: 0.9,                // cut the weird tail
  });
  return res.choices[0].message.content;
}

// 3 · Ideation — variety is the point. High.
async function brainstorm(topic) {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'user', content: `Give 10 product names for: ${topic}` },
    ],
    temperature: 1.2,          // flatter → more diverse picks
    max_tokens: 300,
  });
  return res.choices[0].message.content;
}
```

```text
What the reader must SEE — the settings are a decision, not a default:

  extraction  temperature: 0      → one label, the most probable
  chat        temperature: 0.8    → variety without chaos
  ideation    temperature: 1.2    → diversity is the point
```

```narrate
9-10: Extraction defaults to greedy — a label has a right answer, so we never sample variety.
16-17: Chat sits at a moderate temperature: natural variety, trimmed tail via top-p.
27-28: Ideation flattens the distribution on purpose — diverse candidates are the product.
```

> [!TIP]
> The same three tasks in the same file is the whole lesson: **the knob is chosen by the task's need for variety, never by a global "AI setting".** Change the task, change the knob, say why.

## 14. Performance Notes

- **Sampling is nearly free.** The knobs act on the final logits — a tiny step compared to the forward passes (L136). Tuning them costs you *development* time, not *inference* time.
- **Temperature 0 is *faster to reason about*, not faster to run.** Greedy saves nothing measurable; the win is determinism, not speed.
- **Long high-temperature outputs drift.** The flatter the distribution, the more the generation can wander over many tokens — budget `max_tokens` generously or the drift gets cut mid-sentence (L135, L145).
- **The same model, the same prompt, different settings = different outputs.** If you A/B two prompts and the settings differ, you've confounded the test (L343).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Answer varies run-to-run and you want it stable | Sampling variance (this is normal) | temperature 0; consider structured outputs (L143) |
| Output repeats or loops | Distribution too flat, or a repetition loop (L135) | Lower temperature; add repetition penalty; shorten the loop |
| Output is a weird token you never wanted | The long tail got sampled | Lower top-p to cut the tail; temperature 0 for machine-facing work |
| Different answers in "same" test | Batching/order or settings differ | Pin model + settings + input; rerun |
| Creative task feels flat / repetitive | Temperature too low for the task | Raise temperature; or raise top-p, not both blindly |

## 16. Quick Revision Notes

- The model outputs a **distribution**; sampling picks a token; the knobs reshape the distribution first.
- **Temperature** divides logits before softmax: high = flatter (variety), low = sharper, **0 = greedy argmax**.
- **Top-p** keeps the smallest candidate set whose cumulative probability ≥ p — it cuts the long tail.
- **Temperature = shape, top-p = size, penalties = content** — three layers on one step.
- Extraction/code → **temp 0**; chat → **0.7–1.0**; ideation → **higher**. Task first, knob second.
- Low temperature is **not a hallucination cure** — it's a variety reducer (grounding is the cure, L191).

## 17. Cheat Sheet

```text
SAMPLING = pick a token from the distribution

  logits → (÷ temperature) → softmax → (top-p filter) → sample

TEMPERATURE (shape)
  → 0      greedy argmax      deterministic, for a given input
  = 1      raw distribution   the default sampling
  → ∞      uniform            pure randomness

TOP-P (size)
  p=1.0    keep everything
  p=0.9    keep the nucleus covering 90%
  p=0.5    close to greedy

TASK → SETTING
  extraction / code    temperature 0
  chat                 temperature 0.7-1.0, top-p ~0.9
  ideation             temperature 1.0-1.5

THREE LAYERS
  temperature  shape of the distribution
  top-p        size of the candidate set
  penalties    content (repetition, frequency)

TRAPS
  "creativity dial"     → it's a distribution reshaper
  "low temp = no hallucination" → it reduces variety, not error
  "max both knobs"      → random mode, not safe mode

INTERVIEW, 4 MOVES
  1 pipeline "distribution → reshape → sample"
  2 temp     "scales logits, 0 = greedy"
  3 top-p    "trims the candidate set"
  4 practice "task first: 0 for facts, higher for variety"
```

## 18. Key Takeaways

> [!RECAP]
> - Temperature and top-p are **distribution-shapers on the sampling step** — the mechanism behind "creativity vs determinism"
> - **Temperature scales the logits** before softmax: high flattens (variety), low sharpens, **0 is greedy**
> - **Top-p trims the candidate set** to the nucleus covering p — it removes the long tail where bad picks live
> - **Temperature = shape, top-p = size, penalties = content** — three different levers, each with its own job
> - The setting is **task-shaped**: facts and code want 0, chat wants 0.7–1.0, ideation wants higher
> - Sampling is **where non-determinism enters** — which means it's where you *control* it, not where you fear it

## Check your understanding

Answer these without looking back.

1. Mechanically, what does temperature do — before softmax or after?
2. What does temperature 0 actually produce, and why is it not "temperature 0.0 sampling"?
3. Explain top-p in one sentence. What does it remove?
4. What's the difference between "temperature reshapes" and "top-p trims"?
5. Name the three task→setting pairs (extraction, chat, ideation).
6. Why does a low temperature not cure hallucinations?
7. If your extraction output keeps changing, what's the fix — and what's the *limitation* of that fix?
8. Why must an eval comparison pin its sampling settings?

## A Closing Note — The Knob Is a Mechanism

You now know the single most-misdescribed knob in AI, mechanically: *temperature reshapes the distribution, top-p trims it, and then you sample.* When an interviewer hears "temperature scales the logits before softmax — so it's a distribution knob, not a creativity dial", they stop checking whether you've used ChatGPT and start checking whether you can build with it. The rest of the module builds on exactly this precision: prompt engineering (L142) steers *what* the distribution is over, structured outputs (L143) make the sample *usable*, and hallucination (L141) is what happens when the distribution is confident *and wrong*.

Next: what the model can actually do — capabilities, and the honest limits of the tool you're choosing.
