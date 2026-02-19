# Pull Request: Sprint 2 - Beta Access System (Pivot)

**Type**: Feature / Architecture Pivot
**Scope**: Backend (NestJS), Frontend (Angular), Database (Prisma)

## 🛡️ Guardian Angel Verification
> _"This PR has been audited by the Phylactery Lich agent."_

| Check | Status | Notes |
| :--- | :--- | :--- |
| **Security Audit** | ✅ PASSED | `helmet` added. `BetaGuard` active. Transacciones atómicas verificadas. |
| **Tests** | ✅ PASSED | Unit tests for BetaService, Guard, and Atomic Logic. |
| **Build** | ✅ PASSED | Frontend compiles. Types are strict. |
| **Migration** | ✅ PASSED | `v3_beta_access` applied. Seeds injected. |
| **Dependencies** | ✅ AUDITED | No unused deps. `helmet` added for headers. |

## 📝 Summary of Changes

### 1. Database (The Bones)
*   **New Entities**: `AccessCode`, `AccessCodeRedemption`.
*   **User Model**: Added `betaAccess` boolean (default `false`).
*   **Seeding**: Added `PHY-LAUNCH` (500 uses) for Beta start.

### 2. Backend (Gatekeeper)
*   **Endpoint**: `POST /beta/redeem` (Rate Limited: 3 reqs/min).
*   **Logic**: Atomic transactions prevent race conditions on code usage.
*   **Security**: `BetaGuard` blocks access to `/workspaces` and `/deliberation`.
*   **Fix**: Added `helmet` middleware for HTTP security headers.

### 3. Frontend (The Gate)
*   **Route**: `/beta-gate` (Lazy loaded).
*   **Guard**: `betaGuard` redirects unauthorized users to the gate.
*   **UI**: Minimalist, terminal-style input for code redemption.

## 📸 Validation
*   [x] User cannot access dashboard without `betaAccess`.
*   [x] Code redemption grants `PRO` role and `betaAccess`.
*   [x] Audit logs are created in `AccessCodeRedemption`.

---
**Ready for Merge**
