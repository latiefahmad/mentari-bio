const { supabase } = require("../../lib/supabase.js");
const { handleCors } = require("../../lib/cors.js");

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const [contentResult, programsResult, schedulesResult, testimonialsResult] =
      await Promise.all([
        supabase.from("site_content").select("key, value"),
        supabase.from("programs").select("*").order("sort_order"),
        supabase.from("schedules").select("*").order("sort_order"),
        supabase.from("testimonials").select("*").order("sort_order"),
      ]);

    const contentMap = {};
    (contentResult.data || []).forEach((row) => {
      contentMap[row.key] = row.value;
    });

    return res.status(200).json({
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
    return res.status(500).json({ error: "Terjadi kesalahan server: " + err.message });
  }
};
