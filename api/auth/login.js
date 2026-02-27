const { supabase } = require("../../lib/supabase.js");
const { verifyPassword, signToken } = require("../../lib/auth.js");
const { handleCors } = require("../../lib/cors.js");
const { checkRateLimit, getClientIp } = require("../../lib/rateLimit.js");

// Security headers
const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  // Set security headers
  Object.entries(securityHeaders).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Rate limiting: max 5 percobaan per menit per IP
  const ip = getClientIp(req);
  const { allowed, remaining, resetAt } = checkRateLimit(`login:${ip}`, 5, 60 * 1000);

  res.setHeader("X-RateLimit-Remaining", remaining);

  if (!allowed) {
    const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
    res.setHeader("Retry-After", retryAfter);
    return res.status(429).json({
      error: `Terlalu banyak percobaan login. Coba lagi dalam ${retryAfter} detik.`,
    });
  }

  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: "Username dan password wajib diisi" });
    }

    // Sanitasi input
    const cleanUsername = String(username).trim().slice(0, 50);

    const { data: user, error } = await supabase
      .from("admin_users")
      .select("id, username, password_hash")
      .eq("username", cleanUsername)
      .single();

    if (error || !user) {
      // Gunakan pesan yang sama untuk mencegah user enumeration
      return res.status(401).json({ error: "Username atau password salah" });
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: "Username atau password salah" });
    }

    const token = signToken({ userId: user.id, username: user.username });
    return res.status(200).json({ token, username: user.username });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({ error: "Terjadi kesalahan server" });
  }
};
