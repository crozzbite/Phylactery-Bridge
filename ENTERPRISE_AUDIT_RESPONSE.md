# 🛡️ Enterprise Audit Response: The "Titanium Bones" Plan
> **Status:** AGREED & APPROVED
> **Priority:** CRITICAL (Survival Mode)
> **Objective:** Harden Phylactery Bridge to financial-grade ("SaaS Blindado") standards before Feature Sprint 2.

## 1. Executive Summary
We accept the **Enterprise Audit findings** in full. The current MVP infrastructure is insufficient for a high-risk AI/Fintech product. We are pivoting immediately to **Phase 1.5: Titanium Bones**.

**We will NOT write new features (Billing/workspaces) until the foundation is solid.**

## 2. Integrated Remediation Plan

### 2.1 Architecture: The "Steel Spine" (Hexagonal)
**Audit Finding:** Monolithic BFF, mixed concerns in Controllers.
**Action Plan:** Refactor `src/` into strict layers.

- [ ] **Domain Layer:** Define clean Entities and Value Objects (disconnected from Prisma).
    - `UseCounter` (Logic for limits)
    - `AuditSession` (Logic for state)
- [ ] **Infrastructure Layer:**
    - `PrismaService` (Database Adapter)
    - `OpenAIService` (LLM Adapter)
    - `StripeService` (Payment Adapter)
- [ ] **Application Layer:**
    - Use Cases (e.g., `RegisterUserUseCase`, `StartAuditUseCase`).

### 2.2 Database: Closing the Lich Gaps
**Audit Finding:** Missing fields in User/Deliberation, missing `UsageCounter`.
**Action Plan:** Execute Schema Migration v2.

```diff
model User {
+ displayName      String?
+ avatarUrl        String?
+ suspensionReason String?
+ lastFailedAttempt DateTime?
  // Usage Counter Flattened
+ currentDeliberations Int @default(0)
+ monthlyLimit         Int @default(5)
+ tokensUsed           Int @default(0)
}

model Deliberation {
+ architectModel String? // e.g., "gpt-4-turbo"
+ auditorModel   String? // e.g., "claude-3-opus"
}
```

### 2.3 Security: "Zero Trust" Implementation
**Audit Finding:** Missing Helmet, Rate Limiting, Input Sanitization.
**Action Plan:**
- [ ] Install & Config `helmet` + `cors` (Strict).
- [ ] Implement `ThrottlerGuard` (Global: 100/min, Auth: 5/min).
- [ ] Implement `ZodValidationPipe` globally.
- [ ] **Prompt Guard:** Middleware to scan prompt inputs for injection patterns BEFORE DB save.

### 2.4 Scalability: Async Glue
**Audit Finding:** Sync LLM calls = Request Timeouts.
**Action Plan:**
- [ ] Setup **Redis** (Docker).
- [ ] Install **BullMQ**.
- [ ] Create `DeliberationQueue` and `AuditWorker`.
- [ ] Refactor API: `POST /audit` returns `202 Accepted` + `job_id`.

## 3. Revised Roadmap (The "Survival" path)

| Phase | Name | Focus | Duration |
| :--- | :--- | :--- | :--- |
| **1.5** | **Titanium Bones (NOW)** | Hexagonal Arch, Security, Schema Fixes, Async Queue | **1 Week** |
| **2.0** | **Billing & Subscriptions** | Stripe, Plans, Usage Limits (Built on solid bones) | 1.5 Weeks |
| **3.0** | **AI Engine Integration** | Connecting Python Engine via BullMQ | 1 Week |
| **4.0** | **Launch Prep** | CI/CD, Audits, Polish | 1 Week |

## 4. Decision Log (Resolving Lich's Questions)
1.  **Stripe:** We choose **Stripe Checkout** (Redirect) for maximum security/less PCI burden.
2.  **State Management:** **Signals** for local UI, **SignalStore** for global user/billing state.
3.  **Angular Version:** We target **Angular v20** (Vision). We build on v19 today with strict forward-compatibility (Signals-only) and **REMOVE IONIC** completely to prepare for a pure PWA future.

## 5. Immediate Next Steps ("The Cut")
1.  **Stop Development** on Frontend.
2.  **Focus 100% on Backend Refactor** (Hexagonal + Security).
3.  **Docker Up:** Get Redis running.

> *"We build the bones first. The flesh comes later."*
