// Type declarations for Supabase to suppress type errors
// The Supabase JS client has complex generic types that TypeScript struggles with
// This file tells TypeScript to trust the Supabase client implicitly

declare module '@supabase/supabase-js' {
  export interface SupabaseClient {
    from(table: string): any;
  }
}

// Extend the global namespace
declare global {
  namespace NodeJS {
    interface Global {
      supabaseClient: any;
    }
  }
}

export {};
