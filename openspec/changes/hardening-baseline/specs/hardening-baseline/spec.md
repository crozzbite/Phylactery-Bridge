# Hardening Baseline Specification

## Purpose

Define the minimum environment, documentation, identity, validation, regression-test, and frontend boundary contracts for the `hardening-baseline` change.

## Requirements

### Requirement: Backend Environment and CORS Contract

The backend MUST derive runtime security posture from validated environment configuration. Production CORS MUST allow only explicitly configured trusted origins; non-production MAY allow documented local development origins.

#### Scenario: Production rejects untrusted origins

- GIVEN the backend is running in production
- WHEN a browser request arrives from an origin not present in the configured allowed origins
- THEN the request MUST NOT receive CORS approval
- AND the failure MUST be observable without exposing sensitive configuration values

### Requirement: Swagger and Documentation Exposure

Swagger or equivalent API documentation MUST be gated by environment and explicit configuration. Production documentation endpoints MUST be disabled unless a deliberate enable flag is present.

#### Scenario: Production docs are disabled by default

- GIVEN the backend is running in production without an explicit docs enable flag
- WHEN a client requests the documentation endpoint
- THEN the endpoint MUST NOT expose API documentation

### Requirement: Authenticated Identity Contract

Authenticated requests MUST expose unambiguous identity fields: `firebaseUid` for the Firebase-authenticated subject and `userId` for the internal business user. Protected business endpoints MUST NOT depend on ambiguous `uid` semantics.

#### Scenario: Guard resolves Firebase and internal identities

- GIVEN a valid Firebase-authenticated request maps to an internal user
- WHEN a protected business endpoint handles the request
- THEN the request identity MUST include both `firebaseUid` and `userId`
- AND endpoint behavior MUST use `userId` for internal business operations

### Requirement: Internal User Resolution Failure

Protected beta, billing, and auth-related business endpoints MUST fail closed when a valid Firebase identity cannot be resolved to an internal `userId`.

#### Scenario: Protected endpoint fails without internal user

- GIVEN a request has a valid Firebase token but no resolvable internal user
- WHEN the request reaches a protected beta, billing, or auth business endpoint
- THEN the endpoint MUST reject the operation
- AND it MUST NOT create beta access, billing sessions, or other internal side effects

### Requirement: Sensitive DTO Validation

Sensitive auth, beta, and billing inputs MUST be represented by explicit DTO contracts with validation that rejects missing, malformed, unexpected, or unsafe fields.

#### Scenario: Malformed sensitive input is rejected

- GIVEN a sensitive endpoint receives malformed or extra input fields
- WHEN validation runs for the request
- THEN the request MUST be rejected before business side effects occur
- AND the response SHOULD identify validation failure without leaking internals

### Requirement: Focused Regression Coverage

The change MUST include focused regression tests for protected endpoint access, beta identity behavior, billing identity behavior, auth DTO validation, CORS policy, and documentation gating.

#### Scenario: Regression suite covers hardening contracts

- GIVEN the hardening baseline is implemented
- WHEN the focused backend regression tests run
- THEN they MUST verify authorized, unauthorized, unresolved-user, and malformed-input paths
- AND they SHOULD include frontend auth-boundary checks where backend expectations require alignment

### Requirement: Frontend Environment and Auth Interceptor Alignment

Frontend changes MUST be limited to aligning API environment configuration and auth-token propagation with backend hardening expectations. The interceptor MUST attach available auth tokens to protected API calls and SHOULD fail predictably when token acquisition fails.

#### Scenario: Protected API call includes token

- GIVEN a frontend user has an available auth token
- WHEN the frontend sends a protected API request
- THEN the request MUST include the expected authorization credential
- AND frontend environment defaults MUST NOT point production builds at unsafe or local API targets
