# Proposal: Hardening Baseline

## Objective

Approve a focused hardening baseline for the Bun monorepo (`backend` NestJS, `frontend` Angular/Ionic) that tightens environment, auth, validation, documentation exposure, and regression coverage without changing product scope.

## Background / Current State

Existing backend primitives include Helmet, global validation, request IDs, throttling, exception handling, and auth guards. Current gaps are uneven environment policy, permissive CORS defaults, always-on Swagger/docs, weak request typing in sensitive controllers, and identity ambiguity between `firebaseUid`, Firebase `uid`, and internal user id. Historical FastAPI references are treated as stale audit context.

## Scope

- CORS and environment hardening in backend bootstrap/config.
- Swagger/docs gating by environment and explicit config.
- Identity/auth contract consistency across protected beta, billing, and auth flows.
- DTO/validation tightening for sensitive endpoints.
- Focused tests for protected endpoints plus beta, billing, and auth flows.
- Necessary frontend environment and auth-interceptor alignment only.

## Out of Scope

- Jira, Notion, or n8n automation.
- Major architecture refactor or broad security policy layer rewrite.
- Broad frontend redesign or product feature work.
- Large data migration unless later design proves it required.

## Capabilities

### New Capabilities
- `hardening-baseline`: environment security controls, docs exposure rules, identity contract, endpoint validation, and focused regression coverage.

### Modified Capabilities
- None; no main OpenSpec capability specs exist yet.

## Affected Modules / Packages

- `backend/src/main.ts`: CORS, headers, Swagger gating.
- `backend/src/config/env.schema.ts`: required hardening knobs and validation.
- `backend/src/core/guards/auth.guard.ts`: normalized authenticated user context.
- `backend/src/core/auth/auth.controller.ts`: auth DTO and public endpoint posture.
- `backend/src/modules/beta/beta.controller.ts`: internal user id use.
- `backend/src/modules/billing/stripe.controller.ts`: internal user id use.
- `frontend/src/environments/environment*.ts`: API/auth boundary defaults.
- `frontend/src/app/core/interceptors/auth.interceptor.ts`: token propagation and failure behavior.

## Proposed Approach

Use the incremental in-app hardening path from exploration. First define explicit environment contracts for origins and docs visibility, then normalize authenticated request identity around Firebase uid plus internal user id, tighten DTOs at sensitive endpoints, and add targeted regression tests before applying guarded behavior changes. Frontend work stays limited to matching backend environment/auth expectations.

## Risks

- CORS or docs gating can break local/staging workflows if env defaults are incomplete.
- Identity normalization can expose hidden assumptions in beta or billing flows.
- Validation tightening may reject currently accepted malformed requests.
- Missing fixtures for auth/billing tests may slow implementation.

## Rollback Plan

Revert the hardening change set as one unit. Restore previous CORS/docs config, previous request user shape, prior DTO behavior, and frontend env/interceptor changes. Keep tests as diagnostic references unless they block emergency restore.

## Success Criteria

- `M1: Hardening Baseline Proposal Approved` is accepted as the first milestone.
- Specs/design can proceed from this proposal without reopening Jira/n8n/product scope.
- Later implementation has focused tests covering protected beta, billing, and auth paths.
- Production docs exposure, CORS origins, identity mapping, and sensitive DTO validation are explicit and environment-driven.

## Milestone Mapping

- `M1: Hardening Baseline Proposal Approved`: this proposal defines scope, exclusions, affected modules, approach, rollback, risks, and success criteria for approval.
