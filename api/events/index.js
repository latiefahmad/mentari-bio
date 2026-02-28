/**
 * GET  /api/events  - Ambil semua event yang dipublish beserta fotonya (publik)
 * POST /api/events  - Buat event baru (admin)
 */
const { supabase } = require("../../lib/supabase.js");
const { getAuthPayload } = require("../../lib/auth.js");
const { handleCors } = require("../../lib/cors.js");

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  // GET: ambil semua event publik + foto
  if (req.method === "GET") {
    try {
      const { data: events, error } = await supabase
        .from("events")
        .select("*, event_photos(id, public_url, caption, sort_order)")
        .eq("is_published", true)
        .order("sort_order")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Sort photos per event
      const result = (events || []).map(e => ({
        ...e,
        event_photos: (e.event_photos || []).sort((a, b) => a.sort_order - b.sort_order),
      }));

      return res.status(200).json(result);
    } catch (err) {
      console.error("GET /api/events error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // POST: buat event baru (admin)
  if (req.method === "POST") {
    const payload = getAuthPayload(req);
    if (!payload) return res.status(401).json({ error: "Unauthorized" });

    try {
      const { title, description, event_date, category, is_published, sort_order } = req.body || {};

      if (!title) {
        return res.status(400).json({ error: "Judul event wajib diisi" });
      }

      // Hitung sort_order berikutnya
      const { data: last } = await supabase
        .from("events")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1)
        .single();

      const nextOrder = sort_order !== undefined ? sort_order : (last?.sort_order || 0) + 1;

      const { data, error } = await supabase
        .from("events")
        .insert({
          title,
          description: description || null,
          event_date: event_date || null,
          category: category || null,
          is_published: is_published !== false,
          sort_order: nextOrder,
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json(data);
    } catch (err) {
      console.error("POST /api/events error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
