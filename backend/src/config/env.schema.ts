import { z } from 'zod';

const csvToArray = (raw: string): string[] =>
  raw
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

const stringToBoolean = (raw: string | undefined): boolean => {
  if (raw === undefined) return false;
  const normalized = raw.trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
};

export const envSchema = z
  .object({
    // Server
    PORT: z.string().default('3000').transform(Number),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // Legacy CORS knob — still consumed by main.ts until Phase 4 replaces it.
    ALLOWED_ORIGINS: z.string().default('*').transform((s) => s.split(',')),

    // Hardening: explicit allow-list for browser origins. CSV → string[].
    // Production validation enforced via superRefine below.
    CORS_ALLOWED_ORIGINS: z
      .string()
      .default('http://localhost:8100,http://localhost:4200')
      .transform(csvToArray),

    // Hardening: explicit Swagger/docs gate. Default false everywhere; ops must
    // opt-in (and production additionally requires explicit infra enablement).
    DOCS_ENABLED: z
      .string()
      .optional()
      .transform(stringToBoolean),
    DOCS_PATH: z.string().optional(),

    // Database
    DATABASE_URL: z.string().url(),

    // Redis
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.string().default('6379').transform(Number),

    // JWT
    JWT_SECRET: z.string(),

    // Firebase
    FIREBASE_PROJECT_ID: z.string().optional(),
    FIREBASE_CLIENT_EMAIL: z.string().email().optional(),
    FIREBASE_PRIVATE_KEY: z.string().optional(),
    FIREBASE_DATABASE_URL: z.string().url().optional(),

    // Stripe
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    STRIPE_PUBLISHABLE_KEY: z.string().optional(),

    // Engine
    PHY_ENGINE_URL: z.string().url().optional(),
    PHY_API_KEY: z.string().optional(),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV !== 'production') {
      return;
    }

    if (env.CORS_ALLOWED_ORIGINS.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['CORS_ALLOWED_ORIGINS'],
        message: 'CORS_ALLOWED_ORIGINS must list at least one explicit origin in production',
      });
    }

    if (env.CORS_ALLOWED_ORIGINS.includes('*')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['CORS_ALLOWED_ORIGINS'],
        message: 'CORS_ALLOWED_ORIGINS must not contain "*" in production',
      });
    }
  });

export type EnvConfig = z.infer<typeof envSchema>;
