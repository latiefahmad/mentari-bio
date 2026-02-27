const { jsonResponse } = require("../lib/cors.js");

module.exports = async function handler(req, res) {
  const data = {
    status: "ok",
    timestamp: new Date().toISOString(),
    env: {
      supabaseUrl: !!process.env.SUPABASE_URL,
      supabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      jwtSecret: !!process.env.JWT_SECRET,
    },
  };
  res.status(200).json(data);
};
