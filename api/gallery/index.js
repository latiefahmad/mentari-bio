/**
 * GET /api/gallery - Ambil semua foto galeri (publik)
 */
import { supabase } from "../../lib/supabase.js";
import { handleCors, jsonResponse, errorResponse } from "../../lib/cors.js";

export default async function handler(req) {
  const corsResult = handleCors(req);
  if (corsResult) return corsResult;

  if (req.method !== "GET") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    const { data, error } = await supabase
      .from("gallery")
      .select("id, public_url, caption, width, height, sort_order, created_at")
      .order("sort_order")
      .order("created_at");

    if (error) throw error;
    return jsonResponse(data || []);
  } catch (err) {
    console.error("GET /api/gallery error:", err);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}
