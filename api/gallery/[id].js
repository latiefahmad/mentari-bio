const { supabase } = require("../../lib/supabase.js");
const { getAuthPayload } = require("../../lib/auth.js");
const { handleCors } = require("../../lib/cors.js");

const STORAGE_BUCKET = "gallery";

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  const payload = getAuthPayload(req);
  if (!payload) return res.status(401).json({ error: "Unauthorized" });

  const id = req.query.id;

  if (!id) {
    return res.status(400).json({ error: "ID tidak valid" });
  }

  if (req.method === "DELETE") {
    try {
      const { data: item, error: fetchError } = await supabase
        .from("gallery")
        .select("id, storage_path")
        .eq("id", id)
        .single();

      if (fetchError || !item) {
        return res.status(404).json({ error: "Foto tidak ditemukan" });
      }

      await supabase.storage.from(STORAGE_BUCKET).remove([item.storage_path]);

      const { error: dbError } = await supabase
        .from("gallery")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      return res.status(200).json({ message: "Foto berhasil dihapus" });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "PUT") {
    try {
      const updates = {};
      const body = req.body || {};

      if (body.caption !== undefined) updates.caption = body.caption;
      if (body.sort_order !== undefined) updates.sort_order = parseInt(body.sort_order);

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "Tidak ada data yang diupdate" });
      }

      const { data, error } = await supabase
        .from("gallery")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      if (!data) return res.status(404).json({ error: "Foto tidak ditemukan" });

      return res.status(200).json({ message: "Foto berhasil diupdate", item: data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
