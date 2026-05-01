# Sprint 2 — Beta Access System: Task Checklist

> Status: ARCHIVED — completed and shipped per `docs/PR-SPRINT2.md` (2026-02-19).
> Retroactively checked to reflect actual implementation state.

## Phase 1: Database (The Bones)
- [x] Create `AccessCode` model in Prisma Schema
  - [x] `code` (String, Unique)
  - [x] `uses` (Int, default 0)
  - [x] `maxUses` (Int, default 1)
  - [x] `isActive` (Boolean, default true)
  - [x] `expiresAt` (DateTime, optional)
- [x] Add `betaAccess` (Boolean, default false) to `User` model
- [x] Run `prisma migrate dev --name v3_beta_access`
- [x] Seed DB with initial "Magic Words" (e.g., `PHY-LAUNCH`, `LICH-INVITE`)
  - [x] Set `maxUses` and `expiresAt` for testing

## Phase 2: Backend (Gatekeeper)
- [x] Implement `BetaService`
  - [x] `redeemCode(userId, code)`: **Atomic Update** logic (Prisma transaction)
  - [x] Handle Race Conditions: `UPDATE ... WHERE ... RETURNING *`
  - [x] Handle Expiry: Check `expiresAt > NOW()`
- [x] Create `BetaController`
  - [x] `POST /beta/redeem` (Handle 400/409)
  - [x] `GET /beta/status`
- [x] Create `BetaGuard` (Route Protection)
  - [x] Intercept requests to protected modules (`/workspaces`, `/deliberation`)
  - [x] If `!user.betaAccess`, throw `403 Forbidden`

## Phase 3: Frontend (The Gate)
- [x] Create `BetaGateComponent` (UI)
  - [x] Input field + "Enter" button
  - [x] Error handling (Invalid Code, Expired)
- [x] Implement `BetaGuard` (Client-side)
  - [x] Check `UserService.currentUser.betaAccess`
  - [x] Redirect to `/beta/gate` if false
- [x] Protect Routes
  - [x] Apply `BetaGuard` to `app-routing.module.ts` (Core features)

## Phase 4: Verification (The Gauntlet)
- [x] **Race Condition Test:** Simulate concurrent requests for the last use of a code.
- [x] **Expiry Test:** Verify expired code is rejected.
- [x] **Security Test:** Try to `curl` a protected endpoint without beta access (Expect 403).
- [x] **UX Test:** User flow from Register -> Gate -> Dashboard.

## Follow-ups carried into `hardening-baseline`

- Swagger gating per environment (security audit 2026-02-19, medium).
- Strict CORS allowed origins for production (security audit 2026-02-19, low).
- Identity normalization (`firebaseUid` vs internal `userId`) so beta/billing endpoints stop relying on ambiguous `req.user.uid`.
- Stripe billing remains deferred to Sprint 6 per `ENTERPRISE_AUDIT_RESPONSE.md`.
