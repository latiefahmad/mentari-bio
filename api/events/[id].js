/**
 * GET    /api/events/:id  - Ambil satu event + foto (publik)
 * PUT    /api/events/:id  - Edit event (admin)
 * DELETE /api/events/:id  - Hapus event + semua foto (admin)
 */
const { supabase } = require("../../lib/supabase.js");
const { getAuthPayload } = require("../../lib/auth.js");
const { handleCors } = require("../../lib/cors.js");

const STORAGE_BUCKET = "gallery";

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  const id = req.query.id;
  if (!id) return res.status(400).json({ error: "ID tidak valid" });

  // GET: ambil satu event
  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*, event_photos(id, public_url, caption, sort_order)")
        .eq("id", id)
        .single();

      if (error || !data) return res.status(404).json({ error: "Event tidak ditemukan" });

      data.event_photos = (data.event_photos || []).sort((a, b) => a.sort_order - b.sort_order);
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // PUT: edit event
  if (req.method === "PUT") {
    const payload = getAuthPayload(req);
    if (!payload) return res.status(401).json({ error: "Unauthorized" });

    try {
      const { title, description, event_date, category, is_published, sort_order } = req.body || {};
      const updates = {};

      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (event_date !== undefined) updates.event_date = event_date || null;
      if (category !== undefined) updates.category = category;
      if (is_published !== undefined) updates.is_published = is_published;
      if (sort_order !== undefined) updates.sort_order = parseInt(sort_order);

      const { data, error } = await supabase
        .from("events")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      if (!data) return res.status(404).json({ error: "Event tidak ditemukan" });

      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // DELETE: hapus event + semua foto
  if (req.method === "DELETE") {
    const payload = getAuthPayload(req);
    if (!payload) return res.status(401).json({ error: "Unauthorized" });

    try {
      // Ambil semua foto untuk dihapus dari storage
      const { data: photos } = await supabase
        .from("event_photos")
        .select("storage_path")
        .eq("event_id", id);

      // Hapus foto dari storage
      if (photos && photos.length > 0) {
        const paths = photos.map(p => p.storage_path);
        await supabase.storage.from(STORAGE_BUCKET).remove(paths);
      }

      // Hapus event (cascade akan hapus event_photos)
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;

      return res.status(200).json({ message: "Event berhasil dihapus" });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
