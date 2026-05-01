# Tasks: Hardening Baseline

> Scope reminder: tighten env/CORS, docs gating, identity contract, sensitive DTOs,
> and focused regression coverage for the Bun monorepo (NestJS backend +
> Angular/Ionic frontend). No product features, no architecture refactor, no
> distributed cache/load balancer, no Jira/n8n automation in this change.
>
> TDD policy (`openspec/config.yaml` → `strict_tdd: true`): for guard, resolver,
> DTOs, and interceptor, write the failing test FIRST, then the change.
>
> Status code contract: `401` missing/invalid/expired Firebase token; `403` valid
> Firebase token but no internal user; `403` insufficient authorization.

## Phase 1: Foundation — App Hardening Config

- [x] 1.1 Extend `backend/src/config/env.schema.ts` with hardening knobs:
      `NODE_ENV`, `CORS_ALLOWED_ORIGINS` (CSV → string[]), `DOCS_ENABLED`
      (boolean, default `false` in production), `DOCS_PATH` (optional). Validate
      with class-validator/Joi-equivalent already in use; production rejects
      empty `CORS_ALLOWED_ORIGINS` and any `*` value.
- [x] 1.2 Document env vars in `backend/.env.example` (or equivalent). Include
      DEV defaults (`http://localhost:8100,http://localhost:4200`) and a
      `# TODO: production allowed origins to be confirmed` placeholder block
      so prod values stay configurable, not hardcoded.
- [x] 1.3 Create
      `backend/src/core/auth/interfaces/authenticated-request.interface.ts`
      exporting `AuthenticatedUser { firebaseUid: string; userId: string;
      email?: string; claims?: Record<string, unknown> }` and
      `AuthenticatedRequest extends Request { user: AuthenticatedUser }`.
- [x] 1.4 Add internal type alias / re-export so controllers and guards consume
      the normalized identity from a single import path. No `req.user.uid`
      consumers should remain — track them with a TODO list in the PR body
      (will be removed in Phase 3).

## Phase 2: Core — Identity Resolver and AuthGuard (TDD)

- [x] 2.1 RED: write `backend/src/core/auth/identity-resolver.service.spec.ts`
      covering: (a) returns `{ firebaseUid, userId, email?, claims? }` when user
      exists by `firebaseUid`; (b) returns `null`/throws sentinel when user
      missing; (c) does NOT cache cross-request.
- [x] 2.2 GREEN: create
      `backend/src/core/auth/identity-resolver.service.ts` using Prisma
      (`user.findUnique({ where: { firebaseUid } })`). Inject `PrismaService`
      via Nest DI. No external cache.
- [x] 2.3 RED: extend `backend/src/core/guards/auth.guard.spec.ts` (create if
      missing) with scenarios: missing token → `401`; invalid/expired Firebase
      token → `401`; valid token + no internal user → `403`; happy path →
      attaches `{ firebaseUid, userId, email?, claims? }` to `req.user`.
- [x] 2.4 GREEN: update `backend/src/core/guards/auth.guard.ts` to verify the
      bearer with Firebase Admin, call `IdentityResolverService.resolve`, and
      map outcomes to the agreed status codes. Log with request id, never log
      tokens or claims payloads.
- [x] 2.5 Wire DI: update `backend/src/core/auth/auth.module.ts` and/or
      `backend/src/core/core.module.ts` so the guard and protected modules can
      inject `IdentityResolverService` without circular deps.

## Phase 3: Endpoint Hardening — Controllers and DTOs (TDD where sensible)

- [x] 3.1 Replace every `req.user.uid` consumer with `req.user.userId` in
      `backend/src/modules/beta/beta.controller.ts`. Update controller signature
      to `AuthenticatedRequest`. Add/strengthen `RedeemBetaCodeDto` with
      class-validator decorators (`@IsString`, `@Length`, `@Matches`) and
      `forbidNonWhitelisted: true` at the validation pipe.
- [x] 3.2 Same migration in
      `backend/src/modules/billing/stripe.controller.ts`: `userId` for checkout
      and portal flows; introduce explicit DTOs (`CreateCheckoutSessionDto`,
      `CreatePortalSessionDto`). Keep the Stripe webhook signature path
      untouched (raw body + signature header verification).
- [x] 3.3 Update `backend/src/core/auth/auth.controller.ts`:
      - Public `POST /auth/register` keeps an explicit `RegisterDto` with
        validation (no extra fields, length/format constraints).
      - Profile endpoint reads `firebaseUid`/`userId` from the normalized
        identity only; never re-queries Firebase directly.
- [x] 3.4 Verify global `ValidationPipe` config has `whitelist: true`,
      `forbidNonWhitelisted: true`, `transform: true`. If not, add it in
      `backend/src/main.ts` bootstrap. Document the change in the PR.

## Phase 4: Bootstrap — CORS and Swagger Gating

- [x] 4.1 In `backend/src/main.ts`, replace permissive CORS with env-driven
      config: `app.enableCors({ origin: env.CORS_ALLOWED_ORIGINS, credentials: ... })`.
      In production, refuse to boot when `CORS_ALLOWED_ORIGINS` is empty.
- [x] 4.2 Gate Swagger/docs setup behind `if (env.DOCS_ENABLED)`. Production
      with `DOCS_ENABLED=false` MUST return 404 on the docs path. Log a single
      structured line at boot stating whether docs are enabled and which CORS
      origins are active (origins list only, no secrets).

## Phase 5: Frontend Alignment (Minimal)

- [x] 5.1 Update `frontend/src/environments/environment.ts` and
      `environment.prod.ts` so the production build never points at
      `localhost`. Add a TODO marker for the real production API base URL until
      it is confirmed (mirrors backend allowed-origins placeholder).
- [x] 5.2 Update `frontend/src/app/core/interceptors/auth.interceptor.ts` to
      attach the Firebase token to protected requests and handle responses
      predictably:
      - `401` → clear local auth expectation and route to login.
      - `403` with `identityResolutionFailed` signal (status 403 + agreed error
        code/body shape) → route to **registration/onboarding** flow first
        (support is fallback only).
      - `403` insufficient authorization → route to existing denied/beta gate.
      - **Late finding (fixed)**: an outer `catchError` rescued any HTTP error
        and dispatched a second unauthenticated retry request. Refactored to
        scope `catchError` to `from(getIdToken())` only (token failure ⇒
        fall back to no token), and keep a single `catchError(handleAuthErrors)`
        on the actual HTTP request. Eliminates silent retry-without-token risk.
- [x] 5.3 Confirm the frontend auth service exposes a single source of truth
      for "is user fully authenticated" (Firebase token valid AND internal user
      resolved). No global state machine; just align the existing
      service/guard signals with the backend contract.

## Phase 6: Focused Regression Tests

- [ ] 6.1 Backend integration: add e2e test in `backend/test/` covering the
      protected beta path with mocked Firebase + Prisma fixtures: authorized
      success, missing token (401), invalid token (401), valid token + no
      internal user (403), malformed DTO (400).
- [ ] 6.2 Backend integration: same matrix for the protected billing checkout
      path (excluding Stripe webhook).
- [ ] 6.3 Backend integration: CORS policy test (allowed vs disallowed origin)
      and Swagger gating test (`DOCS_ENABLED=false` returns 404 in prod-like
      config).
- [ ] 6.4 Backend unit: `RegisterDto` validation rejects missing required
      fields and unknown extra fields.
- [x] 6.5 Frontend (Karma/Jasmine): minimal interceptor spec — token attached
      when available, `401` triggers logout/redirect, `403 identityResolutionFailed`
      triggers registration/onboarding redirect, `403` generic routes to beta
      gate. Plus `auth.service` fully-authenticated state and `auth.guard`
      redirect contract. **Result**: 9/9 SUCCESS via
      `bun run test -- --watch=false --browsers=ChromeHeadless --include …`
      (interceptor 5/5, service 1/1, guard 3/3).
- [ ] 6.6 Run `cd backend && bun run test` and `bun run test:e2e`, plus
      `cd frontend && bun run test` (or `ng test --watch=false`). All new tests
      must pass before moving to verify. **Partial**: frontend focused suite
      already green (see 6.5). Backend regression suite still pending (depends
      on 6.1–6.4).

## Phase 7: Production-Readiness — Documentation and Rollback Notes

- [ ] 7.1 Add a short hardening section to backend README (or
      `backend/docs/hardening.md`) listing: required env vars, status code
      contract, identity normalization rules, docs gating policy, and the
      Stripe webhook exception. Keep it operational, not tutorial.
- [ ] 7.2 Document the rollback plan in the same file: "revert change-set as
      one unit; restore previous CORS/docs config, prior `req.user.uid` usage,
      DTO leniency, and frontend interceptor/env behavior." Reference the
      OpenSpec change folder.
- [ ] 7.3 Add a CHANGELOG entry (or release note draft) summarizing the
      backend behavior change for consumers (frontend team + ops).

## Phase 8: Deployment Decisions to Validate Later (Placeholders)

> These are NOT implementation tasks. They are explicit follow-ups so we don't
> ship without resolving them. Each MUST be answered before flipping
> `NODE_ENV=production` for real traffic.

- [ ] 8.1 Confirm final production allowed origins (frontend canonical
      domains, mobile origins if any). Replace TODO in env example.
- [ ] 8.2 Confirm `DOCS_ENABLED` policy per environment (default off in prod;
      on in staging?). Document the decision next to the env var.
- [ ] 8.3 Confirm secret/credential delivery path for Firebase Admin and
      Stripe keys in production (out-of-band; do not bake into env example).
- [ ] 8.4 Confirm error response shape for `identityResolutionFailed` so the
      frontend can deterministically branch to onboarding (status `403` +
      stable error code, e.g. `IDENTITY_NOT_RESOLVED`).
- [ ] 8.5 Defer (out of scope, but tracked): no Redis, no distributed cache,
      no load balancer-level CORS in this milestone. Re-open only if profiling
      proves need.

## Learning / Validation Notes (for the architect)

- [ ] L.1 Validate that the guard does the **right ordering**: parse → verify
      Firebase → resolve internal user → attach identity. Wrong order leaks
      side effects on unauthorized requests.
- [ ] L.2 Validate that controllers never call Firebase directly. The whole
      point of the resolver is to make `userId` the single source of truth for
      business operations.
- [ ] L.3 Validate that DTO whitelisting (`forbidNonWhitelisted: true`) is
      global, not per-controller. Per-controller leniency is a regression
      vector.
- [ ] L.4 Validate that the frontend treats "Firebase authenticated but
      unresolved internal user" as an **onboarding state**, not an error
      state. This is a UX correctness decision, not just a routing detail.
- [ ] L.5 Validate that production-readiness is gated by Phase 8 placeholders
      being resolved, not by code being merged. Merging Phase 1–7 does not
      mean we are production-ready.
- [x] L.6 RxJS error scoping in HTTP interceptors: a `catchError` placed at the
      outer level of `pipe(...)` catches ANY upstream error, including those
      re-thrown by inner `catchError`s. Symptom in this change: a 401 triggered
      a fallback request without auth → silent retry + leaked pending request.
      Rule of thumb going forward: scope `catchError` to the producer it is
      meant to recover (`from(promise).pipe(catchError(...))` for the promise),
      and use a separate `catchError` for the actual HTTP failure path.
