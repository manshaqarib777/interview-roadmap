# Topic 73 — Laravel + AI

**Checklist anchor:** OpenAI · Anthropic · Gemini · embeddings · vector databases · pgvector · RAG · streaming · background AI jobs · when AI calls are synchronous vs queued

**Owning lesson:** [134 Multi-Tenancy & System Design](../134-multitenancy.md)

---

## The one-sentence answer

**Laravel + AI is a service pattern — the app talks to an LLM or embedding model through a provider client, behind the container, with the architecture (synchronous vs queued, RAG or not) decided by latency and cost.**

## The mental model

The checklist's architecture:

```text
React / Next.js
       ↓
Laravel API (your app's rules, auth, rate limits)
       ↓
AI Service (the integration layer — your contract)
       ↓
LLM (OpenAI / Anthropic / Gemini)
       ↓
PostgreSQL / Vector DB (for RAG — the retrieval half)
```

Laravel is the **guardian** — it owns auth, validation, rate limits, and cost control — and the AI call goes through a **service** (Lesson 53) so the LLM provider is swappable and testable, exactly like a payment gateway (Lesson 71's pattern).

## How it works

### The AI service — provider behind an interface

```php
// your contract (Lesson 52) — the app depends on this, not the SDK:
interface ChatProvider
{
    public function complete(string $prompt, array $options = []): string;
}

// an implementation — the Anthropic/OpenAI SDK behind it:
class AnthropicProvider implements ChatProvider
{
    public function complete(string $prompt, array $options = []): string
    {
        // $client = new \Anthropic\Anthropic(getenv('ANTHROPIC_API_KEY'));
        // return $client->messages()->create([...])->content;
    }
}

// bound in a provider (Lesson 6) — swap OpenAI ↔ Anthropic ↔ Gemini in one line:
$this->app->bind(ChatProvider::class, AnthropicProvider::class);
```

### Streaming — tokens as they arrive

```php
// for chat UX, stream instead of waiting for the full answer:
return response()->stream(function () use ($prompt) {
    foreach ($this->ai->stream($prompt) as $chunk) {
        echo $chunk;          // tokens arrive progressively
        ob_flush(); flush();
    }
}, 200, ['Content-Type' => 'text/event-stream']);
```

Streaming is the difference between "spinner for 30s" and "text appears as it's generated" — the standard for chat-style features.

### RAG — retrieval-augmented generation

```text
user question
   ↓
1. EMBED the question → a vector
2. SEARCH the vector DB (pgvector) for similar chunks of YOUR documents
3. BUILD the prompt: "Using these docs: <retrieved chunks>, answer: <question>"
4. LLM answers grounded in your data — not its training cutoff
```

```php
// step 1-2 — the retrieval half:
$questionVector = $this->embeddings->embed($question);
$chunks = Chunk::orderByRaw(
    'embedding <=> ?',               // pgvector cosine distance
    [$questionVector]
)->limit(5)->get();

// step 3-4 — the generation half:
$answer = $this->ai->complete(
    "Using these documents:\n".$chunks->pluck('content')->join("\n\n").
    "\n\nQuestion: $question"
);
```

**pgvector** is the Postgres extension that makes a vector column just another indexed column — no separate vector database needed for most apps (Lesson 63's indexing applies to vectors too: an HNSW/IVFFlat index).

### When AI calls are synchronous vs queued (the checklist's question)

| Synchronous | Queued (Lesson 26) |
|---|---|
| Chat/assistant — the user is waiting for the answer | Summaries, embeddings, bulk classification |
| Short, fast models | Long generations, batch jobs |
| Streaming responses | "Process these 1,000 documents" |
| The UI needs the result in the response | The result arrives later (notification/job) |

**The rule:** if the user is waiting on the answer, it's synchronous (streamed if long). If the work is *background* — embedding a corpus, summarizing history, scoring leads — it's a job, with the result stored and surfaced later. Queuing also protects you: LLM calls can be slow and costly, and a queue (Lesson 65) gives you retries, backoff, and cost control.

## Interview questions

**Q1. How does Laravel integrate with an LLM?**
> Through a service behind an interface — `ChatProvider` with an Anthropic/OpenAI implementation, bound in the container. The app calls `$this->ai->complete(...)` and never names the SDK, so providers are swappable and testable (a fake in tests). Laravel's job is the guardian: auth, validation, rate limits, and cost control around the provider call.

**Q2. What is RAG?**
> Retrieval-augmented generation: embed the user's question, search your own documents (vector search in pgvector), and feed the retrieved chunks into the prompt so the LLM answers from *your* data. It grounds the answer in current, private information instead of the model's training data — and it's how you build "chat with my docs" without fine-tuning.

**Q3. Synchronous or queued AI calls?**
> Synchronous when the user waits — chat, streaming responses. Queued when the work is background — embedding a corpus, bulk summarization, scoring. The rule: the response needs it → sync; it can happen later → job, with retries and cost control (Lessons 26, 65).

**Q4. Why use a vector database / pgvector?**
> To search by *meaning* instead of keywords — embeddings turn text into vectors, and a vector index finds the most similar chunks. pgvector keeps it in Postgres: one database, a vector column, an index (Lesson 63), no separate infra — the right choice for most Laravel apps before a dedicated vector DB earns its keep.

**Q5. How do you stream AI responses?**
> The service streams tokens from the provider, and the route returns them as an event stream (`response()->stream`) so the browser renders text progressively. Streaming turns a 30-second wait into instant feedback — the standard for chat UX, and it needs the synchronous (not queued) path.

**Senior follow-up: How do you control AI costs in production?**
> Rate limit per user (Lesson 35), cache identical prompts/responses (Lesson 33), cap token counts, and route heavy background work through queues with backoff (Lesson 26). The senior framing: AI is a *metered external service* — same discipline as Stripe (Lesson 71): your app owns the limits, the provider owns the meter, and the service layer keeps the provider swappable so pricing changes are a binding change, not a rewrite.

## Common mistakes

❌ Calling the SDK directly from controllers — provider lock-in and untestable code; use the service (Lesson 53).

❌ Sending user data blindly — RAG leaks tenant data without the Lesson 72 isolation discipline.

❌ Blocking a request on a 60-second generation — stream it or queue it.

❌ No rate limiting on AI endpoints — an unthrottled LLM endpoint is a runaway bill.

## Quick revision notes

- **AI = a service behind an interface** — provider swappable, testable (Lesson 52/53)
- **RAG**: embed → vector-search (pgvector) → build the prompt → answer from your data
- **Streaming** = tokens as they arrive (sync path) · **Queued** = background work (embeddings, summaries)
- **pgvector** = vectors in Postgres — one DB, indexed (Lesson 63)
- **Laravel = the guardian**: auth, rate limits, cost control
- AI is a **metered external service** — same discipline as Stripe (Lesson 71)

## Check your understanding

1. Why does the AI client live behind an interface?
2. Walk through the four steps of RAG.
3. When is an AI call queued instead of synchronous?
4. Why is pgvector often the right vector store for a Laravel app?
5. How do you keep an AI endpoint from becoming a runaway bill?
