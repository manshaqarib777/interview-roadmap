# Lesson 103 — Portfolio Projects

**Interview importance:** ⭐⭐⭐⭐ — the work you bring in the door decides how much your answers are believed.

Three production-quality projects beat twenty tutorials. Interviewers spend the first ten minutes on
your projects, and every answer you give afterwards is silently checked against them: "does this
person actually ship, or did they follow along with a course?" A project you built, deployed, and can
explain line by line is worth more than a certification you watched.

This lesson scopes the three flagship projects that anchor the rest of your preparation — the ones
named in the roadmap checklist: an **Authentication Dashboard**, an **E-commerce Store**, and an **AI
SaaS Application**. Each one is chosen to prove a specific cluster of skills, and each has a
deliberately small scope so you finish it instead of abandoning it.

## Learning Objectives

By the end of this lesson you should be able to:

- Scope a project so it gets finished — features in, features deliberately left out
- Explain what each of the three flagship projects proves to an interviewer
- Choose the tech stack for each project and defend the choice
- Present a project: README, live demo, deployment, and code quality
- Avoid the twenty-tutorial trap: depth over breadth, one repo per project

## 1. One-line definition

**A portfolio project is a complete, deployed product that demonstrates a cluster of real
engineering skills — not a tutorial you followed, and not a demo that dies on your laptop.**

## 2. Mental model

Think of your portfolio as a **thesis with three chapters**. Each chapter makes one claim about you:

```text
Project 1 · Auth Dashboard  →  "I understand identity, security and data visualisation"
Project 2 · E-commerce Store → "I understand data modelling, transactions and optimistic UI"
Project 3 · AI SaaS App     →  "I understand streaming, async systems and rate limiting"
```

An interviewer who spends ten minutes on these three projects should walk away with a clear picture of
what you can be handed and trusted with. A project is not a trophy — it is evidence.

The opposite mental model is the gallery of half-finished tutorials: twenty repos, each the first
four sections of a course. That signals the exact opposite of what you want: *starts* things, finishes
nothing.

## 3. Visual flow

```text
                        YOUR PORTFOLIO
                              │
        ┌─────────────────────┼──────────────────────┐
        ▼                     ▼                      ▼
   ┌────────────┐      ┌──────────────┐      ┌──────────────┐
   │ Auth       │      │ E-commerce   │      │ AI SaaS      │
   │ Dashboard  │      │ Store        │      │ Application  │
   ├────────────┤      ├──────────────┤      ├──────────────┤
   │ identity   │      │ catalogue    │      │ prompt UI    │
   │ RBAC       │      │ cart         │      │ streaming    │
   │ sessions   │      │ checkout     │      │ rate limits  │
   │ analytics  │      │ optimistic   │      │ billing      │
   └────────────┘      └──────────────┘      └──────────────┘
        │                     │                      │
        ▼                     ▼                      ▼
   ┌────────────────────────────────────────────────────┐
   │  DEPLOYED + LIVE DEMO + README + TESTS + CLEAN GIT │
   └────────────────────────────────────────────────────┘
```

Each column is one skill cluster. The bottom row is the part most people skip — and the part that
makes the difference between "a project" and "proof".

## 4. How it works

A portfolio project has a lifecycle with four stages, and the stages are what make it count:

1. **Scope** — decide the features in and the features out, on paper, before writing code.
2. **Build** — implement it like it's a real product: auth, error states, loading states, empty states.
3. **Polish** — README, demo data, deployment, tests, a sensible git history.
4. **Rehearse** — be able to explain every architecture decision and every trade-off out loud.

The scoping step is the one that separates finishers from starters. The rule is brutal and simple:

> **Cut until the project fits in a month of evenings — then cut one more feature.**

A project that is 80% done is worthless as a portfolio piece. A project that is 100% done and small
beats a project that is 60% done and impressive.

## 5. Real project usage — the three flagship projects

### Project 1 · Authentication Dashboard

**What it proves:** identity, security, and data visualisation — the most immediately hireable cluster.

| Layer | Choice | Why |
|---|---|---|
| Auth | email/password + OAuth (Google/GitHub) | you can explain hashing, sessions, tokens |
| Sessions | JWT or server sessions, httpOnly cookies | you can explain CSRF and XSS surface |
| RBAC | roles: admin / editor / viewer | you can model permissions, not just logins |
| Dashboard | charts of signups, logins, active users | you can turn data into UI |

Features in scope:

- Sign up, sign in, sign out, password reset
- Role-based access: admin sees everything, editor writes, viewer reads
- A dashboard with three charts (signups over time, logins by day, active users)
- Audit log of admin actions (who changed what, when)
- A settings page that only works when you're the right role

Features deliberately out of scope:

- OAuth account linking (login with Google *or* email as one account)
- Multi-tenant organisations
- Email verification flows beyond a stub

**The interview payoff:** "Tell me about your auth project" is a question that lets you talk about
hashing vs encryption, token expiry, refresh tokens, CSRF, and why you chose httpOnly cookies. It is
the single most reusable conversation in a frontend interview.

### Project 2 · E-commerce Store

**What it proves:** data modelling, transactions, and optimistic UI — the bread and butter of
product engineering.

| Layer | Choice | Why |
|---|---|---|
| Catalogue | products, variants, categories | relational modelling under pressure |
| Cart | client-side cart, server-persisted on login | state sync between client and server |
| Checkout | mock payment (Stripe test mode) | you understand the money path |
| Orders | order + order line items | transactions: two writes, one outcome |

Features in scope:

- Product listing with filter + sort (category, price, rating)
- Product detail page with a variant picker (size/colour)
- Cart with quantity editing and optimistic remove
- Checkout with a fake-but-real payment flow (Stripe test mode)
- Order history page, gated behind login
- Admin: add a product (a real CRUD surface)

Features deliberately out of scope:

- Reviews and ratings from other users
- Wishlists
- Coupons and discount codes
- Real payment capture

**The interview payoff:** optimistic cart updates let you explain "server state is not client state"
(Lesson 82) with a concrete example. The order/line-item model lets you talk about transactions and
why `Promise.all` is the wrong tool for a checkout (Lesson 26). The admin CRUD surface proves you can
build forms that matter (Lesson 54).

### Project 3 · AI SaaS Application

**What it proves:** streaming, async systems, and rate limiting — the cluster that makes you look
current.

| Layer | Choice | Why |
|---|---|---|
| UI | chat-style interface with streaming output | you've handled async text, not just JSON |
| Backend | server actions or route handlers | you can own the full path (Lesson 93) |
| Streaming | SSE or a streaming server action | you can explain chunked responses |
| Limits | per-user rate limits + spend caps | you understand cost and abuse |

Features in scope:

- A prompt UI that streams the response token by token
- History of conversations, persisted per user
- Rate limiting: N requests per minute per user, with a clear error state
- A "spend" meter showing tokens used this month
- Prompt presets (e.g. "summarise", "explain", "rewrite") — a small, real product surface

Features deliberately out of scope:

- Fine-tuning models
- Multi-model routing
- Team billing and seats
- Anything that requires an API key on the client

**The interview payoff:** streaming is the current interview darling — explaining how a server action
streams a response, how the client renders partial chunks, and how you rate-limit it, is a genuinely
senior conversation. The spend meter proves you think about cost, which almost no candidate does.

## 6. Interview explanation

*"I built three projects, each targeting a different skill cluster. The auth dashboard proves I
understand identity and security — sessions, httpOnly cookies, RBAC. The store proves I can model
real data — orders and line items — and handle optimistic UI. The AI app proves I can own async
systems end to end: streaming responses, rate limiting, and cost. Each one is deployed, has a
README that explains the decisions, and I can walk through the architecture of any of them."*

That is the whole pitch. It is three sentences, it names the skills, and it invites the follow-up
questions you already know how to answer because you built the things.

## 7. Senior-level insights

- **The scope is the signal.** Saying "I deliberately left out multi-tenant auth because it would
  have doubled the scope and I wanted the core auth flows done properly" is a *senior* sentence.
  Saying "I couldn't get multi-tenant working" is a *junior* sentence. Same gap, opposite framing.
- **Deployed beats local.** A project that runs on Vercel is real; a project that runs on your
  laptop is a screenshot. Deployment forces you to handle environment variables, build errors, and
  CORS — all of which are interview questions.
- **One deep project beats three shallow ones.** If you only have time for one, build the auth
  dashboard and build it completely. Auth touches cookies, security headers, role checks, and
  client/server boundaries — it rehearses more interview material than anything else.
- **The git history is part of the portfolio.** Interviewers do look. A history of small,
  well-described commits ("add session refresh", "fix CSRF on password reset") is itself evidence of
  how you work. One giant "initial commit" is a missed opportunity.
- **Tests are a differentiator.** One test file per project — for the cart reducer, the RBAC
  helper, the rate limiter — is enough to say "I write tests where the logic matters" with a straight
  face.

## 8. Common mistakes

❌ **Building the tutorial's project.** If it's on a course's repo and looks like the course's repo,
the interviewer will ask a question one step past the tutorial and watch you stall.

❌ **Scope creep into abandonment.** The #1 reason portfolios fail is not skill — it's a project that
grew until it was never finished. The scoping table exists to stop this.

❌ **Demo that needs your laptop.** No live URL, no README, "it works locally" — all of these read as
"it doesn't actually work."

❌ **No error states.** A portfolio project where every screen is the happy path tells the
interviewer you've never handled a failed request, a rate limit, or an empty list.

❌ **Secret in the client bundle.** Shipping an API key via `NEXT_PUBLIC_` in the AI project is the
classic leak (Lesson 96) — and it's the first thing a security-minded interviewer will check.

❌ **Portfolio by tutorial count.** Twelve repos from twelve courses says "can follow instructions,"
not "can build." Consolidate into three finished products.

## 9. Best practices

✅ Scope on paper first — features in, features out, and the out-list is written down

✅ Deploy every project and put the URL in the README top line

✅ Write a README that explains *decisions*, not instructions: "I chose X because…"

✅ Give the git history small, descriptive commits

✅ Include one test file per project for the logic that matters

✅ Rehearse a 2-minute walkthrough of each project out loud

❌ Don't start a fourth project before the third one is deployed

❌ Don't put a real secret anywhere in the repo, including the git history

## 10. Interview questions

**Q1. Tell me about a project you're proud of.**

> I built an authentication dashboard. It has email/password and OAuth sign-in, httpOnly cookie
> sessions with refresh, role-based access for admin/editor/viewer, and an audit log. The reason I'm
> proud of it is the RBAC: modelling "who can do what" as data rather than scattered `if` checks
> forced me to think about the whole request path — cookie, session, role, then UI.

**Q2. What was the hardest bug you hit?**

> In the store project, the cart would briefly show a stale total after removing an item, because I
> was reading a server snapshot instead of updating optimistically. The fix was separating server
> state from UI state — the cart UI updates immediately, the server sync happens in the background,
> and they reconcile. That was the lesson that "server state is not client state" (Lesson 82) really
> landed for me.

**Q3. Why did you choose this stack?**

> Next.js for all three, because it's what I'd use at work: server components for the data-heavy
> pages, server actions for mutations, and TanStack Query where the client needs cached server data.
> The stack is a means, not the point — the point is that I can justify each choice against the
> alternative.

**Q4. What would you do differently if you rebuilt it?**

> I'd add tests from the start instead of at the end, and I'd cut the feature set earlier — I
> spent two weekends on features I ended up removing. The scoping discipline I use now would have
> saved a month.

**Q5. Which part of the codebase are you least proud of?**

> The checkout form in the store. It works, but it grew organically and the validation is scattered.
> If I rebuilt it I'd use a schema-first approach so the validation rules live in one place. I kept
> it because it works and shipping was more valuable than a fourth refactor.

**Senior follow-up: What does "production quality" mean to you?**

> It means the failure paths are as real as the happy paths: loading states, error states, empty
> states, and a story for what happens when the server is slow or down. It means a deployed URL, a
> README that explains decisions, and a git history I could walk someone through. And it means scope
> I can defend — I'd rather ship a small thing completely than a large thing partially.

## 11. Follow-up questions

**How do you know your project is secure?**

> I can name the attack surface: the auth headers, the CSRF story for cookie auth, the rate limiter
> on the AI app, and the fact that no secret ever reaches the client. I'd be honest that I used
> well-tested libraries for the cryptography rather than rolling my own.

**What's the data model of the store?**

> A user has many orders; an order has many line items; a line item references a product and a
> variant snapshot — so the order still renders correctly if the product changes later. That
> snapshot is the decision I'd defend.

**Why not use a third-party auth provider for everything?**

> OAuth for social login, but the session and RBAC layers are mine — that's where the interesting
> engineering is, and it's what the interviewer wants to hear about.

## 12. Comparison table

| | Tutorial-follower | Project-builder |
|---|---|---|
| Portfolio | 20 half-finished repos | 3 deployed products |
| Scope | whatever the course said | written down, features in and out |
| Error states | happy path only | loading / error / empty states |
| Deployment | "it works on my laptop" | live URL in the README |
| Git history | one giant commit | small, descriptive commits |
| Interview answer | "I followed a course" | "I chose X because…" |
| Signal | can follow instructions | can be handed a feature |

## 13. Code example

The scoping table is the first "code" you write — and it lives in the README, not the codebase. A
good README section reads like this:

```markdown
## Scope

**In:** sign up/in/out, password reset, OAuth (Google), RBAC (admin/editor/viewer),
three-chart dashboard, audit log, role-gated settings.

**Out:** OAuth account linking, multi-tenant, email verification, dark mode.

**Why the cuts:** the core auth flows + RBAC are the hireable skill. Account linking is a
nice-to-have that doubles the auth surface; cutting it kept the project shippable in scope.
```

And the RBAC check, the piece of logic worth testing, in code:

```js
// roles.ts — the decision table as data, not scattered if-checks
const PERMISSIONS = {
  admin:  ['read', 'write', 'delete', 'audit'],
  editor: ['read', 'write'],
  viewer: ['read'],
};

export function can(role, action) {
  return (PERMISSIONS[role] ?? []).includes(action);
}

console.log(can('admin', 'delete'));  // true
console.log(can('viewer', 'write'));  // false
console.log(can('ghost', 'read'));    // false
```

Output:

```text
true
false
false
```

That one file is the answer to "how did you model roles?" — data, not conditionals.

## 14. Performance notes

- **Perf is a portfolio feature, but only after it works.** A project that is fast and broken is
  worse than one that is slow and correct. Optimise one hot path per project (the dashboard query,
  the product list) and be able to show the profile that justified it — that's Lesson 71 applied.
- **The AI app's streaming is the perf story.** Token-by-token output makes the app *feel* fast even
  when the model is slow. Explain that trade-off: perceived latency vs. total latency.
- **Don't over-engineer.** Lazy loading and memoization on a project with 4 screens is noise. The
  interviewer wants to hear you say "I measured, and it wasn't the bottleneck" at least once.

## 15. Debugging scenarios

| Symptom | Likely cause | Where to look |
|---|---|---|
| "It works locally but not deployed" | env vars not set, or a `NEXT_PUBLIC_` secret missing | Vercel env config, Lesson 96 |
| Cart total is one step behind | reading server snapshot, not optimistic UI | Lesson 82, server/client state split |
| Admin page visible to viewers | role check in UI only, not enforced server-side | RBAC middleware, Lesson 94 |
| Streaming output arrives all at once | response buffered by proxy or missing flush | SSE headers, streaming config |
| "Cannot read property of undefined" in prod | error state never built — API returned `null` | every fetch's error path |

## 16. Quick revision notes

- Three projects: Auth Dashboard, E-commerce Store, AI SaaS — one skill cluster each
- Scope on paper first; the out-list is part of the plan
- Deploy everything; URL at the top of the README
- README explains decisions, not instructions
- Small git commits, one test file per project
- Rehearse the 2-minute walkthrough out loud
- Auth project is the highest-leverage single build

## 17. Cheat sheet

```text
SCOPE   features in ▸ features out ▸ ship date         (cut until it fits, then cut one more)
BUILD   happy path ▸ error path ▸ empty path ▸ edge    (the three states, always)
POLISH  README ▸ deploy ▸ demo data ▸ tests ▸ git      (small commits)
REHEARSE 2-min walkthrough ▸ hardest bug ▸ trade-offs  (say it out loud)
CHECK   no secrets in client ▸ no secrets in git      (Lesson 96, twice)
```

## 18. Key takeaways

> [!RECAP]
> - Three production-quality projects beat twenty tutorials
> - Each flagship project proves one skill cluster: identity, data modelling, async systems
> - Scope is the superpower: write the in-list and the out-list before you build
> - Deployed + README-that-explains-decisions + small git commits = production quality
> - Build the error states — they are half the interview signal
> - Never ship a secret to the client bundle
> - Rehearse the walkthrough: what it does, the hardest bug, and one trade-off

## Check your understanding

Answer these without looking back.

1. What does each of the three flagship projects prove?
2. Why is the out-list part of the scope, not an afterthought?
3. What makes a project "production quality" vs. a demo?
4. What's the difference between saying "I couldn't get X working" and "I cut X deliberately"?
5. Which project would you build if you only had time for one, and why?
6. How would you answer "what's the hardest bug you hit" for the store project?
7. Where do the three states (loading, error, empty) show up in your current portfolio?

## What's Next

**Lesson 104 — Mock Interview Playbook.** The final lesson: how to rehearse everything you've built
and learned — think aloud, optimise second, discuss trade-offs, and close the interview like you
own the room.
