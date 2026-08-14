# Lesson 137 — Tokens & Tokenization

**Interview importance:** ⭐⭐⭐⭐ — tokens are the unit of *everything* in LLM economics: context, cost, latency, and output budgets. Every "how much will this cost?" question in an AI interview is a token question.

Lesson 135 said the model predicts the **next token**; lesson 136 said it does so with **attention**. This lesson is about the token itself — the unit the model actually reads and writes. You cannot budget context (L138), estimate cost (L150), or reason about latency (L151) until you can count tokens in your head, and you cannot count tokens until you know what they are.

The distinction this lesson is built on: a **user** thinks an LLM reads words. A **solutions architect** knows it reads *tokens* — sub-word fragments that are shorter than words for common text and longer than words for rare text — and that every design decision from prompt length to price is denominated in them.

## Learning Objectives

By the end of this lesson you should be able to:

- Define a token: a sub-word unit the model reads and writes, from a fixed vocabulary
- Explain why tokenization exists: a fixed-size vocabulary over an open-ended language
- Estimate tokens in your head: ~4 characters, ~0.75 words, ~1.3 tokens per word (English)
- Explain why tokens differ across languages and why it matters for cost and fairness
- Count tokens accurately with the provider's tokenizer (and know where your estimate is wrong)

## 1. One-Line Definition

**A token is the unit of text that a language model reads and writes: a sub-word fragment from a fixed vocabulary of tens of thousands of entries, into which every input is split and out of which every output is assembled.**

The one-sentence interview answer: *"A token is the atomic unit of an LLM — the model doesn't read characters or whole words, it reads a vocabulary of sub-word fragments, usually a few characters long. 'ChatGPT' is one token, 'unbelievable' is three. Everything the model does — context, cost, latency — is measured in tokens."*

## 2. Mental Model

Think of tokens as **sub-word Lego bricks** — a fixed set of pieces the model knows, out of which it builds any word.

The trick is that the pieces are *not* uniform. Common words and word-parts get their own brick; rare words get snapped together from smaller bricks:

```text
   "ChatGPT is unbelievable!"

   ChatGPT        is        un        believ        able        !
   └──1──┘      └─1─┘     └─1─┘      └─1─┘        └─1─┘      └─1─┘
   (1 token)    (1 token)  ────── 4 tokens ──────       (1 token)

   total: ~6 tokens for 25 characters
```

The model's vocabulary is the set of bricks it knows — typically **100,000–200,000 tokens** for a frontier model. Text is *tokenized* (split into bricks) before the model sees it, and the model's output is a stream of bricks *detokenized* back into text you can read.

The density varies wildly:

| Text | Tokens per word (approx) |
|---|---|
| Common English | 1.0–1.5 |
| Average English | ~1.3 |
| Code (dense symbols) | 1.5–3.0 |
| Rare words / names | 2–5 |
| Non-Latin scripts (CJK, Thai) | 1–2 per *character* |

That last row is the one that bites: **tokenization is not language-neutral**, and it drives a real cost difference.

## 3. Visual Flow — From Prompt to Tokens to Prediction

```text
  Your prompt (text)
    "Explain the event loop in one paragraph."
            │
            ▼
  ┌───────────────────────────────────────┐
  │ TOKENIZER  (a deterministic function) │
  │  split text into known sub-word units │
  │                                       │
  │  "Explain"   → 1 token                │
  │  " the"      → 1 token                │
  │  " event"    → 1 token                │
  │  " loop"     → 1 token                │
  │  " in"       → 1 token                │
  │  " one"      → 1 token                │
  │  " paragraph"→ 1 token                │
  │  "."         → 1 token                │
  └──────────────────┬────────────────────┘
                     ▼
        token ids: [2345, 891, 2041, 3090, 415, 905, 14230, 13]
                     │
                     ▼
  ┌───────────────────────────────────────┐
  │ THE MODEL (transformer, L136)        │
  │  predicts the next token id, one     │
  │  at a time, from the vocabulary      │
  └──────────────────┬────────────────────┘
                     ▼
        output token ids → DETOKENIZER
                     │
                     ▼
  "The event loop is how JavaScript…"
```

Note the asymmetry: **tokenization is deterministic** (the same text always gives the same tokens — you can count them), while **generation is stochastic** (L135). That's why you can estimate cost reliably and answers less so.

## 4. How It Works — Why Sub-Word Units?

Why not characters, and why not words?

- **Characters are too small.** The model would have to learn spelling from scratch; sequences get long; attention cost (L136's O(n²)) explodes.
- **Words are too many.** There are infinitely many words — names, compounds, typos, new terms. A word-level vocabulary can't cover the open world.
- **Sub-word units are the compromise.** A fixed vocabulary (~100K) covers essentially all text, because anything unseen gets broken into pieces that *are* in the vocabulary.

The standard algorithm is **BPE (Byte-Pair Encoding)**, trained on the corpus: it iteratively merges the most frequent adjacent pairs of characters into a new unit, until it reaches the target vocabulary size. The result is a vocabulary full of common fragments ("ing", "tion", " the") that recur across words.

> [!NOTE]
> **Counting rule of thumb that works.** For English text, ~4 characters per token, or ~0.75 words per token, or ~1.3 tokens per word. For code and punctuation-heavy text, add 30–50%. For non-Latin scripts, the "per character" density means the estimate can be 2–4× the English figure. When a number matters (cost, context), always verify with the provider's tokenizer — every provider ships one (L152–L154).

## 5. Real Project Usage

- **Every cost estimate you will ever make.** Prices are per 1M tokens. "How much is this RAG pipeline?" starts with "how many tokens are in the average document?" — you now have the conversion.
- **Every context budget.** A 128K context window is 128K *tokens*. Sending a 10-page PDF is ~15K tokens; a 100K-token codebase dump is a real chunk of the budget (L138, L149).
- **Every output limit.** `max_tokens` is denominated in tokens; "write a summary in 100 words" needs ~130 tokens of headroom.
- **Retrieval chunking.** RAG chunk sizes (L178) are usually specified in tokens (e.g. "chunks of 500 tokens with 50 overlap") — because the *model's* processing unit is the token, not the character.
- **Billing and abuse.** Providers bill on token counts; abuse limits (L318) are token-rate limits; caching (L171) is priced by cached token counts.

## 6. Interview Explanation

Say it in four moves:

1. **The unit.** "A token is the atomic unit of an LLM — a sub-word fragment from a fixed vocabulary of ~100K–200K entries. The model reads and writes tokens, not characters or words."
2. **The reason.** "Characters are too fine and words too infinite; sub-word units give a fixed vocabulary that still covers everything, via Byte-Pair Encoding."
3. **The numbers.** "Roughly 0.75 words per token in English, ~4 characters per token. Code is denser, CJK can be 1–2 tokens per character."
4. **The consequence.** "So context, cost, and latency are all token problems — which is why every serious design starts by counting tokens, and verifies with the provider's tokenizer."

## 7. Senior-Level Insights

- **The token is the "CPU instruction" of LLM economics.** Just as you reason about query cost and execution time per instruction in a database, an AI architect reasons about *tokens per request*. Everything downstream — cost (L150), latency (L151), caching (L171), rate limits (L318) — is denominated in it.
- **Tokenization is a *trained* artifact, not a standard.** The vocabulary is learned from the training corpus. It's why "chat" and "ChatGPT" tokenize differently, and why a name can be 1 token or 5. It also means the *same text* tokenizes differently across models — never assume portability of token counts.
- **Token bias is a real, quantified cost.** English-heavy corpora mean English is cheap; many non-Latin languages cost 2–4× per word. That's a product decision — for a global app, token cost is *not* language-neutral, and it lands on the user or the margin.
- **Token counts are deterministic — use them.** Inputs can be counted exactly before you send them; that's what makes token budgeting (L149) an engineering discipline rather than a guess.

## 8. Common Mistakes

- **Assuming 1 token = 1 word.** It's ~0.75 words on average in English, and wildly variable for code and non-Latin scripts. "100 words" is not "100 tokens".
- **Counting characters instead of tokens.** A 1000-character prompt is not 1000 tokens — it's ~250. But a 1000-character CJK string can be ~1000.
- **Trusting your estimate for cost.** Estimates are for *sanity*; the provider's tokenizer is for *truth*. A 20% error on token count is a 20% error on your cost model.
- **Forgetting detokenization can change whitespace.** Tokens often include the leading space (" the" vs "the"); when you assemble strings yourself from raw tokens you can mangle spacing. Let the provider's detokenizer do it.
- **Assuming token counts transfer between models.** Different vocabularies → different counts. Compare like with like using each provider's own tokenizer.

## 9. Best Practices

- **Run every real input through the provider's tokenizer** before budgeting context or cost (L149–L150 show the workflow).
- **Use the 4-char / 0.75-word rule for *estimates*, the tokenizer for *commitments*.**
- **Remember output tokens are the expensive kind** — budget `max_tokens` tightly and design prompts for short outputs (L135's asymmetry).
- **For retrieval, store and chunk by token counts** where the embedding model allows it — it keeps chunk boundaries aligned with what the LLM actually reads.
- **Count tokens in your test suite.** A regression that silently doubles a prompt's token count is a cost regression — assert on it.

## 10. Interview Questions

**Q: What is a token, exactly?**
> A: The atomic unit an LLM reads and writes — a sub-word fragment from a fixed vocabulary of roughly 100K–200K entries. Input text is tokenized into these units; output is assembled from them. 'ChatGPT' is one token; 'unbelievable' is three.

**Q: Why not just use words, or characters?**
> A: Characters are too fine — long sequences and expensive attention. Words are unbounded — names, typos, new terms never fit a fixed list. Sub-word units (via Byte-Pair Encoding) give a fixed vocabulary that still covers all text, by splitting the unseen into known pieces.

**Q: How many tokens are in a typical English sentence?**
> A: Roughly 0.75 words per token — so a 20-word sentence is about 15 tokens, and 1,000 words is about 1,300 tokens. Code and punctuation-heavy text are denser; some scripts are 1–2 tokens per character.

**Q: Why does tokenization matter for cost?**
> A: Everything is billed per token — input and output separately. If your pipeline sends 5,000 tokens per request and serves 1M requests a month, token count is your cost model. Small per-token differences compound at scale, and non-English languages can cost several times more per word.

## 11. Follow-Up Questions

- What is Byte-Pair Encoding, and why does it produce the vocabulary it does?
- Why can the same text tokenize differently across models?
- How would you estimate the token cost of a PDF-processing pipeline?
- What's the relationship between tokens and context windows (L138)?
- How do you make token counting part of CI?

## 12. Comparison Table — Units of Text

| Unit | LLM uses it? | Fixed vocabulary? | Token count (English) | Notes |
|---|---|---|---|---|
| Character | no (rarely) | yes | ~4 chars/token | too fine, too slow |
| Token (sub-word) | **yes** | **yes (~100K)** | 1 per ~0.75 words | the unit of everything |
| Word | no | no (infinite) | ~1.3 tokens/word | unbounded vocab |
| Sentence | no | no | ~15–20 tokens | structural, not atomic |
| Document | no | no | depends | a *budget* of tokens |

The senior read: the token is the only *atomic, countable, billable* unit — which is why the entire economics of LLMs (L149–L151) is built on it.

## 13. Code Example — Counting Tokens Like the Provider Does

```js
// Counting tokens the way the provider does — never by split(' ').
// OpenAI ships a JS tokenizer; Anthropic and Gemini count via their SDKs.

const { encoding_for_model } = require('tiktoken');

const enc = encoding_for_model('gpt-4o');      // the exact vocab for that model

function countTokens(text) {
  return enc.encode(text).length;
}

const prompt = 'Explain the event loop in one paragraph.';
const inputTokens = countTokens(prompt);
console.log(`input:  ${inputTokens} tokens`);

const naive = prompt.split(/\s+/).length;        // the "words" estimate
console.log(`words:  ${naive} (tokens ≠ words)`);

// A full request's token budget (L149): system + history + user + answer
const budget = {
  system: countTokens('You are a concise tutor.'),
  user: inputTokens,
  output: 200,                                   // max_tokens reservation
};
const total = Object.values(budget).reduce((a, b) => a + b, 0);
console.log(`request budget: ${total} tokens`);
```

```text
What the reader must SEE — two counting methods, two answers:

  "Explain the event loop in one paragraph." (44 chars)
  split(' ')  →  8 "words"
  tiktoken    →  8 tokens   (same, here — but not in general)

  "unbelievable"            split → 1 word, tiktoken → 3 tokens
  "const x = 1;"            split → 4 words, tiktoken → ~6 tokens
```

```narrate
2-4: The tokenizer is model-specific — the vocabulary is trained with the model.
9-10: This is the only correct way to count: encode with the real vocabulary.
12-14: The naive word count agrees on simple English and disagrees everywhere else.
16-20: A request's token budget = system + history + user + a reserved output slice.
```

> [!TIP]
> `tiktoken` gives you OpenAI's exact counts. For other providers, their SDKs expose a tokenizer or a usage field in the response — the response's `usage` object is the ground truth for what you actually paid.

## 14. Performance Notes

- **Tokens are the latency unit too.** Time-to-first-token is dominated by input processing; after that, each output token is one more forward pass. Fewer tokens = faster, cheaper, shorter context (L145, L151).
- **The tokenizer runs on CPU, before the model.** Tokenization is cheap (milliseconds) and deterministic — it is never the bottleneck, which is why you can count tokens client-side for free.
- **Dense text costs more attention.** Code and symbols tokenize densely, which makes the same *character* count cost more in tokens, context, and attention (L136's O(n²)).
- **Prompt caching rewards token-identical prefixes** (L171). If your system prompt changes by one token, the cache misses; keeping it byte-stable is a cost lever.

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Cost estimate is 30% off | Token estimate assumed 1 token/word, or ignored output tokens | Count with the provider tokenizer; include output + system + history |
| A prompt overflows the context window | You counted characters, not tokens — or a document is bigger than you thought | Tokenize the exact input; chunk or truncate (L138, L178) |
| "Max tokens exceeded" on a short-looking answer | CJK/emoji/dense code tokenize expensively | Count the *output* too; raise max_tokens or shorten the ask |
| Spacing looks wrong in assembled output | Detokenization mangled by hand-assembled tokens | Let the provider detokenize; don't splice raw token strings |
| Two models give different counts for the same text | Different vocabularies | Count with each provider's own tokenizer |

## 16. Quick Revision Notes

- A token = **a sub-word unit from a fixed vocabulary (~100K–200K)** — the atomic unit of LLMs.
- English ≈ **0.75 words/token ≈ 4 chars/token**; code denser; CJK often 1–2 tokens per *character*.
- **BPE** builds the vocabulary: merge most-frequent adjacent pairs until the target size.
- Tokenization is **deterministic** (countable) — generation is stochastic (L135).
- Everything is **denominated in tokens**: context (L138), cost (L150), latency (L151), caching (L171), rate limits (L318).
- **Verify with the provider's tokenizer** — never commit a cost number on a word count.

## 17. Cheat Sheet

```text
TOKEN = the atomic unit of an LLM
  sub-word fragment, fixed vocab (~100K-200K), BPE-trained

COUNTING (English, approx)
  4 chars     = 1 token
  0.75 words  = 1 token
  1.3 tokens  = 1 word
  code:  +30-50%     CJK: 1-2 tokens/char

CONVERSIONS
  1000 words  ≈ 1300 tokens
  1 page      ≈ 1500 tokens (500 words)
  10-page PDF ≈ 15K tokens

WHY SUB-WORD
  characters: too fine  → long sequences, costly attention
  words:      too many  → unbounded vocabulary
  sub-word:   fixed size that still covers everything (BPE)

RULES
  deterministic input count  → budget reliably
  provider tokenizer = truth  → estimate is only sanity
  output tokens are expensive → reserve max_tokens

INTERVIEW, 4 MOVES
  1 unit    "sub-word fragment, fixed vocab"
  2 reason  "chars too fine, words too many → BPE"
  3 numbers "0.75 words/token, ~4 chars, code denser"
  4 result  "context, cost, latency — all token problems"
```

## 18. Key Takeaways

> [!RECAP]
> - A token is the **atomic unit of an LLM** — a sub-word fragment from a fixed vocabulary of ~100K–200K entries
> - Tokenization exists because **characters are too fine and words too infinite**; BPE finds the fixed vocabulary that covers everything
> - English runs at **~0.75 words per token** (~4 characters); code and CJK are dramatically denser — and that's a real cost difference
> - **Context, cost, and latency are all token problems** — every AI design starts by counting tokens
> - Token counts are **deterministic** — verify with the provider's tokenizer before you commit a budget
> - The token is the "CPU instruction" of LLM economics: the one unit every number in this module is built from

## Check your understanding

Answer these without looking back.

1. Define a token. Why sub-word units instead of characters or words?
2. Roughly how many tokens in 1,000 English words? In a 10-page PDF?
3. Why does the same sentence cost different token counts in different languages?
4. Why is tokenization deterministic but generation stochastic — and why does that matter for budgeting?
5. How would you count the tokens of a request that includes a system prompt, history, and an output reservation?
6. Why can the same text tokenize differently across models?
7. Why are output tokens more expensive than input tokens — and how does that shape prompt design?
8. What does "the token is the CPU instruction of LLM economics" mean?

## A Closing Note — The Unit of Everything

You now hold the unit of account for the entire AI half of this roadmap. Every cost estimate in L150, every context budget in L138, every latency calculation in L151, every RAG chunk size in L178, every rate limit in L318 — all of them are token arithmetic wearing different clothes. When an interviewer says "estimate the cost of summarizing 100,000 documents", they are asking *one* thing: can you convert documents → words → tokens → price without panicking?

You can. The conversion is: 100,000 docs × 1,500 tokens ≈ 150M input tokens, plus ~30M output tokens, at the provider's per-million rates — a number you can now produce in seconds, and verify in the provider dashboard. Next lesson: the hard ceiling those tokens live inside — the context window.
