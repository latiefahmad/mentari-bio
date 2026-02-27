/**
 * GET /api/health
 * Health check endpoint untuk debugging
 */
import { jsonResponse } from "../lib/cors.js";

export default async function handler(req) {
  return jsonResponse({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: {
      supabaseUrl: !!process.env.SUPABASE_URL,
      supabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      jwtSecret: !!process.env.JWT_SECRET,
    },
  });
}
