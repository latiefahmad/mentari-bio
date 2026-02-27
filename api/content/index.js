/**
 * GET /api/content
 * Ambil semua konten publik sekaligus (hero, about, location, links, footer,
 * programs, schedules, testimonials)
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
    // Ambil semua data paralel
    const [contentResult, programsResult, schedulesResult, testimonialsResult] =
      await Promise.all([
        supabase.from("site_content").select("key, value"),
        supabase.from("programs").select("*").order("sort_order"),
        supabase.from("schedules").select("*").order("sort_order"),
        supabase.from("testimonials").select("*").order("sort_order"),
      ]);

    // Konversi site_content array ke object
    const contentMap = {};
    (contentResult.data || []).forEach((row) => {
      contentMap[row.key] = row.value;
    });

    return jsonResponse({
      hero: contentMap.hero || {},
      about: contentMap.about || {},
      location: contentMap.location || {},
      links: contentMap.links || {},
      footer: contentMap.footer || {},
      programs: programsResult.data || [],
      schedules: schedulesResult.data || [],
      testimonials: testimonialsResult.data || [],
    });
  } catch (err) {
    console.error("GET /api/content error:", err);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}
