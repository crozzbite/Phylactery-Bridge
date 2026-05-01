## Exploration: hardening baseline

### Current State
Backend hardening primitives exist (Helmet, global validation pipe, request IDs, throttling, exception filter, auth guard), but security posture is uneven across modules and environments. CORS is permissive by default, Swagger is always enabled, some controller paths still use weak request typing, and there are identity mapping inconsistencies (`firebaseUid` vs internal `id`) in protected flows. Frontend auth propagation is in place through an interceptor, but environment/config discipline and guard/error behavior are still baseline-only.

### Affected Areas
- `backend/src/main.ts` - CORS, security headers, and environment-gated Swagger bootstrap.
- `backend/src/config/env.schema.ts` - hardening knobs (origins, docs toggle, security strictness) are incomplete.
- `backend/src/app.module.ts` - global guard/interceptor stack and module import hygiene.
- `backend/src/core/guards/auth.guard.ts` - token verification and request user context contract.
- `backend/src/modules/beta/beta.controller.ts` - uses `req.user.uid` where service expects internal user id.
- `backend/src/modules/billing/stripe.controller.ts` - same identity mapping risk on checkout/portal paths.
- `backend/src/core/auth/auth.controller.ts` - public register endpoint posture and DTO constraints.
- `frontend/src/environments/environment*.ts` - runtime boundary for API endpoint and production safety defaults.
- `frontend/src/app/core/interceptors/auth.interceptor.ts` - token attachment and failure fallback behavior.

### Approaches
1. **Incremental in-app hardening baseline** - tighten existing controls without major architecture changes.
   - Pros: fastest path, low migration risk, aligns with current Nest/Angular structure, can ship in small PRs.
   - Cons: leaves perimeter concerns (WAF/API gateway) mostly external; may accumulate policy logic in app code.
   - Effort: Medium

2. **Security policy layer refactor** - centralize authn/authz/contracts and security config in dedicated modules.
   - Pros: cleaner long-term governance, easier audits, stronger consistency across controllers.
   - Cons: larger blast radius, higher chance of regressions, requires broader test hardening first.
   - Effort: High

3. **Perimeter-first hardening** - keep app mostly as-is, enforce controls at ingress/proxy layer.
   - Pros: strong immediate protection for rate limiting, TLS, request filtering.
   - Cons: does not fix app-level identity and validation inconsistencies; weaker developer feedback loop.
   - Effort: Medium

### Recommendation
Use **Approach 1** as the baseline change, then schedule selective elements of Approach 2 after baseline tests are strengthened. Immediate targets should be: strict CORS policy by env, production Swagger disable flag, identity contract fix (`uid` to internal user id mapping), auth/DTO contract tightening, and security-focused tests on guarded endpoints.

### Risks
- Tightening CORS or auth contracts can break existing frontend flows if rollout is not coordinated.
- Fixing identity mapping may reveal hidden assumptions in beta/billing flows and require data migration checks.
- Security changes without regression tests can introduce availability issues under load or during auth failures.

### Ready for Proposal
Yes - ready for `/sdd-propose hardening-baseline` with phased scope (config hardening, identity consistency, endpoint contracts, and test coverage uplift).
