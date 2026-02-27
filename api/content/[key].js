const { supabase } = require("../../lib/supabase.js");
const { getAuthPayload } = require("../../lib/auth.js");
const { handleCors } = require("../../lib/cors.js");

const ALLOWED_KEYS = ["hero", "about", "location", "links", "footer"];

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  const key = req.query.key;

  if (!ALLOWED_KEYS.includes(key)) {
    return res.status(400).json({ error: `Key '${key}' tidak valid` });
  }

  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const payload = getAuthPayload(req);
  if (!payload) return res.status(401).json({ error: "Unauthorized" });

  try {
    const value = req.body;

    const { error } = await supabase
      .from("site_content")
      .upsert(
        { key, value, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );

    if (error) throw error;

    return res.status(200).json({ message: `Konten '${key}' berhasil disimpan`, key });
  } catch (err) {
    console.error(`PUT /api/content/${key} error:`, err);
    return res.status(500).json({ error: "Terjadi kesalahan server: " + err.message });
  }
};
