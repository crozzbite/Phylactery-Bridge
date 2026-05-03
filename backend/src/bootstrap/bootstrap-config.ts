export interface BootstrapConfigInput {
  nodeEnv: 'development' | 'production' | 'test';
  corsAllowedOrigins: string[];
  docsEnabled: boolean;
  docsPath?: string;
}

export interface CorsOptionsInput {
  nodeEnv: BootstrapConfigInput['nodeEnv'];
  corsAllowedOrigins: string[];
}

export interface DocsConfigInput {
  docsEnabled: boolean;
  docsPath?: string;
}

export const DEFAULT_DOCS_PATH = 'api/docs';

// Converts environment-driven CORS inputs into Nest's `enableCors` options.
// Security rule: in production we fail closed if no explicit origins are set.
export const buildCorsOptions = ({ nodeEnv, corsAllowedOrigins }: CorsOptionsInput) => {
  if (nodeEnv === 'production' && corsAllowedOrigins.length === 0) {
    throw new Error('CORS_ALLOWED_ORIGINS must include at least one origin in production');
  }

  return {
    // Only these browser origins can call the API (no wildcard in hardened mode).
    origin: corsAllowedOrigins,
    // Keep credentialed requests (cookies/auth headers) enabled per current contract.
    credentials: true,
  };
};

// Centralizes docs exposure policy so `main.ts` only consumes `enabled + path`.
// If docsPath is missing/blank, we use a safe default.
export const resolveDocsConfig = ({ docsEnabled, docsPath }: DocsConfigInput) => ({
  enabled: docsEnabled,
  path: docsPath?.trim() || DEFAULT_DOCS_PATH,
});
