/**
 * GET  /api/content/programs  - Ambil semua program (publik)
 * PUT  /api/content/programs  - Ganti semua program (admin)
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
        .from("programs")
        .select("*")
        .order("sort_order");

      if (error) throw error;
      return jsonResponse(data || []);
    } catch (err) {
      console.error("GET /api/content/programs error:", err);
      return errorResponse("Terjadi kesalahan server", 500);
    }
  }

  if (req.method === "PUT") {
    const payload = getAuthPayload(req);
    if (!payload) return unauthorizedResponse();

    try {
      const programs = await req.json();

      if (!Array.isArray(programs)) {
        return errorResponse("Data harus berupa array");
      }

      // Hapus semua program lama, lalu insert baru
      const { error: deleteError } = await supabase
        .from("programs")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // delete all

      if (deleteError) throw deleteError;

      if (programs.length > 0) {
        const rows = programs.map((p, i) => ({
          level: p.level || "",
          title: p.title || "",
          subtitle: p.subtitle || "",
          subjects: p.subjects || [],
          is_featured: p.is_featured || false,
          sort_order: i + 1,
        }));

        const { error: insertError } = await supabase
          .from("programs")
          .insert(rows);

        if (insertError) throw insertError;
      }

      return jsonResponse({ message: "Program berhasil disimpan" });
    } catch (err) {
      console.error("PUT /api/content/programs error:", err);
      return errorResponse("Terjadi kesalahan server", 500);
    }
  }

  return errorResponse("Method not allowed", 405);
}
