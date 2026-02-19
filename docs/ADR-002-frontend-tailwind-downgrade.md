# ADR-002: Downgrade to Tailwind CSS v3

## Status
ACCEPTED

## Context
The project was initially configured to use Tailwind CSS v4 (beta/alpha). However, during the implementation of the frontend testing suite, critical integration issues were encountered:
1.  **PostCSS Incompatibility**: The `@tailwindcss/postcss` plugin required by v4 was causing build errors in the Angular CLI's build pipeline.
2.  **Testing Instability**: Unit tests were failing to compile due to style preprocessing errors.
3.  **Ecosystem Maturity**: Tailwind v4 is not yet fully stable or widely supported by the current Angular tooling version.

## Decision
We have decided to **downgrade to Tailwind CSS v3.4** and use the standard `tailwindcss` PostCSS plugin.

## Consequences
### Positive
*   **Stability**: The build and test pipelines are now stable and passing.
*   **Compatibility**: Fully compatible with the current Ionic/Angular stack.
*   **Documentation**: Leveraging the extensive verification and documentation available for v3.

### Negative
*   **Feature Lag**: We cannot use the new CSS-first configuration features of v4.
*   **Future Migration**: A migration to v4 will be required once it hits stable and Angular tooling supports it nativeley.

## Implementation
*   Removed `tailwindcss@4`, `@tailwindcss/postcss`.
*   Installed `tailwindcss@3`, `postcss@8`, `autoprefixer@10`.
*   Reverted `postcss.config.js` to standard commonjs format.
