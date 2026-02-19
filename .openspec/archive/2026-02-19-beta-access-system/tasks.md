# Sprint 2 — Beta Access System: Task Checklist

## Phase 1: Database (The Bones)
- [ ] Create `AccessCode` model in Prisma Schema
  - [ ] `code` (String, Unique)
  - [ ] `uses` (Int, default 0)
  - [ ] `maxUses` (Int, default 1)
  - [ ] `isActive` (Boolean, default true)
  - [ ] `expiresAt` (DateTime, optional)
- [ ] Add `betaAccess` (Boolean, default false) to `User` model
- [ ] Run `prisma migrate dev --name v3_beta_access`
- [ ] Seed DB with initial "Magic Words" (e.g., `PHY-LAUNCH`, `LICH-INVITE`)
  - [ ] Set `maxUses` and `expiresAt` for testing

## Phase 2: Backend (Gatekeeper)
- [ ] Implement `BetaService`
  - [ ] `redeemCode(userId, code)`: **Atomic Update** logic (Prisma transaction)
  - [ ] Handle Race Conditions: `UPDATE ... WHERE ... RETURNING *`
  - [ ] Handle Expiry: Check `expiresAt > NOW()`
- [ ] Create `BetaController`
  - [ ] `POST /beta/redeem` (Handle 400/409)
  - [ ] `GET /beta/status`
- [ ] Create `BetaGuard` (Route Protection)
  - [ ] Intercept requests to protected modules (`/workspaces`, `/deliberation`)
  - [ ] If `!user.betaAccess`, throw `403 Forbidden`

## Phase 3: Frontend (The Gate)
- [ ] Create `BetaGateComponent` (UI)
  - [ ] Input field + "Enter" button
  - [ ] Error handling (Invalid Code, Expired)
- [ ] Implement `BetaGuard` (Client-side)
  - [ ] Check `UserService.currentUser.betaAccess`
  - [ ] Redirect to `/beta/gate` if false
- [ ] Protect Routes
  - [ ] Apply `BetaGuard` to `app-routing.module.ts` (Core features)

## Phase 4: Verification (The Gauntlet)
- [ ] **Race Condition Test:** Simulate concurrent requests for the last use of a code.
- [ ] **Expiry Test:** Verify expired code is rejected.
- [ ] **Security Test:** Try to `curl` a protected endpoint without beta access (Expect 403).
- [ ] **UX Test:** User flow from Register -> Gate -> Dashboard.
