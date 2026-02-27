const { supabase } = require("../../lib/supabase.js");
const { verifyPassword, hashPassword, getAuthPayload } = require("../../lib/auth.js");
const { handleCors } = require("../../lib/cors.js");

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const payload = getAuthPayload(req);
  if (!payload) return res.status(401).json({ error: "Unauthorized" });

  try {
    const { oldPassword, newPassword } = req.body || {};

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Password lama dan baru wajib diisi" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password baru minimal 6 karakter" });
    }

    const { data: user, error } = await supabase
      .from("admin_users")
      .select("id, password_hash")
      .eq("id", payload.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }

    const isValid = await verifyPassword(oldPassword, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: "Password lama tidak sesuai" });
    }

    const newHash = await hashPassword(newPassword);

    const { error: updateError } = await supabase
      .from("admin_users")
      .update({ password_hash: newHash })
      .eq("id", payload.userId);

    if (updateError) throw updateError;

    return res.status(200).json({ message: "Password berhasil diubah" });
  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({ error: "Terjadi kesalahan server: " + err.message });
  }
};
