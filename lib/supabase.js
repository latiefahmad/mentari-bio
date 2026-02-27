import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Lazy initialization - tidak throw di module level
let _supabase = null;

export function getSupabase() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing environment variables: SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  if (!_supabase) {
    _supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return _supabase;
}

// Named export untuk backward compatibility
export const supabase = {
  from: (...args) => getSupabase().from(...args),
  storage: {
    from: (...args) => getSupabase().storage.from(...args),
  },
};
