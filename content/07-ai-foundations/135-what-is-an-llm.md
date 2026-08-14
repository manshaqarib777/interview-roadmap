# Lesson 135 — What an LLM Is

**Interview importance:** ⭐⭐⭐⭐ — the single most-asked opening question in every AI interview, and the hook every later lesson hangs on.

This is the first lesson of the AI half of the roadmap, and it is deliberately the smallest idea in it: **a large language model is a machine that predicts the next token.** Everything else — context windows, hallucinations, temperature, tool calling, agents, cost — is a consequence of that one sentence. Get this sentence right and the rest of the module is detail; get it wrong and every later mechanism sounds like magic.

The distinction this lesson is built on: an **AI-curious developer** knows what an LLM *is* from using ChatGPT. A **solutions architect** can explain what it *does* — autocomplete at massive scale — and can point at exactly which properties of that autocomplete make it powerful, which make it dangerous, and which make it expensive.

## Learning Objectives

By the end of this lesson you should be able to:

- Define an LLM in one sentence: next-token prediction, trained on a large text corpus
- Explain "large", "language", and "model" separately, so the acronym is unpacked
- Trace the three phases: pretraining, fine-tuning, inference
- Explain why an LLM is stochastic — sampling from a probability distribution, not retrieving an answer
- Separate the syntax specialist from the senior engineer in any of the above

## 1. One-Line Definition

**A large language model (LLM) is a neural network trained to predict the next token in a sequence of text, at a scale where that simple objective produces a system that can follow instructions, answer questions, write code, and reason.**

The one-sentence interview answer: *"An LLM is a next-token predictor: given a sequence of tokens, it assigns a probability to every possible next token and samples one. Trained on enough text — terabytes, trillions of tokens — that humble objective is sufficient to produce a system that can converse, summarise, code, and reason. It is autocomplete at the scale of the internet."*

## 2. Mental Model

Think of an LLM as **autocomplete, blown up to internet scale and given a chat-shaped interface.**

You have used autocomplete your whole life: your phone suggests the next word, your editor suggests the next line. The mechanism is the same — *given what you've written, what comes next?* — but the scale is different in four ways that change the character of the thing:

| Autocomplete | LLM |
|---|---|
| predicts the next *word* from a local context | predicts the next *token* from up to 200,000 tokens of context |
| trained on your typing | trained on trillions of tokens of the public internet |
| a handful of candidate words | a probability distribution over ~100,000–200,000 token types |
| you ignore it | you trust it — which is the danger |

The model does not "know" anything, in the sense a database knows. It does not retrieve. It *continues the pattern*. When it answers a question about the French Revolution, it is not looking the answer up — it is generating the most probable continuation of a text that *looks like* a helpful answer to that question. The fact that it is usually right is a property of the training data, not of a lookup table.

## 3. Visual Flow — What Happens Inside One Generation

```text
  "The capital of France is"
            │
            ▼
  ┌────────────────────────────────────────┐
  │ TOKENIZER splits input into tokens     │
  │  ["The", " capital", " of", " France", │
  │   " is"]                               │
  └──────────────────┬─────────────────────┘
                     ▼
  ┌────────────────────────────────────────┐
  │ TRANSFORMER computes a probability     │
  │ distribution over the vocabulary:      │
  │                                        │
  │   Paris        ██████████  0.91         │
  │   London       ███         0.03         │
  │   the          ██          0.02         │
  │   a            █           0.01         │
  │   Berlin       █           0.01         │
  │   ...          (100k more)              │
  └──────────────────┬─────────────────────┘
                     ▼
  ┌────────────────────────────────────────┐
  │ SAMPLER picks one token — usually      │
  │ the most probable, sometimes not       │
  │  → "Paris"                             │
  └──────────────────┬─────────────────────┘
                     ▼
  "The capital of France is Paris"
            │
            ▼
   repeat: append the token, predict the next…
   …until an end-of-generation marker is produced
```

The loop is the whole model. There is no step where it "checks the answer". There is only *predict, sample, append, repeat* — and the stunning fact is that this loop, at scale, is enough.

## 4. How It Works — The Three Phases

An LLM you use today is the product of three distinct phases:

### Phase 1 — Pretraining (the expensive one)

Feed the model trillions of tokens of text — the public internet, books, code, Wikipedia — and train it to predict the next token. The model learns *patterns*: grammar, facts, reasoning structure, style. This phase costs millions of dollars in GPUs and takes months. What comes out is a **base model**: a very good text-continuation machine that does not yet follow instructions.

### Phase 2 — Fine-tuning (the "make it useful" one)

Take the base model and continue training it on a much smaller, curated set of *instruction-response pairs* ("What is the capital of France?" → "Paris."). This is how a text-predictor becomes a chatbot: it learns the *shape* of a helpful answer. Without this phase, GPT-3 was a text-completion API; with it, ChatGPT became a product.

### Phase 3 — Inference (what you pay for)

The trained model is deployed, and every prompt you send runs the same next-token loop — but now the weights are frozen. This is the phase that costs you per-token prices, and it is the only phase your code ever talks to.

```text
   Pretraining            Fine-tuning            Inference
   ┌─────────────┐        ┌──────────────┐       ┌──────────────┐
   │ trillions of│        │ thousands of │       │ your prompt  │
   │ internet    │  ───▶  │ instruction  │  ───▶ │ + model      │
   │ tokens      │        │ response     │       │ + sampled    │
   │ ($$$)       │        │ pairs ($$)   │       │ tokens ($)   │
   └─────────────┘        └──────────────┘       └──────────────┘
      "learns to            "learns to            "generates the
       predict text"         follow instructions"  answer"
```

> [!NOTE]
> You will hear "foundation model" and "frontier model". A **foundation model** is a large pretrained model that others build on (fine-tune, wrap, prompt). A **frontier model** is the current state-of-the-art from the big labs — OpenAI, Anthropic, Google — the models that set the benchmark. Both are LLMs; the words point at *role* and *recency*, not mechanism.

## 5. Real Project Usage

- **Every ChatGPT / Claude / Gemini conversation you've had.** The chat UI hides the loop: your message is the prefix, and the model completes it token by token until it decides to stop.
- **Copilots and code completion.** GitHub Copilot, Cursor, the AI features in editors — all of them are the same next-token loop with a different prompt and a different fine-tune.
- **Search and summarisation.** "Summarise this document", "extract the action items" — the model is not retrieving, it is *generating* a text that matches the pattern "here is a summary".
- **The products you will build.** Every AI feature in your next app — chat, autocomplete, extraction, classification, agent loops — runs this same loop under the hood. The entire AI half of this roadmap is about shaping that loop with prompts, context, tools, and evals.

## 6. Interview Explanation

Say it in four moves, each one a sentence:

1. **The mechanism.** "An LLM is a next-token predictor — given a sequence, it assigns probabilities to the next token and samples one."
2. **The scale.** "It's trained on trillions of tokens of text, which is why the prediction is usually *right* — it has effectively memorised the patterns of the internet."
3. **The consequence.** "Because it predicts rather than retrieves, it can produce plausible text that is *false* — that's the source of hallucination, and of why we design with verification in mind."
4. **The follow-through.** "And because it generates one token at a time, cost and latency scale with output length — that's why we budget tokens and stream responses."

That four-move shape — mechanism, scale, consequence, follow-through — is the senior answer. The specialist answers the first move and stops.

## 7. Senior-Level Insights

- **The next-token objective is the whole story.** Every limitation of an LLM — hallucination, weak arithmetic, the "doesn't know what it doesn't know" problem — is a direct consequence of *predicting text* rather than *consulting a model of the world*. Say that and you've answered half the follow-ups in this module.
- **"Large" is doing real work.** Scale is not a cosmetic detail: the same objective that fails at 10M parameters produces reasoning-like behaviour at 100B+. The field's bet is that prediction, at enough scale, yields competence.
- **The stochasticity is a feature, then a bug.** Sampling (L139) is what makes the model able to be creative and to be steered by temperature — and it's what makes outputs non-deterministic and therefore hard to test. Architects budget for both.
- **Inference, not training, is what you'll spend.** Training is the lab's cost. Your cost — per token, per request, per month — is inference. That is the number every cost model in this roadmap computes.

## 8. Common Mistakes

- **Saying the model "knows" or "remembers" things.** It doesn't store facts; it reproduces patterns. The distinction matters because it explains both the strengths (fluency) and the failure modes (confidently wrong).
- **Treating the model as a retrieval system.** Asking "why did it give the wrong answer?" and expecting a lookup bug. It's a *generation* bug: the most probable continuation was wrong.
- **Forgetting the loop is token-by-token.** "Why is it slow?" Because it's doing a full neural-network forward pass *per token* — a 500-word answer is 500 sequential passes.
- **Assuming the model "decided" to stop or "chose" to be verbose.** Stopping is just the model emitting an end-of-sequence token; length is a consequence of the prompt, the sampling, and the training.

## 9. Best Practices

- **Always design as if the model is a stochastic autocomplete** — never as a database or a deterministic function. That framing drives every good decision in this module.
- **State the mechanism before the marketing** in any explanation. "Next-token prediction" before "AI assistant".
- **Budget for repetition.** Because the loop appends and repeats, long generations can loop or drift; structure prompts and outputs (L142–L143) to keep the generation on rails.
- **Learn the token, not the word.** Tokenization (L137) is the unit of cost, context, and generation — think in tokens from day one.

## 10. Interview Questions

**Q: What is a large language model, in one sentence?**
> A: A neural network trained to predict the next token in a sequence of text, at a scale where that simple objective produces a system that can follow instructions, answer questions, write code, and reason.

**Q: How does an LLM "know" things — is it a database?**
> A: It doesn't store facts like a database. It has learned patterns from training data, and it *generates* the most probable continuation of a prompt. When it's right, it's because the training data contains the pattern; when it's wrong, it's because the most probable continuation was wrong. There is no lookup, no retrieval, no "memory" in the database sense.

**Q: Why is an LLM stochastic — why isn't the same prompt giving the same answer?**
> A: The model produces a probability distribution over the next token, and sampling picks one. Temperature and top-p (L139) shape that distribution; even at temperature 0 there can be non-determinism. So the same prompt can produce different-but-equally-plausible continuations.

**Q: What's the difference between a base model and a fine-tuned model?**
> A: A base model is pretrained on raw text and is a text-continuation machine; a fine-tuned model has been further trained on instruction-response pairs so it follows instructions and answers in a helpful shape. ChatGPT is GPT fine-tuned for chat; the API exposes both options.

## 11. Follow-Up Questions

- What is a token, and why does the model predict tokens rather than characters or words?
- Why does a larger context window (L138) change what the model can do?
- Where does hallucination come from, given that the model only "predicts text"?
- If the model is stochastic, how do you test it?
- What makes an LLM "large" — and what does scale buy you?

## 12. Comparison Table — LLM vs the Things It Gets Confused With

| | LLM | Search engine | Database | Rule-based system |
|---|---|---|---|---|
| Mechanism | next-token prediction | keyword/relevance matching | exact query | explicit rules |
| Knows facts | pattern-reproduction | indexed documents | stored rows | encoded in rules |
| Can be wrong | yes, fluently | yes, if sources wrong | no (by design) | no (by design) |
| Handles novel phrasing | yes | poorly | no | no |
| Gives sources | no (by default) | yes | yes | no |
| Cost model | per token | per query (cheap) | per query (cheap) | per query (cheap) |
| Failure mode | hallucination | irrelevant results | empty/error | unmatched input |

The table is the interview: each column is a *different contract* with the user, and the senior answer is "pick the contract you need" — not "use AI for everything".

## 13. Code Example — Seeing the Loop with a Real API

The shape of an LLM call is the same across providers (L152–L154 go deep). This is the minimum viable version — a prompt in, a generated continuation out:

```js
// The minimal LLM call — one prompt, one sampled completion.
// Every AI feature you build is this loop, dressed differently.
const { OpenAI } = require('openai');
const openai = new OpenAI(); // reads OPENAI_API_KEY

async function complete(prompt) {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',              // the small, cheap model
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 200,                    // budget the output (L149)
    temperature: 0.7,                   // shape the distribution (L139)
  });
  return res.choices[0].message.content;
}

complete('The capital of France is')
  .then((answer) => console.log(answer));
// → "Paris." (probably — this is a sample, not a lookup)
```

```text
What the reader must SEE — the loop, outside the API:

  prompt: "The capital of France is"
    → tokenize → forward pass → distribution over 100k+ tokens
    → sample "Paris" → append → forward pass → sample "."
    → append → sample "<end-of-generation>"
    → stop. Return "Paris."
```

```narrate
4: The SDK constructor reads the API key from the environment — the secret never lives in your code.
7-12: One chat-completions call is one run of the loop: model, messages, output budget, sampling knob.
13: The answer comes back as a sampled completion — a plausible continuation, not a lookup result.
```

> [!TIP]
> Run this with a real key once, then run the *same prompt* ten times and watch the answers vary. That variance is the whole lesson: the model is sampling a distribution, not returning a record.

## 14. Performance Notes

- **Latency scales with output length.** One forward pass per token; a 500-token answer needs 500 sequential passes. This is the fundamental latency law of LLMs (deep-dived in L145 and L151).
- **Input tokens are cheaper than output tokens** — at most providers, 3–5× cheaper. That asymmetry drives prompt design: put the expensive work in the input, keep the output tight.
- **Batch and cache** to amortise: prompt caching (L171) makes repeated prefixes cheap, and batching many requests into one call is the provider-side cost lever.
- **The model is the hot path.** A single LLM call can take seconds; treat it like a network call to an unreliable service, not like a function call. That shapes every architecture decision in this module.

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| The answer is confident and wrong | The most probable continuation was wrong — sampling picked a bad region | Rephrase the prompt; add grounding (L191); lower temperature |
| The same prompt gives different answers | Sampling variance (this is *normal*) | Decide whether you need determinism; if so, temperature 0 + structured outputs (L143) |
| The model repeats itself or loops | The loop drifted into a self-reinforcing pattern | Truncate history; add explicit "stop" instructions; check max tokens |
| The answer stops mid-sentence | `max_tokens` cut the generation off | Raise the budget or make the prompt demand a short answer |
| The model answers a different question | The prompt's question was ambiguous | Rewrite the prompt to be explicit about scope (L142) |

## 16. Quick Revision Notes

- An LLM is **next-token prediction at internet scale** — autocomplete, not retrieval, not a database.
- Three phases: **pretraining** (text patterns, $$$) → **fine-tuning** (instruction-following, $$) → **inference** (your per-token cost, $).
- The generation loop: **tokenize → predict a distribution → sample → append → repeat** until an end token.
- It is **stochastic by construction** — sampling, not selecting. Determinism is something you *impose* (L139, L143).
- Hallucination is the **predict-rather-than-retrieve** failure mode, and it's by design.
- Output tokens are **the expensive and slow part** — budget and stream.

## 17. Cheat Sheet

```text
LLM = next-token predictor, trained at scale

LOOP
  tokenize → predict distribution → sample → append → repeat
  stop when the model emits <end-of-sequence>

PHASES
  pretraining   trillions of tokens, learns patterns    $$$  (labs)
  fine-tuning   instruction pairs, learns to help       $$   (labs)
  inference     your prompt → sampled answer            $    (you pay)

PROPERTIES
  stochastic    same prompt, different answers  → sampling
  non-retrieval it continues patterns, it doesn't look up
  fluent-wrong  hallucination is the design's default failure
  per-token     cost & latency scale with output length

INTERVIEW, 4 MOVES
  1 mechanism   "next-token prediction"
  2 scale       "trillions of tokens → usually right"
  3 consequence "predicts, so it can be fluently wrong"
  4 follow-through "token cost, streaming, budgeting"
```

## 18. Key Takeaways

> [!RECAP]
> - An LLM is **a machine that predicts the next token**, trained on trillions of tokens of text — and that single objective, at scale, is enough to produce instruction-following, reasoning, and coding
> - The generation loop is the whole model: **tokenize → predict → sample → append → repeat** until an end token
> - It is **autocomplete, not retrieval** — the "knowledge" is pattern reproduction, which is why it can be fluently wrong
> - Three phases: **pretraining** (expensive, learns patterns), **fine-tuning** (learns to help), **inference** (what you pay for, per token)
> - It is **stochastic by construction** — sampling a distribution, so determinism must be imposed deliberately
> - Every AI product you will build is this loop shaped by prompts, context, tools, and evals — the rest of this module is the shaping

## Check your understanding

Answer these without looking back.

1. Define an LLM in one sentence — mechanism first, not marketing.
2. What does each word in "large language model" contribute? Unpack the acronym.
3. Trace one generation end to end: what happens between the prompt and the answer?
4. Name the three phases, what each one costs, and which one your code talks to.
5. Why can the model be confidently wrong? Where does hallucination come from?
6. Why does the same prompt give different answers?
7. Why does cost scale with *output* length and not (only) input length?
8. What is the difference between the syntax specialist and the senior engineer in this lesson?

## A Closing Note — The One Sentence to Keep

Keep this one sentence with you for the whole AI half of the roadmap: **the model predicts the next token; everything else is engineering.** Context limits, cost, latency, hallucination, tool calling, agents — every lesson after this one is a consequence of that sentence, and every interview answer that starts from it sounds senior. When you can explain why that sentence makes temperature a sampling knob (L139), context a budget (L138), and grounding a verification problem (L191), the foundation is yours — and the next lesson, the transformer, is the mechanism that makes the sentence true.
