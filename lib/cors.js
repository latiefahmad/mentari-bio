/**
 * CORS + Security headers helper untuk Vercel serverless functions
 */

// Untuk production, ganti "*" dengan domain spesifik
// Contoh: "https://mentari.vercel.app"
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

/**
 * Set semua headers (CORS + security) ke response
 */
function setHeaders(res) {
  Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
  Object.entries(securityHeaders).forEach(([k, v]) => res.setHeader(k, v));
}

/**
 * Handle preflight OPTIONS request
 * @returns {boolean} true jika sudah dihandle
 */
function handleCors(req, res) {
  setHeaders(res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}

module.exports = { corsHeaders, securityHeaders, setHeaders, handleCors };
