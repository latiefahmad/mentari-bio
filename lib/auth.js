import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable");
}

/**
 * Hash password dengan bcrypt
 * @param {string} password
 * @returns {Promise<string>} hash
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

/**
 * Verifikasi password dengan hash
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Buat JWT token
 * @param {object} payload
 * @returns {string} token
 */
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verifikasi JWT token
 * @param {string} token
 * @returns {object|null} payload atau null jika invalid
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Middleware: ambil token dari header Authorization
 * @param {Request} req
 * @returns {object|null} payload atau null
 */
export function getAuthPayload(req) {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  return verifyToken(token);
}

/**
 * Response 401 Unauthorized
 */
export function unauthorizedResponse() {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
