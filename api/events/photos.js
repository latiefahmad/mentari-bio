/**
 * POST   /api/events/photos?event_id=:id  - Upload foto ke event (admin, WebP)
 * DELETE /api/events/photos?photo_id=:id  - Hapus foto dari event (admin)
 */
const { supabase } = require("../../lib/supabase.js");
const { getAuthPayload } = require("../../lib/auth.js");
const { handleCors } = require("../../lib/cors.js");
const { convertToWebP, isValidImage, generateFileName } = require("../../lib/image.js");
const Busboy = require("busboy");

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const STORAGE_BUCKET = "gallery";

module.exports.config = {
  api: { bodyParser: false },
};

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  const payload = getAuthPayload(req);
  if (!payload) return res.status(401).json({ error: "Unauthorized" });

  // POST: upload foto ke event
  if (req.method === "POST") {
    const eventId = req.query.event_id;
    if (!eventId) return res.status(400).json({ error: "event_id wajib diisi" });

    // Cek event ada
    const { data: event, error: eventErr } = await supabase
      .from("events")
      .select("id")
      .eq("id", eventId)
      .single();

    if (eventErr || !event) {
      return res.status(404).json({ error: "Event tidak ditemukan" });
    }

    try {
      const { fileBuffer, caption } = await parseMultipart(req);

      if (!fileBuffer) return res.status(400).json({ error: "File gambar wajib diupload" });
      if (fileBuffer.length > MAX_FILE_SIZE) return res.status(400).json({ error: "Ukuran file maksimal 10MB" });

      const valid = await isValidImage(fileBuffer);
      if (!valid) return res.status(400).json({ error: "File harus berupa gambar" });

      const { buffer: webpBuffer, width, height, size } = await convertToWebP(fileBuffer);

      const fileName = generateFileName("event");
      const storagePath = `events/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, webpBuffer, { contentType: "image/webp", upsert: false });

      if (uploadError) {
        return res.status(500).json({ error: "Gagal upload: " + uploadError.message });
      }

      const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
      const publicUrl = urlData.publicUrl;

      // Sort order
      const { data: lastPhoto } = await supabase
        .from("event_photos")
        .select("sort_order")
        .eq("event_id", eventId)
        .order("sort_order", { ascending: false })
        .limit(1)
        .single();

      const sortOrder = (lastPhoto?.sort_order || 0) + 1;

      const { data: photo, error: dbError } = await supabase
        .from("event_photos")
        .insert({
          event_id: eventId,
          storage_path: storagePath,
          public_url: publicUrl,
          caption: caption || null,
          width,
          height,
          file_size: size,
          sort_order: sortOrder,
        })
        .select()
        .single();

      if (dbError) {
        await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
        throw dbError;
      }

      return res.status(201).json({
        id: photo.id,
        public_url: publicUrl,
        caption: photo.caption,
        width,
        height,
        message: "Foto berhasil diupload dan dikonversi ke WebP",
      });
    } catch (err) {
      console.error("POST /api/events/photos error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // DELETE: hapus foto
  if (req.method === "DELETE") {
    const photoId = req.query.photo_id;
    if (!photoId) return res.status(400).json({ error: "photo_id wajib diisi" });

    try {
      const { data: photo, error: fetchErr } = await supabase
        .from("event_photos")
        .select("id, storage_path")
        .eq("id", photoId)
        .single();

      if (fetchErr || !photo) return res.status(404).json({ error: "Foto tidak ditemukan" });

      await supabase.storage.from(STORAGE_BUCKET).remove([photo.storage_path]);

      const { error } = await supabase.from("event_photos").delete().eq("id", photoId);
      if (error) throw error;

      return res.status(200).json({ message: "Foto berhasil dihapus" });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers });
    let fileBuffer = null;
    let caption = "";
    const chunks = [];

    busboy.on("file", (_f, file) => {
      file.on("data", chunk => chunks.push(chunk));
      file.on("end", () => { fileBuffer = Buffer.concat(chunks); });
    });
    busboy.on("field", (name, value) => { if (name === "caption") caption = value; });
    busboy.on("finish", () => resolve({ fileBuffer, caption }));
    busboy.on("error", reject);
    req.pipe(busboy);
  });
}
