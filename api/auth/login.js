import { supabase } from "../../lib/supabase.js";
import { verifyPassword, signToken } from "../../lib/auth.js";
import { handleCors, jsonResponse, errorResponse } from "../../lib/cors.js";

export default async function handler(req) {
  const corsResult = handleCors(req);
  if (corsResult) return corsResult;

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return errorResponse("Username dan password wajib diisi");
    }

    // Cari admin user
    const { data: user, error } = await supabase
      .from("admin_users")
      .select("id, username, password_hash")
      .eq("username", username.trim())
      .single();

    if (error || !user) {
      return errorResponse("Username atau password salah", 401);
    }

    // Verifikasi password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return errorResponse("Username atau password salah", 401);
    }

    // Buat JWT token
    const token = signToken({ userId: user.id, username: user.username });

    return jsonResponse({ token, username: user.username });
  } catch (err) {
    console.error("Login error:", err);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}
