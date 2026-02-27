const { supabase } = require("../../lib/supabase.js");
const { verifyPassword, signToken } = require("../../lib/auth.js");
const { handleCors } = require("../../lib/cors.js");

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: "Username dan password wajib diisi" });
    }

    const { data: user, error } = await supabase
      .from("admin_users")
      .select("id, username, password_hash")
      .eq("username", username.trim())
      .single();

    if (error || !user) {
      return res.status(401).json({ error: "Username atau password salah" });
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: "Username atau password salah" });
    }

    const token = signToken({ userId: user.id, username: user.username });
    return res.status(200).json({ token, username: user.username });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Terjadi kesalahan server: " + err.message });
  }
};
