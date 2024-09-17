declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ANALYZE: string;
      NEXT_PHASE: 'phase-production-build' | 'phase-development-build';
      NEXT_PUBLIC_VERCEL_ENV: 'development' | 'production';
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: string;
    }
  }
}

export type {};
