const { supabase } = require("../../lib/supabase.js");
const { getAuthPayload } = require("../../lib/auth.js");
const { handleCors } = require("../../lib/cors.js");

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("sort_order");

      if (error) throw error;
      return res.status(200).json(data || []);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "PUT") {
    const payload = getAuthPayload(req);
    if (!payload) return res.status(401).json({ error: "Unauthorized" });

    try {
      const testimonials = req.body;
      if (!Array.isArray(testimonials)) {
        return res.status(400).json({ error: "Data harus berupa array" });
      }

      await supabase.from("testimonials").delete().neq("id", "00000000-0000-0000-0000-000000000000");

      if (testimonials.length > 0) {
        const rows = testimonials.map((t, i) => ({
          text: t.text || "",
          author_name: t.name || t.author_name || "",
          author_role: t.role || t.author_role || "",
          stars: Math.min(5, Math.max(1, parseInt(t.stars) || 5)),
          sort_order: i + 1,
        }));
        const { error } = await supabase.from("testimonials").insert(rows);
        if (error) throw error;
      }

      return res.status(200).json({ message: "Testimoni berhasil disimpan" });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
