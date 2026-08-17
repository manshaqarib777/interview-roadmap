# Lesson 278 — Amazon Bedrock

**Interview importance:** ⭐⭐⭐⭐⭐ — "what's the AWS-native LLM access?" — the answer is *Bedrock*: one API over many frontier models — the model access, the inference, the provisioning, and the governance (L278).**

L148 built the model selection (L148) and L152–154 the provider APIs (L152); this lesson is **the AWS-native access**: Amazon Bedrock — the managed model service: the foundation models (the frontier models through one API, L278), the inference (the on-demand and the provisioned, L278), the knowledge (L280), the agents (L279), and the governance (L281). The AI platform's shape: the model calls (L145) run through Bedrock (L278) — the one API over the many models (L278). This lesson is the model access of the AWS stack (L278).

The distinction this lesson is built on: a **demo** calls a provider directly. A **solutions architect** uses Bedrock (L278): the one API (L278), the provisioned throughput (L278), and the governance (L281) — because the AWS AI stack (L287) accesses the models through Bedrock (L278).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the foundation models: the frontier models through one API (L278)
- Explain the inference: the on-demand and the provisioned (L278)
- Explain the governance: the guardrails and the evaluation (L281)
- Explain the knowledge: the Bedrock Knowledge Bases (L280)
- Explain the AI shape: the model access of the AWS stack (L278)

## 1. One-Line Definition

**Amazon Bedrock is one API over many frontier models — the AWS-native LLM access (L278) — the foundation models (the frontier models — the Anthropic, the Meta, the Amazon — through one API, L278), the inference (the on-demand for the variable traffic and the provisioned throughput for the steady load, L278), the knowledge (the Bedrock Knowledge Bases for the RAG, L280), the agents (the Bedrock Agents for the loops, L279), and the governance (the guardrails L281 and the evaluation L341) — the model access of the AWS stack (L278).**

The one-sentence interview answer: *"Bedrock is AWS's managed model service (L278). The model: the foundation models (L278) — the frontier models — the Anthropic Claude, the Meta Llama, the Amazon Titan — served through one API (L278): no direct provider accounts, no per-provider SDKs (L278); the IAM (L262) and the keys (L275) are AWS's (L278). The inference: the on-demand — the pay-per-token (L150) for the variable traffic (L278); the provisioned throughput — the reserved capacity (L278) for the steady load (L278). The access is governed (L278): the Guardrails (L281) filter the content and redact the PII (L281); the Knowledge Bases (L280) provide the managed RAG (L280); and the agents (L279) build the tool loops (L279). The AI shape: the L260 backend (L260) calls the model (L145) through Bedrock (L278) — the Lambda (L266) and the ECS (L271) invoke it with the IAM role (L262), the streaming (L251) works, and the cost (L285) is the AWS bill's line (L278). The one API over the many models (L278)."*

## 2. Mental Model

Think of Bedrock as **the library's reading room with the premium journals.** The library (Bedrock, L278) subscribes to the journals (the foundation models, L278): the Claude, the Llama, the Titan — all on the same shelves (L278). You don't subscribe to each journal (the direct providers, L152) — you read them in the library (the one API, L278), with your library card (the IAM, L262). The reading room has the reserved tables (the provisioned throughput, L278) for the regulars (the steady load, L278) and the open tables (the on-demand, L278) for the drop-ins (the variable traffic, L278). The library has the policies (the guardrails, L281): the sensitive pages (the PII, L313) redacted, the banned topics (L281) filtered. And the reference desk (the Knowledge Bases, L280) holds the library's own documents (L280). The library works because the subscriptions are shared, the tables match the need, and the policies are enforced (L278).

```text
   the reading room (Bedrock, L278)
   ┌────────────────────────────────────────────────────────┐
   │ the journals (the foundation models, L278) — Claude,   │
   │ Llama, Titan — one shelf (L278)                        │
   │ the tables (the inference, L278) — on-demand,          │
   │ provisioned (L278)                                     │
   │ the policies (the guardrails, L281) · the reference    │
   │ desk (the Knowledge Bases, L280)                       │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the reading room**: the journals, the tables, the policies, and the reference desk (L278).

## 3. Visual Flow — One Model Call

```text
   the application (L278)
        │  the invoke (L145)
        ▼
   ┌────────────────────── THE CALL (L278) ────────────────────────────┐
   │  the IAM role (L262) authorizes the invoke (L278)                │
   │  the model: claude / llama / titan (L148, L278)                  │
   │  the inference: on-demand / provisioned (L278)                   │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE GOVERNANCE (L281) ──────────────────────┐
   │  the guardrails (L281) — the filters, the redaction (L313)       │
   │  the knowledge (L280) — the retrieval, the grounding (L280)      │
   └──────────────────────────┬───────────────────────────────────────┘
                              ▼
   ┌────────────────────── THE STREAM (L251) ──────────────────────────┐
   │  the tokens arrive as they're generated (L145)                   │
   │  the cost (L285) recorded per call (L332)                        │
   └──────────────────────────────────────────────────────────────────┘
```

The flow is the model call: **invoke → govern → stream** (L278).

## 4. How It Works — The Model Service, Part by Part

- **The foundation models (L278).** The frontier models through one API (L278): the Anthropic Claude, the Meta Llama, the Amazon Titan (L278) — with the model selection (L148) and the routing (L155) as the choices (L278).
- **The inference (L278).** The on-demand — the pay-per-token (L150) for the variable traffic (L278); the provisioned throughput — the reserved capacity (L278) for the steady load (L278) — the commitment (L285) with the lower price (L278).
- **The access (L278).** The IAM (L262) and the keys (L275): the Lambda's role (L262) invokes the model (L278) — no provider keys in the code (L275).
- **The governance (L281).** The Guardrails (L281) — the content filters and the PII redaction (L313); the evaluation (L341) — the model quality (L341). The Bedrock knows what runs through it (L278).
- **The ecosystem (L278).** The Knowledge Bases (L280) — the managed RAG (L280); the agents (L279) — the managed loops (L279). The Bedrock is the model platform (L278).

> [!NOTE]
> **The one API is the abstraction's value (L278).** The senior answer names the trade (L278): the direct provider APIs (L152) give the provider's full surface (L152); Bedrock (L278) gives the one API over the many models (L278) — the IAM (L262), the keys (L275), the guardrails (L281), and the streaming (L251) handled (L278). The model's choice (L148) becomes the API's parameter (L278) — the routing (L155) and the fallback (L157) are the app's (L278).

## 5. Real Project Usage

- **A serverless AI stack (L283).** The Lambda (L266) invokes the Bedrock (L278) with the IAM role (L262) — the streaming chat (L162), the tools (L164).
- **A RAG platform (L280).** The Bedrock Knowledge Bases (L280) — the managed ingestion and the retrieval (L280) — grounded in the documents (L280).
- **An agent product (L279).** The Bedrock Agents (L279) — the tool loop (L279) with the action groups (L279).
- **A multi-tenant SaaS (L357).** The per-tenant quotas (L149) and the per-tenant cost (L334) — the Bedrock calls metered (L332).
- **Anything AI on AWS (L278).** The model access (L278) — the one API over the frontier models (L278).

The through-line: **the model service is the AWS stack's model access** — one API, governed and provisioned (L278).

## 6. Interview Explanation

Say it in four moves:

1. **The models.** "The frontier models — Claude, Llama, Titan — through one API (L278)."
2. **The inference.** "The on-demand for the variable, the provisioned for the steady (L278)."
3. **The access.** "The IAM (L262) and the keys (L275) — no provider keys in the code (L278)."
4. **The governance.** "The guardrails (L281), the knowledge (L280), the agents (L279)."

## 7. Senior-Level Insights

- **The one API is the portability (L278).** The model's choice (L148) is the API's parameter (L278) — the routing (L155) and the fallback (L157) without the provider lock-in (L377).
- **The provisioned throughput is the cost design (L285).** The steady load (L278) on the provisioned (L278) — the commitment (L285) for the lower price (L285).
- **The governance is the compliance's path (L371).** The guardrails (L281) and the audit (L322) — the SOC 2 and the HIPAA (L371) journeys (L371) through the governed model service (L278).
- **The IAM is the keyless access (L262).** The Lambda's role (L262) invokes the model (L278) — no provider keys (L275), the L321 secret rule (L321) upheld (L278).
- **The ecosystem is the platform (L278).** The Knowledge Bases (L280), the agents (L279), and the guardrails (L281) — the model service is the AI platform (L278).

## 8. Common Mistakes

- **The provider key in the code (L275).** The direct provider (L152) with the key in the app (L275) — the Bedrock (L278) and the IAM (L262) remove it (L278).
- **The on-demand for the steady load (L278).** The pay-per-token (L150) at the scale (L278) — the provisioned throughput (L278) is the cost lever (L285).
- **The model hardcoded (L148).** The single model in the code (L278) — the routing (L155) and the fallback (L157) lost (L278).
- **The guardrails skipped (L281).** The unfiltered output (L281) — the PII (L313) and the harmful content (L309) ungoverned (L281).
- **The RAG hand-built (L280).** The custom ingestion (L176) when the Knowledge Bases (L280) fit (L278) — the managed RAG (L280) is the platform's (L278).

## 9. Best Practices

- **Use the one API** (L278) — the frontier models (L278) through the IAM (L262).
- **Match the inference to the load** (L278) — the on-demand for the variable, the provisioned for the steady (L285).
- **Route by the model's fit** (L148) — the routing (L155) and the fallback (L157).
- **Govern the calls** (L281) — the guardrails (L281), the PII redaction (L313).
- **Use the managed ecosystem** (L278) — the Knowledge Bases (L280), the agents (L279).

## 10. Interview Questions

**Q: Walk me through Amazon Bedrock.**
> A: The managed model service (L278). The foundation models — the frontier models through one API (L278). The inference — the on-demand and the provisioned (L278). The access — the IAM (L262), no provider keys (L275). And the governance — the guardrails (L281), the knowledge (L280), the agents (L279).

**Q: Why Bedrock over a direct provider API?**
> A: The abstraction (L278). The one API over the many models (L278) — the IAM (L262) and the keys (L275) handled, the guardrails (L281) applied, the streaming (L251) supported. The model's choice (L148) is the API's parameter (L278) — the routing (L155) and the fallback (L157) without the provider lock-in (L377).

**Q: How do you manage the cost?**
> A: Two levers (L278): the inference mode (L278) — the on-demand for the variable traffic (L150), the provisioned throughput (L278) for the steady load with the commitment's discount (L285); and the metering (L332) — the per-call tokens and the cost (L334) recorded (L278).

**Q: What's the provisioned throughput?**
> A: The reserved model capacity (L278): you commit to a throughput (L278) and pay the committed rate (L285) — the steady load (L278) gets the predictable latency (L333) and the lower price (L285); the variable traffic (L278) stays on the on-demand (L278).

## 11. Follow-Up Questions

- What are the foundation models (L278)?
- What's the on-demand vs the provisioned (L278)?
- How does the IAM access work (L262)?
- What are the guardrails (L281)?
- Why Bedrock over a direct provider (L278)?

## 12. Comparison Table — Bedrock vs the Direct Provider API

| | Bedrock (L278) | The direct provider (L152) |
|---|---|---|
| Models (L278) | the many, one API (L278) | the one provider's (L152) |
| Keys (L275) | the IAM (L262), the AWS keys (L275) | the provider key (L275) |
| Governance (L281) | the guardrails (L281), the audit (L322) | yours to build (L172) |
| Cost (L285) | the AWS bill (L285) | the provider's bill (L150) |
| Lock-in (L377) | the routing and the fallback (L155) | the provider's surface (L152) |

The senior read: **the left column is the platform** — the one API, the IAM, and the governance (L278).

## 13. Code Example — The Model Call

```js
// The model call (L278) — the one API (L278).
import { BedrockRuntimeClient, InvokeModelWithResponseStreamCommand } from '@aws-sdk/client-bedrock-runtime';

// THE ACCESS (L262) — the IAM role (L262); no provider keys (L275).
const client = new BedrockRuntimeClient({ region: 'us-east-1' });

// THE INVOKE (L278) — the model, the prompt, the stream (L251).
const command = new InvokeModelWithResponseStreamCommand({
  modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',   // the model (L148, L278)
  contentType: 'application/json',
  body: JSON.stringify({
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1024,
  }),
});

// THE STREAM (L251) — the tokens as they're generated (L145).
const { stream } = await client.send(command);
for await (const chunk of stream) {
  // the chunk's text → the client (L162)
}

// THE METERING (L332) — the tokens and the cost recorded (L278).
```

```text
What the reader must SEE — the call, shaped:

  BedrockRuntimeClient    → the one API (L278)
  modelId: claude-3-5     → the model's choice (L148, L278)
  InvokeModelWithResponseStream → the streaming (L251)
  IAM role, no keys       → the access (L262, L275)

  One API, governed, streamed, and metered (L278).
```

```narrate
3-5: The client — the Bedrock runtime, the IAM role authorizing the call (L278, L262).
7-14: The invoke — the model's choice and the prompt (L148, L278).
16-18: The stream — the tokens arrive as they're generated (L251, L145).
20-21: The metering — the tokens and the cost recorded (L332, L278).
```

> [!TIP]
> The pair that defines Bedrock: **the model's choice as the API's parameter** (L148, L278) and **the streamed response** (L251). **Choose the model per call, stream the tokens, govern the whole — the AWS-native LLM access (L278).**

## 14. Performance Notes

- **The provisioned is the latency's control (L278).** The reserved capacity (L278) — the predictable latency (L333) for the steady load (L278).
- **The on-demand is the variable's cost (L150).** The pay-per-token (L150) — the burst (L278) without the commitment (L278).
- **The stream is the TTFT (L145).** The streaming (L251) — the first token's arrival (L145) is the UX (L162).
- **The metering is the cost's record (L332).** The per-call tokens (L332) and the cost (L334) — the L285 bill (L285), attributable (L278).

## 15. Debugging Scenarios

| Symptom | First check (L278) | The lever |
|---|---|---|
| The access denied | The IAM role (L262) | The bedrock:InvokeModel policy (L262) |
| The latency spikes | The inference mode (L278) | The provisioned throughput (L278) |
| The stream stalls | The client (L278) | The response stream (L251) |
| The output is harmful | The guardrails (L281) | The Bedrock Guardrails (L281) |
| The cost is unexplained | The metering (L332) | The per-call tokens and cost (L334) |

## 16. Quick Revision Notes

- Amazon Bedrock = **the AWS-native LLM access** (L278): the models, the inference, the access, the governance.
- The models: **the frontier models through one API** (L278).
- The inference: **the on-demand (variable) and the provisioned (steady)** (L278).
- The access: **the IAM (L262) — no provider keys (L275)**.
- The governance: **the guardrails (L281), the knowledge (L280), the agents (L279)**.

## 17. Cheat Sheet

```text
AMAZON BEDROCK = one API over the many frontier models

THE MODELS (L278)
  the Anthropic Claude · the Meta Llama · the Amazon Titan (L278)
  the model's choice (L148) = the API's parameter (L278)

THE INFERENCE (L278)
  the on-demand — the pay-per-token (L150), the variable traffic
  the provisioned — the reserved capacity (L278), the steady load,
  the commitment's discount (L285)

THE ACCESS (L278)
  the IAM role (L262) — the bedrock:InvokeModel policy (L262)
  no provider keys (L275) — the L321 rule (L321) upheld

THE GOVERNANCE (L281)
  the guardrails (L281) — the filters, the PII redaction (L313)
  the Knowledge Bases (L280) — the managed RAG (L280)
  the agents (L279) — the managed loops (L279)

THE AI SHAPE (L278)
  the L260 backend (L260) → the Lambda (L266) / the ECS (L271)
  → the Bedrock (L278) — streamed (L251), metered (L332)

INTERVIEW, 4 MOVES
  1 models  "the frontier models, one API (L278)"
  2 inference "on-demand vs provisioned (L278)"
  3 access  "the IAM — no provider keys (L262, L275)"
  4 governance "the guardrails, the knowledge, the agents (L278)"
```

## 18. Key Takeaways

> [!RECAP]
> - Amazon Bedrock is **one API over many frontier models — the AWS-native LLM access** (L278): the foundation models (L278), the inference (L278), the access (L262), and the governance (L281)
> - **The foundation models** (L278) are the frontier models — the Anthropic Claude, the Meta Llama, the Amazon Titan — served through one API (L278); the model's choice (L148) is the API's parameter (L278)
> - **The inference** (L278): the on-demand (L150) for the variable traffic, and the provisioned throughput (L278) for the steady load with the commitment's discount (L285)
> - **The access** (L278) is the IAM (L262) — the Lambda's role (L262) invokes the model, no provider keys (L275)
> - **The governance** (L278): the guardrails (L281), the Knowledge Bases (L280), and the agents (L279) — the model service is the AI platform (L278)
> - The AI shape (L278): the L260 backend (L260) calls the model through Bedrock (L278) — the one API, streamed (L251) and metered (L332), on the AWS bill (L285)

## Check your understanding

Answer these without looking back.

1. What are the foundation models (L278)?
2. What's the on-demand vs the provisioned (L278)?
3. How does the IAM access work (L262)?
4. What are the guardrails (L281)?
5. Why Bedrock over a direct provider (L278)?
6. What's the provisioned throughput (L278)?
7. What's the L321 rule, upheld (L321)?
8. What is the AWS-native LLM access (L278)?

## A Closing Note — The Reading Room, Open

You now hold the model service: **the foundation models, the inference, the access, and the governance — with the one API over the many models.** The AWS stack has its model access — and it's the reading room with the premium journals (L278).

Next: the managed agents — Bedrock Agents (L279).
