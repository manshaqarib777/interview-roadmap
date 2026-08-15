# Lesson 241 — RBAC & Fine-Grained Access

**Interview importance:** ⭐⭐⭐⭐⭐ — "how do you control access in an AI SaaS?" — the answer is *RBAC + fine-grained*: roles, permissions, and per-resource checks (L238, L320).**

L238's policy is this lesson: **RBAC & fine-grained access** — how the authorization (L238) is implemented: **RBAC** (role-based access control): the roles (admin, editor, viewer), the permissions (the operations), and the role → permission mapping (L241); and **fine-grained access**: the per-resource checks (L241) — the tenant's data, the specific chat, the specific tool (L320). The AI SaaS's shape: the roles decide the scopes (L238), and the per-resource checks enforce the isolation (L320).

The distinction this lesson is built on: a **demo** has an isAdmin flag. A **solutions architect** designs the access model: the roles and the permissions (L241), the role-permission mapping (L241), and the fine-grained checks (L241) — because the AI SaaS's access is per-tenant (L320), per-resource, and per-model (L148).

## Learning Objectives

By the end of this lesson you should be able to:

- Explain RBAC: roles, permissions, and the mapping (L241)
- Explain fine-grained access: the per-resource checks (L241)
- Explain the AI SaaS's shape: roles, tenants, models (L320, L148)
- Explain the decision: RBAC vs fine-grained by the need (L241)
- Explain the enforcement: the policy in the authorization (L238)

## 1. One-Line Definition

**RBAC & fine-grained access is how authorization is implemented — RBAC: the roles (admin, editor, viewer), the permissions (the operations), and the role → permission mapping (L241); fine-grained: the per-resource checks — the tenant, the chat, the tool (L320) — together the access model of the AI SaaS (L241), with the roles deciding the scopes (L238) and the per-resource checks enforcing the isolation (L320).**

The one-sentence interview answer: *"RBAC and fine-grained access are the authorization's implementation (L241). RBAC: the roles — admin, editor, viewer (L241); the permissions — the operations: create, read, update, delete, call-model (L241); and the mapping — the role has the permissions (L241). The user's role decides their scopes (L238). Fine-grained: the per-resource checks (L241) — beyond the role, *which* resource: the tenant's data (L320), the specific chat, the specific tool (L315). The AI SaaS's shape: the roles decide the models (L148) and the tools (L315), and the per-resource checks enforce the tenant isolation (L320). The decision: RBAC for the coarse-grained needs — the role says what (L241); fine-grained for the per-resource needs — the resource says who may touch it (L241). Together, the access model (L260)."*

## 2. Mental Model

Think of the access model as **the building's two kinds of rules.** The first kind: the job-title rules (RBAC, L241) — the managers can open the office doors, the janitors can open the supply closets (the role → permission mapping, L241). The second kind: the per-room rules (fine-grained, L241) — even a manager can't open *every* office: only the offices in their department (the per-resource check, L241), and only the files tagged for their tenant (L320). The building works because the title says *what kind* of access (L241), and the room says *which specific* access (L241).

```text
   the job-title rules (RBAC, L241)     the per-room rules (fine-grained, L241)
   ┌──────────────────────────┐         ┌──────────────────────────────┐
   │ manager → office doors   │         │ manager → THEIR department   │
   │ editor → edit tools      │         │ only (the resource, L241)    │
   │ viewer → read tools      │         │ tenant → ITS data only (L320)│
   └──────────────────────────┘         └──────────────────────────────┘
```

The mental model is **the titles and the rooms**: the role says what kind, the resource says which (L241).

## 3. Visual Flow — The Access Check

```text
   a request to a resource (L241)
        │
        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1 · THE ROLE (L241)                                      │
   │     the user's role → the permissions (L241)             │
   │     may this OPERATION happen? (L238)                    │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2 · THE RESOURCE (L241)                                  │
   │     the fine-grained check: is THIS resource the user's? │
   │     the tenant (L320) · the owner (L241) · the share     │
   └──────────────────┬───────────────────────────────────────┘
                      ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3 · THE VERDICT (L234)                                   │
   │     allowed → the operation (L233)                       │
   │     no role → 403 (L234) · wrong resource → 404 (L320)   │
   └──────────────────────────────────────────────────────────┘
```

The flow is the pair: **the role's permissions, then the resource's check** — the titles and the rooms (L241).

## 4. How It Works — The Roles, the Permissions, the Fine-Grained

- **RBAC (L241).** The role-based model: the roles (admin, editor, viewer — L241), the permissions (the operations — L241), and the mapping (the role has the permissions — L241). The user's role is the coarse-grained gate (L241): the role says *what kind* of operations (L238).
- **The permissions (L241).** The operations: create, read, update, delete, call-model (L148), use-tool (L315). The permission is the operation-level unit (L241).
- **The fine-grained (L241).** The per-resource checks: beyond the role, *which* resource (L241) — the tenant's data (L320), the specific chat's owner (L241), the shared document (L241). The resource check is the isolation's enforcement (L320).
- **The AI SaaS's shape (L260).** The roles decide the models (L148) and the tools (L315); the fine-grained checks enforce the tenant isolation (L320) — the access model of the multi-tenant AI product (L357).

> [!NOTE]
> **RBAC says what kind; fine-grained says which (L241).** The role (L241) is the coarse gate — the editor can edit (L241). The fine-grained check (L241) is the precise gate — the editor can edit *their own* documents, *this tenant's* chats (L320). The senior design uses both: RBAC for the operation-level policy (L241), and the per-resource checks for the isolation and the ownership (L241). The AI SaaS's tenant isolation (L320) is *enforced* by the fine-grained checks (L241) — the role alone can't stop the cross-tenant read (L320).

## 5. Real Project Usage

- **The AI SaaS (L357).** The roles (L241) decide the models (L148) and the quotas (L149); the fine-grained checks (L241) enforce the tenant isolation (L320).
- **The team workspace (L241).** The workspace's roles (L241): the admin, the editor, the viewer — and the per-document shares (L241).
- **The tool access (L315).** The agent's tools (L315) scoped by the role (L241) — the read tools for the viewer, the write tools for the editor (L315).
- **The partner API (L237).** The partner's key (L237) mapped to a role (L241) with the permissions (L241).
- **Anything multi-tenant (L260).** The roles and the fine-grained checks (L241) are the access model (L260) — the isolation enforced (L320).

The through-line: **the roles say the kind, the resources say the which** — the access model of the AI SaaS (L241).

## 6. Interview Explanation

Say it in four moves:

1. **The RBAC.** "The roles (L241), the permissions (L241), the mapping (L241)."
2. **The fine-grained.** "The per-resource checks (L241) — the tenant (L320), the owner (L241)."
3. **The pair.** "RBAC says what kind; fine-grained says which (L241)."
4. **The AI shape.** "The roles decide the models (L148) and the tools (L315); the checks enforce the isolation (L320)."

## 7. Senior-Level Insights

- **The two layers compose (L241).** The senior answer designs both (L241): the RBAC for the operation-level policy (L241), the fine-grained checks for the resource-level isolation (L320).
- **The isolation is the fine-grained's job (L320).** The tenant's data (L320) — the per-resource check (L241) is what stops the cross-tenant read (L312).
- **The permissions are the model's access (L148).** The call-model permission (L148) and the use-tool permission (L315) — the AI SaaS's permissions are the model's surface (L260).
- **The policy is data, not code (L241).** The roles and the mappings (L241) as configuration (L241) — the checks read the config (L238).
- **The fine-grained is the audit's precision (L322).** The per-resource decisions (L241) — the audit trail (L322) knows exactly which resource (L241).

## 8. Common Mistakes

- **The isAdmin flag (L241).** The binary role (L241) — no permissions model (L241), no fine-grained (L241).
- **RBAC only (L241).** The role without the resource check (L241) — the cross-tenant read (L320) possible (L312).
- **Fine-grained only (L241).** The per-resource checks without the roles (L241) — the policy scattered (L241).
- **The policy in code (L241).** The roles hardcoded (L241) — the config (L241) skipped.
- **The over-broad roles (L315).** The admin for everyone (L315) — the least privilege (L315) ignored (L241).
- **The isolation not in the checks (L320).** The tenant unenforced (L320) — the fine-grained's core job missed (L241).

## 9. Best Practices

- **Design the roles and the permissions** (L241) — the operation-level model (L238).
- **Add the fine-grained checks** (L241) — the tenant (L320), the owner (L241).
- **Keep the policy as data** (L241) — the roles as configuration (L238).
- **Include the isolation** (L320) — the tenant in every resource check (L241).
- **Least privilege** (L315) — the narrowest role that works (L241).
- **Audit the decisions** (L322) — the role and the resource in the trail (L241).

## 10. Interview Questions

**Q: What's RBAC?**
> A: Role-based access control (L241): the roles — admin, editor, viewer; the permissions — the operations: create, read, update, delete, call-model (L148); and the mapping — the role has the permissions (L241). The user's role is the coarse-grained gate (L241): it says what *kind* of operations the user may do (L238).

**Q: What's the fine-grained layer?**
> A: The per-resource checks (L241). Beyond the role — *which* resource: the tenant's data (L320), the specific chat's owner (L241), the shared document (L241). The role says the editor may edit; the fine-grained check says the editor may edit *their own* documents (L241). For the AI SaaS, the fine-grained layer is what enforces the tenant isolation (L320).

**Q: How do the two compose?**
> A: RBAC says what kind; fine-grained says which (L241). The role's permissions gate the operation (L238); the resource check gates the specific resource (L241). The senior design uses both: the RBAC for the operation-level policy (L241), and the per-resource checks for the isolation and the ownership (L320) — the role alone can't stop the cross-tenant read (L320).

**Q: What's the AI SaaS's access model?**
> A: The roles decide the model's access (L260): the call-model permission (L148) and the use-tool permission (L315) mapped to the roles (L241). The fine-grained checks enforce the isolation (L320): the tenant's data (L320), the tenant's chats (L241). And the quotas (L149) bound the consumption (L238). The access model is the multi-tenant AI product's spine (L357).

## 11. Follow-Up Questions

- What are the RBAC's three parts (L241)?
- What's the fine-grained layer (L241)?
- How do the two compose (L241)?
- How does the isolation fit (L320)?
- What's the AI SaaS's shape (L260)?

## 12. Comparison Table — RBAC vs Fine-Grained

| | RBAC (L241) | Fine-grained (this lesson) |
|---|---|---|
| Gate | the role | the resource (L241) |
| Asks | what kind of operation? | which specific resource? |
| The unit | the permission (L241) | the resource (L241) |
| The isolation (L320) | doesn't enforce | enforces (L320) |
| The fit (L241) | coarse policy | per-resource precision |
| The pair (L241) | the title | the room |

The senior read: **the columns are the layers** — the role's kind, then the resource's which (L241).

## 13. Code Example — The Access Model

```js
// RBAC + fine-grained: the role's permissions, then the resource (L241).
// THE POLICY (L241) — the roles and the permissions as data (L238).
const RBAC = {
  admin:  ['read', 'write', 'delete', 'call-model', 'manage'],   // L148
  editor: ['read', 'write', 'call-model'],
  viewer: ['read'],
};

// 1 · THE ROLE CHECK (L241) — may this OPERATION happen? (L238).
function can(role, operation) {
  return RBAC[role]?.includes(operation) ?? false;      // the mapping (L241)
}

// 2 · THE FINE-GRAINED CHECK (L241) — is THIS resource the caller's? (L320).
async function authorizeResource(session, resource) {
  if (resource.tenantId !== session.tenantId) return false;      // the isolation (L320)
  if (resource.ownerId && resource.ownerId !== session.userId) {
    return false;                                      // the ownership (L241)
  }
  return true;
}

// THE GATEWAY (L236) — the role, then the resource (L241).
export async function authorize(session, req, resource) {
  if (!can(session.role, req.operation)) return error(403, 'forbidden');   // L234
  if (!(await authorizeResource(session, resource))) return error(404);    // L320 — not found, not forbidden
  return ok();
}
```

```text
What the reader must SEE — the titles and the rooms:

  RBAC[role]          → the role's permissions (L241)
  can(role, op)       → the operation gate (L238)
  resource.tenantId   → the isolation check (L320)
  resource.ownerId    → the ownership check (L241)
  403 vs 404          → the role denied vs the resource hidden (L234, L320)

  The role says the kind; the resource says the which.
```

```narrate
3-6: The policy — the roles and the permissions as data (L241, L238).
8-11: The role check — may this operation happen (L241, L238)?
13-20: The fine-grained check — the tenant (L320) and the ownership (L241): is THIS resource the caller's?
23-25: The gateway — the role first, then the resource; the 403 vs the 404 (L234, L320).
```

> [!TIP]
> The pair that defines the model: **`can(session.role, req.operation)`** (the title, L241) and **`resource.tenantId !== session.tenantId`** (the room, L320). **The role says the kind; the resource says the which — and the 404 hides what the 403 would reveal (L320).**

## 14. Performance Notes

- **The policy is a config read (L151).** The roles (L241) in memory or Redis (L243) — the role check sub-microsecond (L241).
- **The fine-grained is a query (L151).** The resource's tenant and owner (L241) — indexed (L119), fast (L241).
- **The gateway is the latency budget (L151).** The auth (L237) plus the role (L241) plus the resource (L241) — kept fast (L236).
- **The audit records the decisions (L322).** The role and the resource (L241) in the trail (L322) — the precision's cost, required (L241).

## 15. Debugging Scenarios

| Symptom | Likely cause | First thing to check |
|---|---|---|
| Everything allowed | No role check (L241) | The RBAC (L238) |
| Cross-tenant reads | No fine-grained (L320) | The tenant in the check (L241) |
| The wrong access | The policy in code (L241) | The roles as data (L241) |
| The 403 leaks | The resource un-hidden (L320) | The 404 for the wrong tenant (L320) |
| Over-broad roles | The admin everywhere (L315) | The least privilege (L241) |

## 16. Quick Revision Notes

- RBAC = **the roles, the permissions, the mapping** (L241).
- Fine-grained = **the per-resource checks** (L241) — the tenant (L320), the owner (L241).
- The pair: **the role says what kind; the resource says which** (L241).
- The AI shape: **the roles decide the models (L148) and the tools (L315); the checks enforce the isolation (L320)**.
- The policy: **as data, not code** (L241).
- The audit: **the role and the resource in the trail** (L322).

## 17. Cheat Sheet

```text
RBAC & FINE-GRAINED = the access model — the titles and the rooms

THE RBAC (L241)
  roles       admin · editor · viewer (L241)
  permissions the operations — create, read, write, call-model (L148),
              use-tool (L315)
  mapping     the role has the permissions (L241)
  the role says WHAT KIND of operation (L238)

THE FINE-GRAINED (L241)
  the per-resource checks (L241)
  the tenant (L320) · the owner (L241) · the share (L241)
  the resource says WHICH specific access (L241)
  the isolation (L320) is enforced here (L241)

THE PAIR (L241)
  the role's permissions, then the resource's check (L241)
  the 403 for the role denied (L234) · the 404 for the hidden (L320)

THE AI SAAS SHAPE (L260)
  the roles decide the models (L148), the tools (L315), the quotas (L149)
  the fine-grained checks enforce the tenant isolation (L320)
  the access model of the multi-tenant AI product (L357)

THE RULES
  the policy as data, not code (L241)
  least privilege (L315) · the audit records the decisions (L322)

INTERVIEW, 4 MOVES
  1 RBAC     "roles, permissions, the mapping (L241)"
  2 fine     "the per-resource checks (L241)"
  3 pair     "the kind, then the which (L241)"
  4 AI shape "models, tools, quotas by role; isolation by check (L260)"
```

## 18. Key Takeaways

> [!RECAP]
> - RBAC is **the roles, the permissions, and the mapping** (L241) — the role says what *kind* of operations the user may do (L238)
> - **Fine-grained access is the per-resource checks** (L241) — the tenant (L320), the owner (L241) — the resource says *which* specific access (L241)
> - **The two compose** (L241): the role's permissions gate the operation (L238), and the resource check gates the specific resource (L241)
> - **The tenant isolation is the fine-grained's job** (L320) — the role alone can't stop the cross-tenant read (L320); the 404 hides what the 403 would reveal (L320)
> - **The AI SaaS's access model** (L260): the roles decide the models (L148), the tools (L315), and the quotas (L149), and the fine-grained checks enforce the isolation (L320)
> - **The policy is data, not code** (L241) — and the audit (L322) records the role and the resource of every decision (L241)

## Check your understanding

Answer these without looking back.

1. What are the RBAC's three parts (L241)?
2. What's the fine-grained layer (L241)?
3. How do the two compose (L241)?
4. Why is the isolation the fine-grained's job (L320)?
5. What's the AI SaaS's access model (L260)?
6. Why is the policy data, not code (L241)?
7. What does the audit record (L322)?
8. What's the 403 vs the 404 (L320)?

## A Closing Note — The Titles and the Rooms

You now hold the access model: **the roles that say the kind, the permissions that name the operations, and the per-resource checks that guard the which — with the isolation enforced and the decisions audited.** The AI SaaS's access is now a model, not a flag (L241).

Next: the pace at the door — rate limiting (L242), token buckets, per-tenant limits, and the model bill.
