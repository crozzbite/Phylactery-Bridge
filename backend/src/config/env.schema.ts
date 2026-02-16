import { z } from 'zod';

export const envSchema = z.object({
  // Server
  PORT: z.string().transform(Number).default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ALLOWED_ORIGINS: z.string().transform((s) => s.split(',')).default('*'),

  // Database
  DATABASE_URL: z.string().url(),
  
  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default('6379'),

  // JWT
  JWT_SECRET: z.string(),

  // Firebase
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().email().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),

  // Engine
  PHY_ENGINE_URL: z.string().url().optional(),
  PHY_API_KEY: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;
