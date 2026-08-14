# AI Solutions Architect — Curriculum Plan

## Goal

Turn this repo into a full-stack **AI Solutions Architect** interview curriculum layered on top of the
existing 134 lessons. 13 new modules (L135–L386), 252 new lessons, executed milestone by milestone.
The complete syllabus lives here in `docs/ai-solutions-architect-curriculum.md` (saved like the other
lessons), and implementation proceeds in milestones, one module at a time.

## How the site works (what every milestone touches)

- **The curriculum is data.** `src/lib/curriculum.ts` holds every module + lesson as tuples. The
  dashboard, graph, sidebar, search, breadcrumbs, OG cards, JSON-LD are all projections of it.
- **A lesson is a markdown file** in `content/<module-dir>/<NNN-slug>.md`. Each `##` heading becomes
  a step in the reader. Rows present but files missing render the built-in "Not written yet" state
  (queued, `noindex`).
- **Routes are generated** from `LESSON_INDEX` (`/lessons/<module>/<file>`), `dynamicParams = false`.
  Adding a module/lesson row makes the whole site aware of it instantly.
- **README.md / PROGRESS.md** are updated by hand when lessons land (per `CLAUDE.md`).
- **Accents** are per-module: `Accent` union in `curriculum.ts`, CSS tokens (light + dark) + `.acc-*`
  classes in `src/app/globals.css`, and the `ACCENT` map in `src/components/knowledge-graph.tsx`.

## Structure: 13 phases → 13 modules (1:1)

Faithful to the requested progression — one module per phase. Lesson numbering continues from 134.

| Mod | Num | Slug | Dir | Phase | Range | Lessons |
|----|----|------|-----|-------|-------|---------|
| 7 | 7 | `ai-foundations` | `07-ai-foundations` | 1 · AI & LLM Foundations | L135–157 | 23 |
| 8 | 8 | `ai-app-engineering` | `08-ai-app-engineering` | 2 · AI Application Engineering | L158–173 | 16 |
| 9 | 9 | `rag-knowledge` | `09-rag-knowledge` | 3 · RAG / Knowledge Systems | L174–197 | 24 |
| 10 | 10 | `ai-agents` | `10-ai-agents` | 4 · AI Agents | L198–216 | 19 |
| 11 | 11 | `ai-automation` | `11-ai-automation` | 5 · AI Automation | L217–232 | 16 |
| 12 | 12 | `backend-ai` | `12-backend-ai` | 6 · Backend & Distributed Systems for AI | L233–260 | 28 |
| 13 | 13 | `cloud-aws-ai` | `13-cloud-aws-ai` | 7 · Cloud & AWS | L261–287 | 27 |
| 14 | 14 | `docker-devops-ai` | `14-docker-devops-ai` | 8 · Docker / DevOps / Infrastructure | L288–307 | 20 |
| 15 | 15 | `ai-security` | `15-ai-security` | 9 · AI Security | L308–327 | 20 |
| 16 | 16 | `ai-observability` | `16-ai-observability` | 10 · AI Observability & Evaluation | L328–346 | 19 |
| 17 | 17 | `ai-system-design` | `17-ai-system-design` | 11 · AI System Design | L347–358 | 12 |
| 18 | 18 | `enterprise-ai` | `18-enterprise-ai` | 12 · Enterprise AI Solutions Architecture | L359–380 | 22 |
| 19 | 19 | `ai-capstones` | `19-ai-capstones` | 13 · Capstone Projects | L381–386 | 6 |

Grand total: 386 lessons. Milestones M18–M30 (continuing the M-lettering) map 1:1 to modules.

**Assumptions recorded:** JS/TS/Node + Next.js + AWS stack throughout (matches the outline — no
PHP/Laravel content in the AI modules); all modules scaffolded into `curriculum.ts` up front so the
site shows the complete curriculum with queued lessons, then files land per milestone; exercises are
optional per lesson (the existing `exercises/<module>/` pattern) — the capstones are the real projects.

## Full syllabus (252 lessons)

### Module 7 — AI & LLM Foundations (L135–157) — Phase 1
135 What an LLM Is · 136 The Transformer & Attention Mechanism · 137 Tokens & Tokenization ·
138 Context Windows & Input Limits · 139 Temperature, Top-p & Sampling · 140 Model Capabilities ·
141 Model Limitations · 142 Prompt Engineering & System/User/Developer Instructions ·
143 Structured Outputs & JSON Schemas · 144 Function Calling & Tool Calling · 145 Streaming Responses ·
146 Multimodal Models · 147 Embeddings & Vector Semantics · 148 Model Selection & Frontier Families ·
149 Token Management & Budgeting · 150 Cost Optimization · 151 Latency Optimization ·
152 The OpenAI API · 153 The Anthropic API · 154 The Google Gemini API · 155 Provider Abstraction &
Model Routing · 156 Comparing the Three Providers · 157 Foundations Review — the Model Decision Rule

### Module 8 — AI Application Engineering (L158–173) — Phase 2
158 AI Application Architecture · 159 LLM API Integration Patterns · 160 The Vercel AI SDK ·
161 AI SDK Patterns (streams, parts, tool calls) · 162 Streaming UI · 163 Structured Generation in Apps ·
164 Tool Calling in Applications · 165 AI Application State · 166 Conversation Management ·
167 AI Memory · 168 Error Handling for LLM Calls · 169 Retry Strategies & Backoff ·
170 Rate Limiting · 171 Caching LLM Responses · 172 AI API Security Fundamentals ·
173 Production AI Patterns (synthesis)

### Module 9 — RAG / Knowledge Systems (L174–197) — Phase 3
174 RAG Fundamentals · 175 RAG Architecture · 176 Document Ingestion Pipelines ·
177 PDF Processing & Text Extraction · 178 Chunking Fundamentals · 179 Chunking Strategies ·
180 Metadata for Retrieval · 181 Embeddings for RAG · 182 Vector Databases · 183 PostgreSQL + pgvector ·
184 Pinecone · 185 Qdrant · 186 Vector Database Selection · 187 Hybrid Search · 188 Keyword vs Semantic
Search · 189 Retrieval (top-k, filters, scoring) · 190 Reranking · 191 Context Construction ·
192 Citations & Source Attribution · 193 Query Rewriting · 194 Contextual Retrieval ·
195 RAG Evaluation · 196 RAG Failure Modes · 197 Production RAG Architecture (synthesis)

### Module 10 — AI Agents (L198–216) — Phase 4
198 What Agents Are · 199 Agent vs Workflow · 200 Agent Architecture (the loop) ·
201 Tool Calling for Agents · 202 Planning (ReAct, plan-and-execute) · 203 Reasoning Patterns ·
204 Tool Selection & Routing · 205 Agent Loops & Termination · 206 Agent Memory · 207 Agent State &
Persistence · 208 Human-in-the-Loop · 209 Guardrails for Agents · 210 Multi-Agent Systems ·
211 Agent Failure Modes · 212 Agent Security · 213 Agent Observability · 214 LangChain · 215 LangGraph ·
216 MCP & Production Agent Architecture (synthesis)

### Module 11 — AI Automation (L217–232) — Phase 5
217 AI Workflows · 218 n8n · 219 Make · 220 Webhooks & Event-Driven Automation ·
221 Scheduled Jobs & Cron for AI · 222 Queues & Background Workers for AI · 223 AI + CRM ·
224 AI + Email · 225 AI + Slack / Messaging · 226 AI + Databases · 227 AI + External APIs ·
228 Human Approval Workflows · 229 Business Process Automation · 230 AI Automation Architecture ·
231 Multi-Agent Automation · 232 Automation Failure & Recovery

### Module 12 — Backend & Distributed Systems for AI (L233–260) — Phase 6
233 API Architecture for AI Products · 234 REST Best Practices (review) · 235 GraphQL Basics ·
236 API Gateways · 237 Authentication · 238 Authorization · 239 OAuth 2.0 & OIDC · 240 JWT ·
241 RBAC & Fine-Grained Access · 242 Rate Limiting · 243 Redis · 244 Caching Strategies ·
245 Message Queues & DLQs · 246 Amazon SQS · 247 SNS & Pub/Sub · 248 Event-Driven Architecture ·
249 Background Jobs & Workers · 250 WebSockets · 251 SSE & Streaming Protocols · 252 Microservices ·
253 Modular Monoliths · 254 Service-to-Service Communication · 255 Idempotency · 256 Retries & Backoff ·
257 Circuit Breakers & Bulkheads · 258 Fault Tolerance & Graceful Degradation ·
259 Distributed Systems Concepts (review) · 260 Backend Architecture for AI SaaS (synthesis)

### Module 13 — Cloud & AWS for AI (L261–287) — Phase 7
261 AWS Fundamentals (regions, AZs) · 262 IAM · 263 VPC & Networking · 264 EC2 · 265 S3 ·
266 Lambda · 267 API Gateway · 268 RDS & PostgreSQL on AWS · 269 ElastiCache & Redis ·
270 SQS & SNS on AWS · 271 ECS & ECR · 272 CloudFront · 273 Route 53 · 274 CloudWatch ·
275 Secrets Manager · 276 EventBridge · 277 Step Functions · 278 Amazon Bedrock · 279 Bedrock Agents ·
280 Bedrock Knowledge Bases · 281 Bedrock Guardrails · 282 AWS AI Architecture Patterns ·
283 Serverless AI Architecture · 284 Containerized AI Architecture · 285 AWS Cost Optimization for AI ·
286 Multi-Region & DR on AWS · 287 Cloud Architecture for an AI SaaS (synthesis)

### Module 14 — Docker / DevOps / Infrastructure (L288–307) — Phase 8
288 Docker & Containers · 289 Dockerfiles · 290 Docker Compose · 291 Multi-Stage Builds ·
292 Container Networking · 293 Container Security · 294 ECR · 295 ECS & Fargate · 296 CI/CD Fundamentals ·
297 GitHub Actions for AI Apps · 298 Infrastructure as Code · 299 Terraform Fundamentals ·
300 Environment Management · 301 Secrets in CI/CD · 302 Deployment Strategies · 303 Canary Deployments ·
304 Rollbacks & Recovery · 305 Observability for AI Deployments · 306 Kubernetes for the AI Architect
(concepts only) · 307 The AI Deployment Pipeline (synthesis)

### Module 15 — AI Security (L308–327) — Phase 9
308 AI Security Threat Model (OWASP LLM Top 10) · 309 Prompt Injection · 310 Jailbreaks ·
311 Indirect Prompt Injection · 312 Data Leakage · 313 Sensitive Data & PII · 314 Excessive Agency ·
315 Unsafe Tool Calling · 316 Malicious Documents & RAG Poisoning · 317 Model Abuse ·
318 Rate Limiting & Abuse Prevention · 319 Auth for AI APIs · 320 Tenant Isolation for AI (L134 payoff) ·
321 Secret Management · 322 Audit Logs & Governance Records · 323 Secure Tool Architecture ·
324 Human Approval as a Security Control · 325 AI Security Architecture (defense in depth) ·
326 OWASP LLM Top 10 Walkthrough · 327 Securing the RAG + Agent Stack (synthesis)

### Module 16 — AI Observability & Evaluation (L328–346) — Phase 10
328 AI Observability Fundamentals · 329 Logging · 330 Tracing · 331 Metrics · 332 Token Usage Tracking ·
333 Latency & TTFT Monitoring · 334 Cost Tracking · 335 Model Performance Monitoring ·
336 Hallucination Detection · 337 Groundedness Evaluation · 338 Retrieval Evaluation ·
339 Tool Success Rate · 340 Agent Evaluation · 341 Regression Testing for AI · 342 Evaluation Datasets ·
343 LLM-as-a-Judge · 344 LangSmith · 345 Langfuse · 346 OpenTelemetry for AI (synthesis)

### Module 17 — AI System Design (L347–358) — Phase 11
347 System Design Protocol for AI (L102 spine applied) · 348 AI Chat System · 349 RAG Platform ·
350 AI Customer Support · 351 AI Sales Assistant · 352 AI Recruiting Platform ·
353 AI Document Processing System · 354 AI Coding Assistant · 355 AI E-commerce Assistant ·
356 AI Automation Platform · 357 Multi-Tenant AI SaaS · 358 High-Scale AI System

L348–L358 each teach the full 18-point design structure: requirements, functional + non-functional
requirements, constraints, architecture, components, data flow, API design, database design, model
selection, RAG/agent architecture, security, scalability, reliability, observability, cost, failure
modes, trade-offs.

### Module 18 — Enterprise AI Solutions Architecture (L359–380) — Phase 12
359 Requirements Gathering for AI · 360 Stakeholder Communication · 361 Architecture Decision Records ·
362 Technology Selection · 363 Build vs Buy · 364 Vendor Selection · 365 Model Selection at Scale ·
366 Cloud Selection · 367 Architecture Trade-offs · 368 Cost Estimation & Budgeting · 369 Capacity Planning ·
370 Scalability Planning · 371 Security & Compliance (SOC 2, GDPR, HIPAA) · 372 Data Governance ·
373 AI Governance · 374 Disaster Recovery & Business Continuity · 375 Enterprise Integration ·
376 Legacy System Integration · 377 Multi-Cloud Concepts · 378 AI Platform Architecture ·
379 Enterprise AI Case Study · 380 The Architect's Toolkit (synthesis)

### Module 19 — Capstone Projects (L381–386) — Phase 13
381 Project 1 — Production RAG SaaS · 382 Project 2 — AI Agent with Tools + Human Approval ·
383 Project 3 — AI Business Automation Platform · 384 Project 4 — Multi-Tenant AI SaaS ·
385 Project 5 — Enterprise AI Assistant · 386 Project 6 — Complete AI Solutions Architecture Case Study

Each project lesson covers: business problem, requirements, architecture, tech stack, database design,
AI architecture, security, cloud architecture, implementation phases, testing, monitoring, cost
considerations, scaling strategy, failure scenarios, interview explanation.

## Milestones (M18–M30) with claim criteria

| Milestone | Module | Range | Claim it when… |
|---|---|---|---|
| M18 | AI & LLM Foundations | 135–157 | You can classify any model, budget tokens, and pick a provider with a decision rule |
| M19 | AI Application Engineering | 158–173 | You can build a streaming, tool-calling AI app with the Vercel AI SDK |
| M20 | RAG / Knowledge Systems | 174–197 | You can design an ingestion → retrieval → synthesis pipeline and evaluate it |
| M21 | AI Agents | 198–216 | You can build a guarded, observable agent loop with tools + HITL |
| M22 | AI Automation | 217–232 | You can turn a business process into an event-driven AI workflow |
| M23 | Backend & Distributed | 233–260 | You can design the async, fault-tolerant backend of an AI SaaS |
| M24 | Cloud & AWS for AI | 261–287 | You can deploy a Bedrock + Lambda + pgvector AI stack with cost controls |
| M25 | Docker / DevOps | 288–307 | You can ship an AI service through CI/CD with rollbacks |
| M26 | AI Security | 308–327 | You can threat-model an LLM app and close the OWASP LLM Top 10 |
| M27 | Observability & Evaluation | 328–346 | You can detect regressions and ground an eval dataset in CI |
| M28 | AI System Design | 347–358 | You can run any AI system-design prompt through the 4-phase spine |
| M29 | Enterprise AI Architecture | 359–380 | You can take a business requirement to an ADR + costed architecture |
| M30 | Capstone Projects | 381–386 | Six production-grade projects + a complete architecture case study |

## Lesson format (matches the house style — verified against L134)

Each lesson file: `# Lesson N — Title`, `**Interview importance:** ⭐…` lede paragraph(s), then the
18-section structure (each `##` becomes a reader step):
1. One-line definition · 2. Mental model · 3. Visual flow (ASCII diagram) · 4. How it works ·
5. Real project usage · 6. Interview explanation · 7. Senior-level insights · 8. Common mistakes ·
9. Best practices · 10. Interview questions (**Q** bold + blockquote answers → interview cards) ·
11. Follow-up questions · 12. Comparison table · 13. Code example (JS/TS; ` ```js {n} ` highlights,
` ```narrate ` fences for read-aloud) · 14. Performance notes · 15. Debugging scenarios (table) ·
16. Quick revision notes · 17. Cheat sheet (` ```text `) · 18. Key takeaways (`> [!RECAP]`) ·
then `## Check your understanding` (numbered questions) and a closing note.
Callouts `> [!NOTE] [!TIP] [!PITFALL] [!WARNING] [!DEEPDIVE]` are supported.
Cross-reference existing lessons by number (L102 spine, L134 tenancy, L81 caching, etc.).

## Files changed by this work

**Scaffold milestone (module-independent):**
- `docs/ai-solutions-architect-curriculum.md` — this document, committed first.
- `src/lib/curriculum.ts` — extend `Accent` union with 13 muted names; append 13 `ModuleDef`s and all
  252 lesson rows (difficulty, interview frequency, prereqs — sequential within module, key
  cross-module edges, e.g. RAG prereqs on 147 embeddings; model/API lessons cross-ref 160–171).
- `src/app/globals.css` — 13 new `--acc-*` tokens (light + dark, muted low-chroma) + 13 `.acc-*`
  classes. Design note: 19 hues is at the edge of the "muted, not decorative" rule — keep them
  deliberately desaturated; if they read as noise, consolidate modules later.
- `src/components/knowledge-graph.tsx` — add the 13 accents to the `ACCENT` map (theme-token driven).
- Copy fixes so totals stay truthful: `src/app/opengraph-image.tsx` alt ("React, TypeScript and
  Next.js concepts"), `src/app/page.tsx` hero line ("…and Laravel"), `src/app/graph/page.tsx`
  description, `CLAUDE.md` "104 lessons"/"109 pages" comments, `README.md` build-script line.
- `README.md` — add M18–M30 milestone rows; add Module 7–19 sections with lesson tables (per module,
  as it lands); add "AI Solutions Architect Curriculum" pointer to `docs/…`.
- `PROGRESS.md` — add `## Module 7 …` … `## Module 19 …` checkbox sections.
- `content/07-ai-foundations/00-module-overview.md` — NEW, module 7 overview (house format).

**Per-module milestone:** write `content/<NN-module>/NNN-slug.md` files (18-section format), add
module rows to `README.md` + `PROGRESS.md` as lessons land.

**Commit discipline (per CLAUDE.md):** conventional commits, `content(ai): write lesson N — …` per
lesson or small batch; `feat(curriculum): scaffold the 13-module AI architect curriculum` for the
scaffold; `docs(ai): save the AI architect curriculum plan` for the plan.

## Execution order

1. **Step 0 — Save the plan.** This document, committed as `docs(ai): save the AI architect
   curriculum plan`.
2. **Step 1 — Scaffold.** curriculum.ts (all 13 modules + 252 rows), accents, knowledge-graph map,
   copy fixes, README/PROGRESS skeleton, module 7 overview. `npm run verify` passes. Commit.
3. **Step 2+ — Milestone M18 (Module 7).** Write lessons in batches of 4–6, committing each batch:
   L135–140 (LLM core) → L141–146 (prompting, outputs, tools, streaming, multimodal) →
   L147–152 (embeddings, selection, token/cost/latency, OpenAI) → L153–157 (Anthropic, Gemini,
   abstraction, comparison, review). Update README module-7 tables + PROGRESS checkboxes.
4. **Later milestones** M19–M30 follow the same rhythm, one module per milestone.

## Verification

- `npm run verify` (typecheck + build) after every milestone batch — the build prerenders every
  lesson page + OG image, so a bad row, broken link or Satori-illegal style fails there.
- Check both themes + 1440px/~400px + collapsed rail for new accent tints (per CLAUDE.md).
- Spot-check `/lessons/ai-foundations/135-…`, the dashboard module list, `/graph` filter chips, and
  search ("prompt injection" finds L309).
- Confirm unwritten lessons render the queued state and are `noindex`.
- Build-time note: 386 pages + 386 OG images will grow the `next build` wall time; acceptable, but
  keep an eye on it — if it becomes painful, revisit the OG-image path.

## Assumptions & open items

- JS/TS/Node stack throughout the AI modules (no PHP/Laravel content, per the outline).
- All rows scaffolded up front; files land per milestone (the site's queued-lesson state exists for
  exactly this).
- 13 new accents; fallback to consolidating modules if the palette gets noisy.
- `topics.ts` / Laravel topics untouched.
