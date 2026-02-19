# PROPOSAL: Sprint 2 - Beta Access System (Pivot)

## 1. Stakeholders & Concerns (ISO 42010)
*   **Stakeholders:**
    *   **Product Owner (User):** Needs to validate product utility with a controlled cohort.
    *   **End User:** Needs simple access without payment friction.
    *   **Dev Team:** Needs to avoid premature scaling/billing complexity.
*   **Concerns (ISO 25010):**
    *   **Security:** Prevent unauthorized access (Sybil attack).
    *   **Maintainability:** Easy to kill switch or pivot later.
    *   **Usability:** "Magic Word" access (Marketing friendly).

## 2. Problem Statement
We need to restrict access to the platform to a specific group of Beta Testers (200 users) without implementing a full billing engine. 

**Pivot Decision:** 
*   **Move Stripe Integration to Sprint 6 (Launch).**
*   **Implement "Access Code" gatekeeper for Sprint 2.**

## 3. Proposed Solution (High Level)
Implement a **Gatekeeper Module** that intercepts registration/login.

### Scope
1.  **Backend:**
    *   `AccessCode` Entity (Prisma).
    *   `BetaGuard` (NestJS Guard).
    *   `POST /auth/redeem`: Validates code and grants access.
2.  **Frontend:**
    *   `GateComponent`: "Enter your Beta Code".
    *   Blocks all routes except `/auth/*` and `/beta/*` if `!user.betaAccess`.

## 4. Key Decisions (Approved)
*   **Access Model:** Hard Gate. Unregistered users CANNOT enter without code.
*   **Code Strategy:** Shared "Magic Words" (e.g., `PHY-LAUNCH-2026`) with `maxUses` limit (e.g., 200).
*   **Expiration:** Access lasts "While Beta is Active" (Global switch or indefinite).

## 5. Artifacts to Create
*   `specs/beta-access-api.yaml` (OpenAPI)
*   `design/beta-access-flow.mermaid` (Sequence Diagram)
*   `tasks.md` (Implementation Checklist)
