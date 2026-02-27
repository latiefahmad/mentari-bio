const { supabase } = require("../../lib/supabase.js");
const { getAuthPayload } = require("../../lib/auth.js");
const { handleCors } = require("../../lib/cors.js");

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("programs")
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
      const programs = req.body;
      if (!Array.isArray(programs)) {
        return res.status(400).json({ error: "Data harus berupa array" });
      }

      await supabase.from("programs").delete().neq("id", "00000000-0000-0000-0000-000000000000");

      if (programs.length > 0) {
        const rows = programs.map((p, i) => ({
          level: p.level || "",
          title: p.title || "",
          subtitle: p.subtitle || "",
          subjects: p.subjects || [],
          is_featured: p.is_featured || false,
          sort_order: i + 1,
        }));
        const { error } = await supabase.from("programs").insert(rows);
        if (error) throw error;
      }

      return res.status(200).json({ message: "Program berhasil disimpan" });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
