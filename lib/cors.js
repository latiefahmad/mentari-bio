/**
 * CORS headers helper untuk Vercel serverless functions
 */
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/**
 * Handle preflight OPTIONS request
 * @param {Request} req
 * @returns {Response|null}
 */
export function handleCors(req) {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  return null;
}

/**
 * JSON response dengan CORS headers
 * @param {any} data
 * @param {number} status
 * @returns {Response}
 */
export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Error response
 * @param {string} message
 * @param {number} status
 * @returns {Response}
 */
export function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status);
}
