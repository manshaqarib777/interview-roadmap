# Lesson 286 — Multi-Region & DR on AWS

**Interview importance:** ⭐⭐⭐⭐⭐ — "how does the AI platform survive a region failure?" — the answer is *the multi-region story*: the replication, the failover, and the RTO/RPO (L286).**

L261 drew the regions and L374 will build the DR discipline (L374); this lesson is **the AWS implementation**: the multi-region & DR on AWS — the replication (the data's copies across the regions, L286), the failover (the traffic's switch, L273), and the RTO/RPO (the recovery contract, L374). The AI platform's shape: the L260 backend (L260) runs in the primary region (L261) with the standby (L286) — the database replicated (L268), the traffic failed over (L273), and the recovery contract (L374) met (L286). This lesson is the L374 DR discipline, AWS-shaped (L286).

The distinction this lesson is built on: a **demo** runs in one region. A **solutions architect** designs the multi-region story (L286): the replication (L286), the failover (L273), and the RTO/RPO (L374) — because the AI platform's availability (L286) is the regions' (L286).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain the replication: the data's copies across the regions (L286)
- Explain the failover: the traffic's switch (L273)
- Explain the RTO/RPO: the recovery contract (L374)
- Explain the multi-region patterns: the active-passive and the active-active (L286)
- Explain the AI shape: the multi-region AI platform (L286)

## 1. One-Line Definition

**The multi-region & DR on AWS is the replication, the failover, and the RTO/RPO story for an AI platform (L286) — the replication (the data's copies: the RDS cross-region read replicas L268, the S3 cross-region replication L265, L286), the failover (the traffic's switch: the Route 53 health check L273 and the failover policy L273, the standby region L261), and the RTO/RPO (the recovery contract: how fast the recovery — the RTO — and how much data lost — the RPO, L374) — the L374 DR discipline, AWS-shaped (L286).**

The one-sentence interview answer: *"The multi-region architecture is the availability's second layer (L286). The layers: the AZ spread (L261) — the first layer, the region's own redundancy (L261); the multi-region (L286) — the second layer, the region's failure (L286). The replication (L286): the data's copies — the RDS cross-region read replicas (L268), the S3 cross-region replication (L265), the ElastiCache rebuilt (L269) (L286). The failover (L273): the traffic's switch — the Route 53 (L273) health check (L273) watches the primary, and the failover policy (L273) routes to the standby region (L261) when the primary fails (L286). The patterns: the active-passive (L286) — the standby idle, the failover on the disaster — and the active-active (L286) — both regions serving (L286). The RTO/RPO (L374): the recovery contract (L374) — the RTO (the time to recover) and the RPO (the data lost) — the cross-region replication (L286) sets the RPO; the failover (L273) and the runbooks (L286) set the RTO (L374). The AI shape: the L260 backend (L260) in the primary (L261), the standby (L286) with the replicated data (L268) and the read traffic (L286) — the model calls (L278) from either region (L286). The L374 DR discipline, AWS-shaped (L286)."*

## 2. Mental Model

Think of the multi-region story as **the company with the headquarters and the branch.** The headquarters (the primary region, L261) runs the business (the L260 backend, L260). The branch (the standby region, L286) keeps the copies: the records (the database, L268) are copied nightly and live (the replication, L286), and the files (the S3, L265) are mirrored (L286). The switchboard (the Route 53, L273) knows the headquarters' pulse (the health check, L273): if the headquarters goes dark (the failure, L286), the switchboard routes the calls to the branch (the failover, L273), and the branch takes over (L286). The contract (the RTO/RPO, L374) says: the business resumes in the hour (the RTO, L374) and at most the last five minutes' work is lost (the RPO, L374). The company works because the copies are kept, the switch is tested, and the contract is known (L286).

```text
   the company (the multi-region, L286)
   ┌────────────────────────────────────────────────────────┐
   │ the headquarters (the primary, L261) · the branch      │
   │ (the standby, L286)                                    │
   │ the copies (the replication, L286) — the DB (L268),    │
   │ the S3 (L265)                                          │
   │ the switchboard (the failover, L273) · the contract    │
   │ (the RTO/RPO, L374)                                    │
   └────────────────────────────────────────────────────────┘
```

The mental model is **the company**: the headquarters, the branch, the copies, and the switchboard (L286).

## 3. Visual Flow — The Region Failure

```text
   the users (L286)
        │
        ▼
   ┌────────────────────── THE SWITCHBOARD (L273) ─────────────────────┐
   │  the Route 53 (L273): the health check (L273) on the primary     │
   └──────────────┬──────────────────────────────────┬────────────────┘
                  ▼                                  ▼
   ┌──────────────────────────┐   ┌──────────────────────────────────┐
   │ THE PRIMARY (L261)       │   │ THE STANDBY (L286)               │
   │ the L260 backend (L260)  │   │ the replicated data (L268)       │
   │ the data (L268, L265)    │◄──┤ the read replicas (L268)         │
   │ the health check fails ──┼──►│ the failover: the traffic (L273) │
   └──────────────────────────┘   └──────────────────────────────────┘
      THE CONTRACT (L374): the RTO — the time to recover (L374)
      the RPO — the data lost (L374) · the runbooks (L286)
```

The flow is the failure: **the health check fails → the failover routes → the standby serves** (L286).

## 4. How It Works — The Story, Part by Part

- **The AZ spread (L261).** The first layer (L261): the region's own redundancy — the multi-AZ database (L268), the compute across the AZs (L261) — the AZ failure (L286) absorbed (L261).
- **The replication (L286).** The data's copies across the regions (L286): the RDS cross-region read replicas (L268), the S3 cross-region replication (L265), the ElastiCache rebuilt from the DB (L269) (L286). The replication sets the RPO (L374).
- **The failover (L273).** The traffic's switch (L273): the Route 53 health check (L273) on the primary, the failover policy (L273) to the standby (L261) — the DNS (L273) and the propagation (L273) set the RTO (L374).
- **The patterns (L286).** The active-passive (L286): the standby idle, the failover on the disaster — the simple, the common (L286). The active-active (L286): both regions serving — the reads split, the writes coordinated (L286) — the complex (L286).
- **The RTO/RPO (L374).** The recovery contract (L374): the RTO — the time to recover (L374); the RPO — the data lost (L374). The replication (L286) sets the RPO; the failover (L273) and the runbooks (L286) set the RTO (L374).

> [!NOTE]
> **The multi-region is the second layer, not the first (L286).** The senior answer layers the availability (L286): the AZ spread (L261) is the first — the region's own redundancy, cheap and automatic (L261); the multi-region (L286) is the second — the region's failure, expensive and deliberate (L286). The AI platform (L260) gets the AZ spread always (L261); the multi-region (L286) when the RTO/RPO (L374) demands it (L286).

## 5. Real Project Usage

- **A multi-region AI SaaS (L357).** The primary region (L261) with the L260 backend (L260), the standby (L286) with the replicated data (L268) and the failover (L273).
- **A global read path (L286).** The active-active (L286): the read replicas (L268) in both regions (L286) — the users read from the nearest (L151).
- **A regulated platform (L371).** The RPO by the compliance (L371) — the cross-region replication (L286) meeting the residency (L261).
- **A disaster-recovery drill (L286).** The runbooks (L286) tested — the failover (L273) rehearsed, the RTO (L374) measured.
- **Anything with the RTO/RPO (L374).** The multi-region story (L286) — the L374 contract (L374), AWS-shaped (L286).

The through-line: **the multi-region is the availability's second layer** — the copies, the switch, and the contract (L286).

## 6. Interview Explanation

Say it in four moves:

1. **The layers.** "The AZ spread (L261) first; the multi-region (L286) second."
2. **The replication.** "The RDS cross-region replicas (L268), the S3 replication (L265)."
3. **The failover.** "The Route 53 health check (L273) and the failover policy (L273)."
4. **The contract.** "The RTO (the time to recover) and the RPO (the data lost) (L374)."

## 7. Senior-Level Insights

- **The layers compose (L286).** The AZ spread (L261) for the region's own failures (L261); the multi-region (L286) for the region's failure (L286) — the senior answer names both (L286).
- **The replication sets the RPO (L374).** The cross-region replicas (L268) and the S3 replication (L265) — the data loss (L374) is the replication's lag (L286).
- **The failover sets the RTO (L374).** The health check's interval (L273) and the DNS propagation (L273) — the recovery time (L374) is the switch's (L286).
- **The active-passive is the default (L286).** The standby idle (L286) — the simple, the predictable (L286); the active-active (L286) for the reads (L286) — the complexity (L286) is the writes' (L286).
- **The runbooks are the recovery (L286).** The rehearsed failover (L286) — the L304 rollback (L304) and the L374 DR (L374) — the tested path (L286).

## 8. Common Mistakes

- **The single region (L286).** No standby (L286) — the region failure (L286) is the total outage (L286).
- **The replication without the failover (L286).** The copies in the standby (L268) with no Route 53 switch (L273) — the recovery (L374) manual (L286).
- **The failover without the runbooks (L286).** The switch untested (L286) — the RTO (L374) unknown (L286).
- **The active-active for the writes (L286).** The multi-writer coordination (L286) — the L259 consistency (L259) complexity (L286).
- **The RTO/RPO undefined (L374).** The contract unset (L374) — the recovery (L286) unmeasurable (L286).

## 9. Best Practices

- **Layer the availability** (L286) — the AZ spread (L261), then the multi-region (L286).
- **Replicate for the RPO** (L374) — the cross-region replicas (L268), the S3 replication (L265).
- **Automate the failover** (L273) — the health check (L273) and the failover policy (L273).
- **Rehearse the runbooks** (L286) — the tested failover (L286), the measured RTO (L374).
- **Choose the pattern by the writes** (L286) — the active-passive (L286) unless the reads pay for the active-active (L286).

## 10. Interview Questions

**Q: Walk me through the multi-region story.**
> A: The availability's second layer (L286). The first layer is the AZ spread (L261). The multi-region (L286): the replication — the RDS cross-region replicas (L268) and the S3 replication (L265); the failover — the Route 53 health check (L273) and the failover policy (L273) to the standby (L261); and the contract — the RTO (L374) and the RPO (L374).

**Q: What's the RTO/RPO?**
> A: The recovery contract (L374). The RTO — the time to recover: how fast the standby (L286) serves after the failure (L374) — set by the failover (L273) and the runbooks (L286). The RPO — the data lost: how much the replication (L286) lags (L374) — set by the cross-region replication (L268). The contract (L374) is the architecture's requirement (L286).

**Q: Active-passive or active-active?**
> A: By the writes (L286). The active-passive (L286): the standby idle, the failover on the disaster — the simple, the common (L286). The active-active (L286): both regions serving — the reads split (L286), the writes coordinated (L286) — the L259 consistency (L259) cost (L286). Most AI platforms (L260) run the active-passive (L286) with the read replicas (L268).

**Q: How do you test the DR?**
> A: The runbooks (L286): the rehearsed failover (L286) — the health check (L273) forced, the traffic (L273) switched, the RTO (L374) measured, the rollback (L304) practiced. The untested DR (L286) is the imaginary DR (L286).

## 11. Follow-Up Questions

- What are the layers (L286)?
- What's the replication (L286)?
- What's the failover (L273)?
- What's the RTO/RPO (L374)?
- Active-passive or active-active (L286)?

## 12. Comparison Table — The Patterns

| | The active-passive (L286) | The active-active (L286) |
|---|---|---|
| The standby (L286) | idle (L286) | serving (L286) |
| The failover (L273) | the full switch (L273) | the per-request routing (L273) |
| The writes (L286) | the primary (L261) | the coordination (L259) |
| The RTO (L374) | the switch's time (L374) | the immediate (L374) |
| The cost (L285) | the standby idle (L285) | both regions live (L285) |
| The use (L286) | most AI platforms (L260) | the global reads (L286) |

The senior read: **the pattern is the writes' choice** — the simple passive unless the reads pay for the active (L286).

## 13. Code Example — The Story, Declared

```js
// The multi-region story (L286) — the copies, the switch, the contract (L286).
// THE REPLICATION (L286) — the data's copies (L286).
const rds = {
  primary: 'us-east-1',                        // the primary region (L261)
  crossRegionReplica: 'us-west-2',             // the standby's copy (L268)
  promotion: 'failover',                       // the RPO: the lag (L374)
};
const s3 = {
  bucket: 'ai-docs',
  replication: { to: 'us-west-2', prefix: 'tenant/' },  // the S3 copy (L265)
};

// THE FAILOVER (L273) — the traffic's switch (L273).
const route53 = {
  record: 'api.example.com',
  healthCheck: { path: '/health', interval: 30 },   // the pulse (L273)
  failover: {
    primary: 'us-east-1',                      // the primary (L261)
    standby: 'us-west-2',                      // the standby (L286)
    type: 'active-passive',                    // the pattern (L286)
  },
};

// THE CONTRACT (L374) — the RTO and the RPO (L374).
const contract = { rto: '15 min', rpo: '5 min' };   // the runbooks (L286)
```

```text
What the reader must SEE — the story, declared:

  crossRegionReplica + replication → the copies (L268, L265)
  healthCheck + failover → the switch (L273)
  active-passive         → the pattern (L286)
  rto 15 min, rpo 5 min  → the contract (L374)

  The copies kept, the switch tested, the contract known (L286).
```

```narrate
3-8: The replication — the cross-region replica and the S3 replication set the RPO (L268, L265, L374).
10-16: The failover — the health check and the active-passive policy switch the traffic (L273, L286).
18-20: The contract — the RTO and the RPO, rehearsed in the runbooks (L374, L286).
```

> [!TIP]
> The pair that defines the multi-region story: **the cross-region replica** (the RPO, L268) and **the health-checked failover** (the RTO, L273). **Replicate for the RPO, fail over for the RTO, rehearse the runbooks — the L374 discipline, AWS-shaped (L286).**

## 14. Performance Notes

- **The replica is the read's latency (L286).** The cross-region read replica (L268) — the users read from the nearest (L151), the writes (L286) to the primary (L261).
- **The replication is the RPO's lag (L374).** The async replication (L286) — the data loss (L374) is the lag's (L286).
- **The failover is the RTO's speed (L374).** The health check's interval (L273) and the DNS TTL (L273) — the recovery (L374) is the switch's (L286).
- **The standby is the cost (L285).** The idle standby (L286) — the regions (L285) and the replicated storage (L285) — the DR's price (L285).

## 15. Debugging Scenarios

| Symptom | First check (L286) | The lever |
|---|---|---|
| The region failure is an outage | The standby (L286) | The failover (L273) |
| The data is lost | The replication (L268) | The cross-region replica (L268) |
| The failover doesn't trigger | The health check (L273) | The probe + the policy (L273) |
| The RTO is missed | The runbooks (L286) | The rehearsed failover (L286) |
| The DR bill is high | The standby (L285) | The active-passive sizing (L286) |

## 16. Quick Revision Notes

- The multi-region & DR on AWS = **the copies, the switch, and the contract** (L286).
- The layers: **the AZ spread (L261) first, the multi-region (L286) second**.
- The replication: **the RDS cross-region replicas (L268), the S3 replication (L265)**.
- The failover: **the Route 53 health check (L273) and the policy (L273)**.
- The contract: **the RTO and the RPO (L374)**.

## 17. Cheat Sheet

```text
MULTI-REGION & DR ON AWS = the replication, the failover, the RTO/RPO

THE LAYERS (L286)
  the AZ spread (L261) — the region's own redundancy
  the multi-region (L286) — the region's failure

THE REPLICATION (L286) — THE RPO (L374)
  the RDS cross-region read replicas (L268)
  the S3 cross-region replication (L265)
  the ElastiCache rebuilt from the DB (L269)

THE FAILOVER (L273) — THE RTO (L374)
  the Route 53 health check (L273) on the primary (L261)
  the failover policy (L273) to the standby (L286)

THE PATTERNS (L286)
  the active-passive (L286) — the standby idle, the default (L286)
  the active-active (L286) — both regions serving (L286)

THE CONTRACT (L374)
  the RTO — the time to recover (L374)
  the RPO — the data lost (L374)
  the runbooks (L286) — rehearsed (L286)

INTERVIEW, 4 MOVES
  1 layers  "the AZ spread first, the multi-region second (L286)"
  2 replication "the cross-region copies (L268, L265)"
  3 failover "the health check + the policy (L273)"
  4 contract "the RTO and the RPO (L374)"
```

## 18. Key Takeaways

> [!RECAP]
> - The multi-region & DR on AWS is **the replication, the failover, and the RTO/RPO story for an AI platform** (L286): the replication (L286), the failover (L273), and the contract (L374)
> - **The layers** (L286): the AZ spread (L261) — the region's own redundancy — first; the multi-region (L286) — the region's failure — second
> - **The replication** (L286) is the data's copies — the RDS cross-region read replicas (L268) and the S3 cross-region replication (L265) — setting the RPO (L374)
> - **The failover** (L273) is the traffic's switch — the Route 53 health check (L273) on the primary (L261) and the failover policy (L273) to the standby (L286) — setting the RTO (L374)
> - **The patterns** (L286): the active-passive (L286) — the default — and the active-active (L286) for the global reads (L286)
> - The contract (L374): the RTO (L374) and the RPO (L374), rehearsed in the runbooks (L286) — the L374 DR discipline (L374), AWS-shaped (L286)

## Check your understanding

Answer these without looking back.

1. What are the layers (L286)?
2. What's the replication (L286)?
3. What's the failover (L273)?
4. What's the RTO/RPO (L374)?
5. Active-passive or active-active (L286)?
6. How do you test the DR (L286)?
7. What sets the RPO (L374)?
8. What is the L374 discipline, AWS-shaped (L286)?

## A Closing Note — The Branch, Ready

You now hold the multi-region story: **the copies, the switch, and the contract — with the AZ spread first and the runbooks rehearsed.** The AI platform has its second layer — and the branch is ready (L286).

Next: the capstone — Cloud Architecture for an AI SaaS (L287).
