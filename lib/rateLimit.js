/**
 * Simple in-memory rate limiter untuk Vercel serverless
 * Catatan: Karena serverless bersifat stateless, ini hanya efektif
 * dalam satu instance. Untuk production skala besar, gunakan Redis.
 */

const attempts = new Map();

/**
 * Cek apakah IP sudah melebihi batas percobaan
 * @param {string} key - IP address atau identifier
 * @param {number} maxAttempts - Maksimal percobaan
 * @param {number} windowMs - Window waktu dalam ms
 * @returns {{ allowed: boolean, remaining: number, resetAt: number }}
 */
function checkRateLimit(key, maxAttempts = 5, windowMs = 60 * 1000) {
  const now = Date.now();
  const record = attempts.get(key);

  if (!record || now > record.resetAt) {
    // Reset atau buat baru
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, resetAt: now + windowMs };
  }

  if (record.count >= maxAttempts) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count++;
  return { allowed: true, remaining: maxAttempts - record.count, resetAt: record.resetAt };
}

/**
 * Ambil IP dari request Vercel
 * @param {import('http').IncomingMessage} req
 * @returns {string}
 */
function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

module.exports = { checkRateLimit, getClientIp };
