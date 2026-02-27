const { createClient } = require("@supabase/supabase-js");

let _supabase = null;

function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

// Proxy object untuk backward compatibility
const supabase = {
  from: (...args) => getSupabase().from(...args),
  storage: {
    from: (...args) => getSupabase().storage.from(...args),
  },
};

module.exports = { supabase, getSupabase };
