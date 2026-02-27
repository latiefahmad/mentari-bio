/**
 * GET  /api/content/testimonials  - Ambil semua testimoni (publik)
 * PUT  /api/content/testimonials  - Ganti semua testimoni (admin)
 */
import { supabase } from "../../lib/supabase.js";
import { getAuthPayload, unauthorizedResponse } from "../../lib/auth.js";
import { handleCors, jsonResponse, errorResponse } from "../../lib/cors.js";

export default async function handler(req) {
  const corsResult = handleCors(req);
  if (corsResult) return corsResult;

  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("sort_order");

      if (error) throw error;
      return jsonResponse(data || []);
    } catch (err) {
      console.error("GET /api/content/testimonials error:", err);
      return errorResponse("Terjadi kesalahan server", 500);
    }
  }

  if (req.method === "PUT") {
    const payload = getAuthPayload(req);
    if (!payload) return unauthorizedResponse();

    try {
      const testimonials = await req.json();

      if (!Array.isArray(testimonials)) {
        return errorResponse("Data harus berupa array");
      }

      // Hapus semua testimoni lama, lalu insert baru
      const { error: deleteError } = await supabase
        .from("testimonials")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (deleteError) throw deleteError;

      if (testimonials.length > 0) {
        const rows = testimonials.map((t, i) => ({
          text: t.text || "",
          author_name: t.name || t.author_name || "",
          author_role: t.role || t.author_role || "",
          stars: Math.min(5, Math.max(1, parseInt(t.stars) || 5)),
          sort_order: i + 1,
        }));

        const { error: insertError } = await supabase
          .from("testimonials")
          .insert(rows);

        if (insertError) throw insertError;
      }

      return jsonResponse({ message: "Testimoni berhasil disimpan" });
    } catch (err) {
      console.error("PUT /api/content/testimonials error:", err);
      return errorResponse("Terjadi kesalahan server", 500);
    }
  }

  return errorResponse("Method not allowed", 405);
}
