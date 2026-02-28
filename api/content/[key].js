/**
 * GET  /api/content/[key]  - Ambil konten berdasarkan key
 * PUT  /api/content/[key]  - Update konten berdasarkan key
 *
 * Keys yang didukung:
 * - hero, about, location, links, footer → disimpan di tabel site_content (JSONB)
 * - programs, schedule, testimonials → disimpan di tabel terpisah
 */
const { supabase } = require("../../lib/supabase.js");
const { getAuthPayload } = require("../../lib/auth.js");
const { handleCors } = require("../../lib/cors.js");

const JSON_KEYS = ["hero", "about", "location", "links", "footer"];
const TABLE_KEYS = ["programs", "schedule", "testimonials"];
const ALL_KEYS = [...JSON_KEYS, ...TABLE_KEYS];

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  const key = req.query.key;

  if (!ALL_KEYS.includes(key)) {
    return res.status(400).json({ error: `Key '${key}' tidak valid. Gunakan: ${ALL_KEYS.join(", ")}` });
  }

  // ===== GET =====
  if (req.method === "GET") {
    try {
      if (JSON_KEYS.includes(key)) {
        const { data, error } = await supabase
          .from("site_content")
          .select("value")
          .eq("key", key)
          .single();
        if (error) return res.status(200).json({});
        return res.status(200).json(data?.value || {});
      }

      if (key === "programs") {
        const { data, error } = await supabase.from("programs").select("*").order("sort_order");
        if (error) throw error;
        return res.status(200).json(data || []);
      }

      if (key === "schedule") {
        const { data, error } = await supabase.from("schedules").select("*").order("sort_order");
        if (error) throw error;
        return res.status(200).json(data || []);
      }

      if (key === "testimonials") {
        const { data, error } = await supabase.from("testimonials").select("*").order("sort_order");
        if (error) throw error;
        return res.status(200).json(data || []);
      }
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ===== PUT (admin only) =====
  if (req.method === "PUT") {
    const payload = getAuthPayload(req);
    if (!payload) return res.status(401).json({ error: "Unauthorized" });

    try {
      const body = req.body;

      if (JSON_KEYS.includes(key)) {
        const { error } = await supabase
          .from("site_content")
          .upsert({ key, value: body, updated_at: new Date().toISOString() }, { onConflict: "key" });
        if (error) throw error;
        return res.status(200).json({ message: `Konten '${key}' berhasil disimpan` });
      }

      if (key === "programs") {
        if (!Array.isArray(body)) return res.status(400).json({ error: "Data harus berupa array" });
        await supabase.from("programs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        if (body.length > 0) {
          const { error } = await supabase.from("programs").insert(
            body.map((p, i) => ({
              level: p.level || "",
              title: p.title || "",
              subtitle: p.subtitle || "",
              subjects: p.subjects || [],
              is_featured: p.is_featured || false,
              sort_order: i + 1,
            }))
          );
          if (error) throw error;
        }
        return res.status(200).json({ message: "Program berhasil disimpan" });
      }

      if (key === "schedule") {
        if (!Array.isArray(body)) return res.status(400).json({ error: "Data harus berupa array" });
        await supabase.from("schedules").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        if (body.length > 0) {
          const { error } = await supabase.from("schedules").insert(
            body.map((s, i) => ({
              day: s.day || "",
              time: s.time || "",
              description: s.description || s.desc || "",
              sort_order: i + 1,
            }))
          );
          if (error) throw error;
        }
        return res.status(200).json({ message: "Jadwal berhasil disimpan" });
      }

      if (key === "testimonials") {
        if (!Array.isArray(body)) return res.status(400).json({ error: "Data harus berupa array" });
        await supabase.from("testimonials").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        if (body.length > 0) {
          const { error } = await supabase.from("testimonials").insert(
            body.map((t, i) => ({
              text: t.text || "",
              author_name: t.name || t.author_name || "",
              author_role: t.role || t.author_role || "",
              stars: Math.min(5, Math.max(1, parseInt(t.stars) || 5)),
              sort_order: i + 1,
            }))
          );
          if (error) throw error;
        }
        return res.status(200).json({ message: "Testimoni berhasil disimpan" });
      }
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
