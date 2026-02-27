/**
 * POST /api/gallery/upload
 * Upload gambar → konversi ke WebP → simpan ke Supabase Storage → simpan ke DB
 * Memerlukan JWT auth
 * Content-Type: multipart/form-data
 * Field: file (required), caption (optional)
 */
import { supabase } from "../../lib/supabase.js";
import { getAuthPayload, unauthorizedResponse } from "../../lib/auth.js";
import { handleCors, jsonResponse, errorResponse } from "../../lib/cors.js";
import { convertToWebP, isValidImage, generateFileName } from "../../lib/image.js";
import Busboy from "busboy";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const STORAGE_BUCKET = "gallery";

export const config = {
  api: {
    bodyParser: false, // Disable default body parser untuk handle multipart
  },
};

export default async function handler(req) {
  const corsResult = handleCors(req);
  if (corsResult) return corsResult;

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  const payload = getAuthPayload(req);
  if (!payload) return unauthorizedResponse();

  try {
    // Parse multipart form data
    const { fileBuffer, caption, mimeType } = await parseMultipart(req);

    if (!fileBuffer) {
      return errorResponse("File gambar wajib diupload");
    }

    if (fileBuffer.length > MAX_FILE_SIZE) {
      return errorResponse("Ukuran file maksimal 10MB");
    }

    // Validasi apakah file adalah gambar
    const valid = await isValidImage(fileBuffer);
    if (!valid) {
      return errorResponse("File harus berupa gambar (JPG, PNG, GIF, WebP, dll)");
    }

    // Konversi ke WebP
    const { buffer: webpBuffer, width, height, size } = await convertToWebP(fileBuffer);

    // Generate nama file unik
    const fileName = generateFileName("gallery");
    const storagePath = fileName;

    // Upload ke Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, webpBuffer, {
        contentType: "image/webp",
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase Storage upload error:", uploadError);
      return errorResponse("Gagal mengupload gambar ke storage", 500);
    }

    // Ambil public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;

    // Hitung sort_order (setelah item terakhir)
    const { data: lastItem } = await supabase
      .from("gallery")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();

    const sortOrder = (lastItem?.sort_order || 0) + 1;

    // Simpan ke database
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
      // Rollback: hapus file dari storage
      await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
      throw dbError;
    }

    return jsonResponse({
      id: galleryItem.id,
      public_url: publicUrl,
      caption: galleryItem.caption,
      width,
      height,
      file_size: size,
      message: "Gambar berhasil diupload dan dikonversi ke WebP",
    }, 201);

  } catch (err) {
    console.error("POST /api/gallery/upload error:", err);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}

/**
 * Parse multipart/form-data dari Request
 * @param {Request} req
 * @returns {Promise<{ fileBuffer: Buffer|null, caption: string, mimeType: string }>}
 */
function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const contentType = req.headers.get("content-type") || req.headers.get("Content-Type") || "";

    const busboy = Busboy({ headers: { "content-type": contentType } });

    let fileBuffer = null;
    let caption = "";
    let mimeType = "";
    const chunks = [];

    busboy.on("file", (_fieldname, file, info) => {
      mimeType = info.mimeType;
      file.on("data", (chunk) => chunks.push(chunk));
      file.on("end", () => {
        fileBuffer = Buffer.concat(chunks);
      });
    });

    busboy.on("field", (name, value) => {
      if (name === "caption") caption = value;
    });

    busboy.on("finish", () => resolve({ fileBuffer, caption, mimeType }));
    busboy.on("error", reject);

    // Pipe request body ke busboy
    req.arrayBuffer().then((ab) => {
      const buf = Buffer.from(ab);
      busboy.write(buf);
      busboy.end();
    }).catch(reject);
  });
}
