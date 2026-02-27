/**
 * PUT /api/content/[key]
 * Update konten berdasarkan key: hero, about, location, links, footer
 * Memerlukan JWT auth
 */
import { supabase } from "../../lib/supabase.js";
import { getAuthPayload, unauthorizedResponse } from "../../lib/auth.js";
import { handleCors, jsonResponse, errorResponse } from "../../lib/cors.js";

const ALLOWED_KEYS = ["hero", "about", "location", "links", "footer"];

export default async function handler(req) {
  const corsResult = handleCors(req);
  if (corsResult) return corsResult;

  // Ambil key dari URL path
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/");
  const key = pathParts[pathParts.length - 1];

  if (!ALLOWED_KEYS.includes(key)) {
    return errorResponse(`Key '${key}' tidak valid. Gunakan: ${ALLOWED_KEYS.join(", ")}`, 400);
  }

  if (req.method !== "PUT") {
    return errorResponse("Method not allowed", 405);
  }

  const payload = getAuthPayload(req);
  if (!payload) return unauthorizedResponse();

  try {
    const value = await req.json();

    const { error } = await supabase
      .from("site_content")
      .upsert(
        { key, value, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );

    if (error) throw error;

    return jsonResponse({ message: `Konten '${key}' berhasil disimpan`, key, value });
  } catch (err) {
    console.error(`PUT /api/content/${key} error:`, err);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}
