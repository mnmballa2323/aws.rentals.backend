import dotenv from 'dotenv';

dotenv.config();

/** Validates that an env var exists and returns its value */
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/** Application configuration derived from environment variables */
export const config = {
  /** Server */
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  isProduction: process.env['NODE_ENV'] === 'production',

  /** Database */
  databaseUrl: process.env['DATABASE_URL'] ?? 'postgresql://postgres:postgres@localhost:5432/rental_home?schema=public',

  /** Firebase */
  firebase: {
    projectId: process.env['FIREBASE_PROJECT_ID'] ?? '',
    serviceAccountPath: process.env['FIREBASE_SERVICE_ACCOUNT_PATH'],
  },

  /** ATTOM Data API */
  attom: {
    apiKey: process.env['ATTOM_API_KEY'] ?? '',
    baseUrl: process.env['ATTOM_BASE_URL'] ?? 'https://api.gateway.attomdata.com',
    rateLimit: parseInt(process.env['ATTOM_RATE_LIMIT'] ?? '200', 10),
  },

  /** Stripe */
  stripe: {
    secretKey: process.env['STRIPE_SECRET_KEY'] ?? '',
    webhookSecret: process.env['STRIPE_WEBHOOK_SECRET'] ?? '',
  },

  /** Checkr */
  checkr: {
    apiKey: process.env['CHECKR_API_KEY'] ?? '',
    baseUrl: process.env['CHECKR_BASE_URL'] ?? 'https://api.checkr.com',
  },

  /** Plaid */
  plaid: {
    clientId: process.env['PLAID_CLIENT_ID'] ?? '',
    secret: process.env['PLAID_SECRET'] ?? '',
    env: process.env['PLAID_ENV'] ?? 'sandbox',
  },

  /** Twilio */
  twilio: {
    accountSid: process.env['TWILIO_ACCOUNT_SID'] ?? '',
    authToken: process.env['TWILIO_AUTH_TOKEN'] ?? '',
    fromNumber: process.env['TWILIO_FROM_NUMBER'] ?? '',
  },

  /** BoldSign */
  boldSign: {
    apiKey: process.env['BOLDSIGN_API_KEY'] ?? '',
  },

  /** Seam (Smart Locks) */
  seam: {
    apiKey: process.env['SEAM_API_KEY'] ?? '',
  },

  /** CORS */
  cors: {
    origins: (process.env['CORS_ORIGINS'] ?? 'http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:3004,https://app.rentalhome.ai,https://www.rentalhome.ai')
      .split(',')
      .map((o) => o.trim()),
  },

  /** Rate Limiting */
  rateLimit: {
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] ?? '60000', 10),
    maxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] ?? '100', 10),
  },
} as const;
