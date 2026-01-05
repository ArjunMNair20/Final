const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
}

let _client: any = null;

export async function getSupabase() {
  if (_client) return _client;
  if (!supabaseUrl || !supabaseAnonKey) return null;
  // Dynamically import to keep Supabase out of the initial bundle
  const mod = await import('@supabase/supabase-js');
  _client = mod.createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
  return _client;
}

// Synchronous fallback for code paths that need a check but can't await
export function getSupabaseSync() {
  return _client;
}

