declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ANALYZE: string;
      NEXT_PHASE: 'phase-production-build' | 'phase-development-build';
      NEXT_PUBLIC_VERCEL_ENV: 'development' | 'production';
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: string;
      NEXT_PUBLIC_GOOGLE_AI_API_KEY: string;
      GOOGLE_SEARCH_API_KEY: string;
      GOOGLE_SEARCH_ENGINE_ID: string;
      GOOGLE_DRIVE_API_KEY: string;
      GEMINI_API_KEY: string;
      GOOGLE_OAUTH_CLIENT_ID: string;
      GOOGLE_OAUTH_SECRET: string;DICTIONARY_API_KEY: string;
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE: string;
      NEXT_PUBLIC_STRIPE_SECRET_KEY_LIVE: string;
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST: string;
      NEXT_PUBLIC_STRIPE_SECRET_KEY_TEST: string;
      STRIPE_WEBHOOK_SECRET: string;
      SENTRY_AUTH_TOKEN: string;
    }
  }
}

export type {};
