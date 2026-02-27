const { supabase } = require("../../lib/supabase.js");
const { getAuthPayload } = require("../../lib/auth.js");
const { handleCors } = require("../../lib/cors.js");
const { convertToWebP, isValidImage, generateFileName } = require("../../lib/image.js");
const Busboy = require("busboy");

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const STORAGE_BUCKET = "gallery";

// Disable Vercel's default body parser untuk handle multipart
module.exports.config = {
  api: {
    bodyParser: false,
  },
};

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const payload = getAuthPayload(req);
  if (!payload) return res.status(401).json({ error: "Unauthorized" });

  try {
    const { fileBuffer, caption } = await parseMultipart(req);

    if (!fileBuffer) {
      return res.status(400).json({ error: "File gambar wajib diupload" });
    }

    if (fileBuffer.length > MAX_FILE_SIZE) {
      return res.status(400).json({ error: "Ukuran file maksimal 10MB" });
    }

    const valid = await isValidImage(fileBuffer);
    if (!valid) {
      return res.status(400).json({ error: "File harus berupa gambar" });
    }

    const { buffer: webpBuffer, width, height, size } = await convertToWebP(fileBuffer);

    const fileName = generateFileName("gallery");
    const storagePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, webpBuffer, {
        contentType: "image/webp",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return res.status(500).json({ error: "Gagal mengupload gambar: " + uploadError.message });
    }

    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;

    const { data: lastItem } = await supabase
      .from("gallery")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();

    const sortOrder = (lastItem?.sort_order || 0) + 1;

    const { data: galleryItem, error: dbError } = await supabase
      .from("gallery")
      .insert({
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
      id: galleryItem.id,
      public_url: publicUrl,
      caption: galleryItem.caption,
      width,
      height,
      file_size: size,
      message: "Gambar berhasil diupload dan dikonversi ke WebP",
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: "Terjadi kesalahan server: " + err.message });
  }
};

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers });

    let fileBuffer = null;
    let caption = "";
    const chunks = [];

    busboy.on("file", (_fieldname, file) => {
      file.on("data", (chunk) => chunks.push(chunk));
      file.on("end", () => {
        fileBuffer = Buffer.concat(chunks);
      });
    });

    busboy.on("field", (name, value) => {
      if (name === "caption") caption = value;
    });

    busboy.on("finish", () => resolve({ fileBuffer, caption }));
    busboy.on("error", reject);

    req.pipe(busboy);
  });
}
