# Lesson 104 — Mock Interview Playbook

**Interview importance:** ⭐⭐⭐⭐⭐ — the last skill you train is the one the whole roadmap was for.

Knowing the answer and being able to say it under pressure are different skills. Every lesson in this
roadmap taught you the *what*; this one teaches the *how* — think aloud, optimise second, discuss
trade-offs. These are not tips. They are a practised protocol, the same way a basketball team runs a
play over and over until it happens without thinking.

By the end of this lesson you will be able to walk into an interview and run a fixed, repeatable
process: a strong open, a calm fundamentals round, a live-coding round where you talk the whole way,
a system-design round where you follow the phases, and a close that leaves a good impression. That
whole arc is *practised*, not improvised.

## Learning Objectives

By the end of this lesson you should be able to:

- Run the five-act interview structure: open, fundamentals, live coding, system design, close
- Think aloud during live coding without going silent under pressure
- Apply "make it work, then make it fast" in any coding prompt
- Discuss trade-offs in the "I chose A because X, the cost is Y" shape
- Handle being stuck without panicking or bluffing
- Run a 2-week mock-interview practice schedule

## 1. One-line definition

**A mock interview is a rehearsal of the full interview arc — open, fundamentals, live coding, system
design, close — under time pressure, with feedback, repeated until the protocol is automatic.**

## 2. Mental model

An interview is not a test you pass or fail. It is a **performance with a known script**. You are not
hoping to be asked things you know; you are *running a process* that surfaces what you know.

The performer's mindset does three things for you:

```text
AMATEUR                          PROFESSIONAL
"hope they ask closures"         "I will steer toward my strengths"
"go silent while I think"        "I think out loud, always"
"answer the question"            "answer the question BEHIND the question"
"panic when stuck"               "stuck is a known drill with a known move"
"wait to be judged"              "I am evaluating this team too"
```

Everything in this lesson is a move in that script. Practise the moves until they're automatic, and
the pressure stops being the thing that breaks you — it becomes the thing that sharpens you.

## 3. Visual flow

```text
  0:00             5:00              25:00              45:00              55:00       60:00
   │                │                  │                   │                 │           │
   ▼                ▼                  ▼                   ▼                 ▼           ▼
┌────────┐     ┌────────────┐     ┌─────────────┐      ┌────────────┐    ┌────────┐   ┌─────────┐
│ OPEN   │────▶│ FUNDAMENTALS│────▶│ LIVE CODING │─────▶│ SYSTEM     │───▶│ CLOSE  │──▶│ FOLLOWUP│
│        │     │            │     │             │      │ DESIGN     │    │        │   │         │
│ 2 min  │     │ 15-20 min  │     │ 20 min      │      │ 15-20 min  │    │ 3 min  │   │ after   │
│ pitch  │     │ questions  │     │ 2 problems  │      │ 1 design   │    │ ask    │   │ email   │
└────────┘     └────────────┘     └─────────────┘      └────────────┘    └────────┘   └─────────┘
   │                │                  │                   │                 │
   │ tell them      │ use the         │ think aloud       │ four phases     │ 2-3 questions
   │ who you are    │ roadmap's       │ make it work      │ (Lesson 102)    │ for them
   │ in 3 sentences │ question banks  │ then make it fast │                 │
```

Not every interview has all five acts, and the order varies. But the *moves* are the same everywhere:
open with a pitch, answer fundamentals with the one-sentence-then-detail shape, code out loud, design
with phases, close with questions. Rehearse the moves, not the specific questions.

## 4. How it works

The protocol has five acts, and each has a job.

**Act 1 · Open (2 min).** "Tell me about yourself." This is not a biography — it's a pitch with a
shape: *who you are now, what you've been working on, why this role.* Three sentences, ending on
something that invites a follow-up.

**Act 2 · Fundamentals (15–20 min).** The question banks from Lessons 97–100. The move is the
**one-sentence-then-detail** shape: answer the question in one crisp sentence first, then expand.
Interviewers hear the first sentence; they evaluate the expansion.

**Act 3 · Live coding (20 min).** Usually two problems. The move is *think aloud, make it work, then
make it fast* — see Section 6 for the full protocol.

**Act 4 · System design (15–20 min).** One prompt, run through the four phases from Lesson 102:
clarify, estimate, design, trade-offs. The move is to *talk in phases*, so the interviewer always
knows where you are.

**Act 5 · Close (3 min).** "Do you have questions for us?" You must have 2–3 — see Section 10.

The through-line of all five acts is the same: **you are always talking**. Silence reads as
uncertainty; a running commentary reads as competence, even when you're wrong.

## 5. Real project usage — where each act comes from

| Act | What you draw on | The roadmap lesson |
|---|---|---|
| Open | Your three portfolio projects | Lesson 103 |
| Fundamentals, JS | Closures, event loop, `this`, promises, debounce | Lessons 97, 5, 22, 10, 24, 18 |
| Fundamentals, TS | Generics, narrowing, utility types, `infer` | Lessons 98, 36, 33, 39, 43 |
| Fundamentals, React | useEffect deps, keys, reconciliation, memo | Lessons 99, 57, 52, 51, 61 |
| Fundamentals, Next | RSC, caching, revalidation, server actions | Lessons 100, 86, 90, 91, 93 |
| Live coding | Debounce, curry, memoize, Promise combinators, hooks | Lessons 18, 16, 17, 26, 65 |
| System design | Feed/chat/dashboard walkthroughs | Lesson 102 |
| Close | Questions about the team, product, and trade-offs | Lessons 71, 82 |

The whole roadmap has been building one thing: a bank of rehearsed moves you can deploy on demand.
This lesson is where you learn to deploy them under fire.

## 6. Interview explanation — the think-aloud protocol

The single highest-leverage skill in live coding is **thinking out loud**. The interviewer cannot
grade what you don't say. The protocol has five beats:

```text
1 · RESTATE   "So the task is to debounce a function that… let me confirm the edge cases."
2 · PLAN      "I'll write a wrapper that captures the timer id in a closure…"
3 · CODE      "Here's the first pass — note I'm ignoring the leading-edge for now."
4 · TEST      "Let me trace: call 1 sets a 300ms timer… so the output should be…"
5 · DISCUSS   "The trade-off: trailing-only means the last call wins, leading-edge fires immediately…"
```

Rules of the protocol:

- **Never code in silence.** If you need a moment, say "let me think out loud for a second" — then
  actually think out loud.
- **Say what you're doing before you do it.** "I'm going to write the happy path first, then handle
  the edge cases."
- **Voice the trade-offs you're making in the moment.** "I'm using a `Map` for the cache here because
  key order matters and object keys are strings."
- **If you're stuck, say what you're stuck on.** "I'm not sure how to type this generic without a
  constraint — let me try `T extends string`." Stuck-and-talking reads as senior; stuck-and-silent
  reads as lost.
- **Test your code by tracing it**, not by hoping. Pick one input, walk the code line by line, say
  the intermediate values.

## 7. Senior-level insights

- **"Make it work, then make it fast" is a philosophy, not a phase.** Optimising before it works is
  how candidates burn 15 minutes on a cache that didn't need to exist. Say the philosophy out loud
  and the interviewer hears "safe to hand a feature to".
- **Discuss trade-offs in the "I chose A because X, the cost is Y, I'd switch if Z" shape.** That
  shape — choice, reason, cost, escape hatch — is the definition of a senior answer. It applies to
  code, architecture, and answers about your own projects.
- **Steer toward your strengths.** The open and the close are the two places you control the
  conversation. Use them to point at what you want to talk about.
- **The "behind the question" question.** "Why are keys important?" is rarely about keys — it's
  "do you understand reconciliation?" Answer the surface question crisply, then take one step deeper
  on purpose. That's the difference between a memorised answer and an owned one.
- **Wrong-but-transparent beats right-by-luck.** Saying "I think this is O(n²) because of the
  splice — let me check" and being wrong is fine. Pretending it's O(n) when you don't know is the
  actual failure.

## 8. Common mistakes

❌ **Going silent while thinking.** The most common failure, and the easiest to fix. Never a second
of unexplained silence — either talk or say "give me a second to think".

❌ **Optimising before it works.** Writing a memoized, generic, debounced solution to a problem that
needs a loop. Work first, then fast.

❌ **Not restating the problem.** Candidates who restate the task ("so you want a function that…")
catch half their misunderstandings before they start.

❌ **Answering only the surface question.** "What's the difference between `useMemo` and
`useCallback`?" → "one caches a value, the other a function" is the surface. Add the "when you should
not use them" and you've owned the question.

❌ **Bluffing.** "I'm not 100% sure about that — here's what I do know" reads as honest and senior.
Inventing a confident answer reads as dangerous.

❌ **No questions at the end.** "Do you have questions for us?" → "No, I think I'm good" is a
missed opportunity and a silent signal of disengagement.

## 9. Best practices

✅ Think aloud, always — restate, plan, code, test, discuss

✅ Make it work, then make it fast, and say that you're doing it

✅ Use the one-sentence-then-detail shape for every fundamentals answer

✅ Discuss trade-offs in the "chose A because X, cost is Y, switch if Z" shape

✅ Say what you're stuck on — stuck-and-talking is senior

✅ Have 2–3 questions for the interviewer ready before the interview

❌ Don't rehearse memorised definitions — rehearse the *shape* of answers

❌ Don't leave silence unexplained

❌ Don't optimise before it works

## 10. Interview questions

**Q1. Tell me about yourself.**

> I'm a frontend engineer who's spent the last while going deep on the fundamentals — JavaScript
> internals, TypeScript, React, and Next.js — because I believe most senior bugs are foundation
> bugs wearing a costume. My recent projects are an auth dashboard, an e-commerce store, and an AI
> app, and I'd love to talk about any of them. What does the frontend team here work on most?

That's the shape: present tense, proof by projects, and an ending that hands the conversation back.

**Q2. Why are you interested in this role?**

> Three reasons: the product is something I'd actually use, the stack matches what I work in daily —
> React and Next.js — and the team seems to care about the fundamentals, which is where I want to
> keep growing. What's the team's biggest technical challenge right now?

**Q3. What questions should I ask at the end?**

> Pick from three buckets:
> - **Product:** "What's the biggest challenge the team is facing this quarter?"
> - **Team:** "How does the team handle code review and technical disagreements?"
> - **Trade-off:** "What's a decision the team made recently that was controversial, and how did it
>   land?"
>
> All three invite a story, and stories are what you learn from. Avoid questions that are answered
> by the job posting, and avoid "how many people work here" trivia.

**Q4. What do you do when you're stuck on a problem?**

> I say what I'm stuck on out loud, then I pick the cheapest probe: a small test, a print, a
> reproduction. If I've been stuck over a threshold, I step back and re-read the problem statement —
> a surprising share of the time I've misread the requirements, not the code. And if I'm truly
> blocked I'll say so and ask for a hint rather than burning the clock.

**Q5. How do you handle a question you don't know the answer to?**

> I'm honest about it, and I give the interviewer the most useful thing I have: what I do know,
> what I'd try, and where I'd look it up. Bluffing a confident wrong answer is worse than a
> transparent "I don't know, but here's my model of it."

**Senior follow-up: What does "senior" mean to you?**

> It's not years of experience. It's being safe to hand a large feature to: you ask the clarifying
> questions before writing code, you make the failure paths as real as the happy paths, you discuss
> trade-offs instead of defending preferences, and you say "I don't know" without flinching. The
> title follows the behaviour.

## 11. Follow-up questions

**How do you practise?** Mock interviews with a timer, recorded, reviewed. Two rounds a week for two
weeks, each one followed by a 10-minute written review of what went well and what broke.

**What if I freeze in the moment?** Run the stuck drill: restate the problem out loud, name the part
you're stuck on, pick the cheapest probe. Freezing is a scripted moment — you have a move for it.

**How much should I practise out loud?** Everything you can. Reading answers silently trains recall;
saying them trains delivery. The roadmap's "say it out loud without notes" rule is exactly this.

## 12. Comparison table

| | Rehearsed | Unrehearsed |
|---|---|---|
| Open | 3-sentence pitch, steers to strengths | biography, 5 minutes |
| Fundamentals | one-sentence-then-detail shape | rambling, no structure |
| Live coding | restate → plan → code → test → discuss | silent, then a guess |
| Stuck | "I'm stuck on X, let me probe Y" | silence, or a bluff |
| Trade-offs | "chose A because X, cost Y, switch if Z" | defends one option |
| Close | 2–3 questions that invite stories | "no questions" |
| Result | consistent, confident, hirable | inconsistent, varies with luck |

## 13. Code example

The think-aloud protocol, applied to the most common live-coding prompt — implement `debounce` from
scratch. Notice the shape: *this is what the interview actually looks like.*

```js
// The interviewer says: "Implement a debounce function."

// Candidate, out loud:
// "Let me restate: I want a function that takes a function and a delay, and
//  returns a new function that only runs the original after the delay has
//  passed since the last call. So the last call wins.
//
//  I'll capture the timer in a closure, and on each call clear it and set a
//  new one. First pass — ignoring leading-edge and `this` forwarding for now,
//  I'll come back to those if there's time."

function debounce(fn, delay) {
  let timer = null;

  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

let count = 0;
const inc = debounce(() => { count += 1; }, 100);

inc(); inc(); inc();
setTimeout(() => console.log('after 150ms:', count), 150);
```

Output:

```text
after 150ms: 1
```

Then the candidate continues:

```js
// "Now the trade-off: this is trailing-only debounce. The last call wins.
//  A leading-edge version fires on the first call and ignores the rest —
//  I'd add an `immediate` flag. And I should forward `this` and `cancel()`
//  for production. But for this prompt, trailing-only answers what was asked."

console.log('trailing-only debounce: last call wins.');
```

Output:

```text
trailing-only debounce: last call wins.
```

Restate → plan → code → test → discuss. That's the whole protocol, and it fits any prompt.

## 14. Performance notes

- **Optimise second, and say so.** The interviewer is grading your *process*. "I'll make it work
  first" is a process statement they want to hear.
- **The right complexity discussion is brief.** After it works, name the complexity in one sentence
  ("this is O(n) — the filter is the linear part") and move on. A five-minute complexity lecture is
  its own failure mode.
- **Mention the trade-off, not the micro-optimisation.** "A `Map` here because keys are objects"
  beats "I could shave 2ms with a preallocated array" — unless the interviewer asks for the latter.

## 15. Debugging scenarios

| Symptom | Likely cause | The move |
|---|---|---|
| Mind goes blank on a question | you tried to recall a memorised answer | restate the question out loud; answer the shape, not the words |
| Code won't run and you're stuck | you skipped the test step | trace one input by hand, out loud, line by line |
| You don't know a keyword/API | you're afraid to say so | "I don't remember the exact API — I'd look it up, but the idea is…" |
| Interviewer looks confused | your answer lost its shape | back up to the one-sentence answer, then re-expand |
| You're running out of time | no sense of the clock | "I have limited time — let me get the happy path working, then discuss the rest" |

## 16. Quick revision notes

- Five acts: open, fundamentals, live coding, system design, close
- Think aloud, always — restate, plan, code, test, discuss
- Make it work, then make it fast — and say that you're doing it
- One-sentence-then-detail for every fundamentals answer
- Trade-offs in the "chose A because X, cost Y, switch if Z" shape
- Stuck? Say what you're stuck on, then pick the cheapest probe
- Bluffing is the only unforgivable mistake
- Have 2–3 questions for them, ready before you walk in
- 2 weeks of mock interviews: 2 per week, recorded, reviewed

## 17. Cheat sheet

```text
OPEN       3 sentences: who you are ▸ what you build ▸ why this role
FUNDAMENTALS one sentence first ▸ then detail ▸ then one step deeper
LIVE CODE  restate ▸ plan ▸ code ▸ trace ▸ discuss      (never silent)
STUCK      "I'm stuck on X" ▸ cheapest probe ▸ re-read the prompt
TRADE-OFF  chose A because X ▸ cost is Y ▸ switch if Z
CLOSE      2-3 questions that invite stories
```

## 18. Key takeaways

> [!RECAP]
> - An interview is a performance with a known script — rehearse the moves, not the questions
> - Think aloud, always: restate, plan, code, test, discuss
> - Make it work, then make it fast — say that you're doing it
> - One-sentence-then-detail is the shape of every fundamentals answer
> - Trade-offs take the "chose A because X, cost is Y, switch if Z" shape
> - Stuck is a drill: say what you're stuck on, pick the cheapest probe
> - Bluffing is the only unforgivable mistake — transparent beats confident-wrong
> - Have 2–3 questions for the interviewer, ready before the interview
> - Two weeks of timed, recorded, reviewed mocks make the protocol automatic

## Check your understanding

Answer these without looking back.

1. What are the five acts of an interview, and what is the job of each?
2. Write the five beats of the think-aloud protocol from memory.
3. What's the shape of a senior trade-off answer? Give an example.
4. What's the move when you're stuck on a problem?
5. Why is "make it work, then make it fast" a philosophy and not a phase?
6. What are your three questions for the interviewer? Say them out loud.
7. How would you answer "tell me about yourself" in three sentences, right now?

## You're Ready

That was the last lesson. Everything in this roadmap has been building toward the ability to walk
into a room, keep talking, make it work, and discuss the trade-offs — from closures to server
components to the shape of a senior answer. The milestones are all yours to claim now: explain each
lesson out loud without notes, run the exercises, and rehearse the playbook until it's automatic.

Go do the interview. You're ready.
