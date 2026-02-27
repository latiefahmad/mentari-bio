const { handleCors } = require("../lib/cors.js");

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  // Proteksi health endpoint dengan token sederhana
  // Akses: /api/health?token=YOUR_JWT_SECRET
  const token = req.query.token;
  const jwtSecret = process.env.JWT_SECRET;

  if (!token || token !== jwtSecret) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: {
      supabaseUrl: !!process.env.SUPABASE_URL,
      supabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      jwtSecret: !!process.env.JWT_SECRET,
    },
  });
};
