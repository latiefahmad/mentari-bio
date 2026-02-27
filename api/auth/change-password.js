import { supabase } from "../../lib/supabase.js";
import { verifyPassword, hashPassword, getAuthPayload, unauthorizedResponse } from "../../lib/auth.js";
import { handleCors, jsonResponse, errorResponse } from "../../lib/cors.js";

export default async function handler(req) {
  const corsResult = handleCors(req);
  if (corsResult) return corsResult;

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  const payload = getAuthPayload(req);
  if (!payload) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword) {
      return errorResponse("Password lama dan baru wajib diisi");
    }

    if (newPassword.length < 6) {
      return errorResponse("Password baru minimal 6 karakter");
    }

    // Ambil user
    const { data: user, error } = await supabase
      .from("admin_users")
      .select("id, password_hash")
      .eq("id", payload.userId)
      .single();

    if (error || !user) {
      return errorResponse("User tidak ditemukan", 404);
    }

    // Verifikasi password lama
    const isValid = await verifyPassword(oldPassword, user.password_hash);
    if (!isValid) {
      return errorResponse("Password lama tidak sesuai", 401);
    }

    // Hash password baru
    const newHash = await hashPassword(newPassword);

    // Update
    const { error: updateError } = await supabase
      .from("admin_users")
      .update({ password_hash: newHash })
      .eq("id", payload.userId);

    if (updateError) throw updateError;

    return jsonResponse({ message: "Password berhasil diubah" });
  } catch (err) {
    console.error("Change password error:", err);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}
