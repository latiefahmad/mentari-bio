/**
 * GET  /api/content/schedule  - Ambil semua jadwal (publik)
 * PUT  /api/content/schedule  - Ganti semua jadwal (admin)
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
        .from("schedules")
        .select("*")
        .order("sort_order");

      if (error) throw error;
      return jsonResponse(data || []);
    } catch (err) {
      console.error("GET /api/content/schedule error:", err);
      return errorResponse("Terjadi kesalahan server", 500);
    }
  }

  if (req.method === "PUT") {
    const payload = getAuthPayload(req);
    if (!payload) return unauthorizedResponse();

    try {
      const schedules = await req.json();

      if (!Array.isArray(schedules)) {
        return errorResponse("Data harus berupa array");
      }

      // Hapus semua jadwal lama, lalu insert baru
      const { error: deleteError } = await supabase
        .from("schedules")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (deleteError) throw deleteError;

      if (schedules.length > 0) {
        const rows = schedules.map((s, i) => ({
          day: s.day || "",
          time: s.time || "",
          description: s.description || s.desc || "",
          sort_order: i + 1,
        }));

        const { error: insertError } = await supabase
          .from("schedules")
          .insert(rows);

        if (insertError) throw insertError;
      }

      return jsonResponse({ message: "Jadwal berhasil disimpan" });
    } catch (err) {
      console.error("PUT /api/content/schedule error:", err);
      return errorResponse("Terjadi kesalahan server", 500);
    }
  }

  return errorResponse("Method not allowed", 405);
}
