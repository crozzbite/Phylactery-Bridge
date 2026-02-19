# Audit Design

## Strategy
1.  **Backend Verification**: Confirm strict typing in DTOs and return types.
2.  **Frontend Verification**: Confirm usage of Signals and OnPush strategy.
3.  **Security Scan**: Check for hardcoded secrets and dependency vulnerabilities.

## Tools
- `eslint`
- `retire.js` / `npm audit`
- Manual code review against "SkullRender" standards.
