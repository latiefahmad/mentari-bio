/**
 * DELETE /api/gallery/:id  - Hapus foto dari DB + Supabase Storage
 * PUT    /api/gallery/:id  - Update caption / sort_order
 * Memerlukan JWT auth
 */
import { supabase } from "../../lib/supabase.js";
import { getAuthPayload, unauthorizedResponse } from "../../lib/auth.js";
import { handleCors, jsonResponse, errorResponse } from "../../lib/cors.js";

const STORAGE_BUCKET = "gallery";

export default async function handler(req) {
  const corsResult = handleCors(req);
  if (corsResult) return corsResult;

  const payload = getAuthPayload(req);
  if (!payload) return unauthorizedResponse();

  // Ambil id dari URL path
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/");
  const id = pathParts[pathParts.length - 1];

  if (!id || id === "undefined") {
    return errorResponse("ID tidak valid");
  }

  // DELETE
  if (req.method === "DELETE") {
    try {
      // Ambil storage_path dulu
      const { data: item, error: fetchError } = await supabase
        .from("gallery")
        .select("id, storage_path")
        .eq("id", id)
        .single();

      if (fetchError || !item) {
        return errorResponse("Foto tidak ditemukan", 404);
      }

      // Hapus dari Supabase Storage
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([item.storage_path]);

      if (storageError) {
        console.warn("Storage delete warning:", storageError);
        // Lanjutkan meski storage error (mungkin file sudah tidak ada)
      }

      // Hapus dari database
      const { error: dbError } = await supabase
        .from("gallery")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      return jsonResponse({ message: "Foto berhasil dihapus" });
    } catch (err) {
      console.error(`DELETE /api/gallery/${id} error:`, err);
      return errorResponse("Terjadi kesalahan server", 500);
    }
  }

  // PUT - Update caption / sort_order
  if (req.method === "PUT") {
    try {
      const body = await req.json();
      const updates = {};

      if (body.caption !== undefined) updates.caption = body.caption;
      if (body.sort_order !== undefined) updates.sort_order = parseInt(body.sort_order);

      if (Object.keys(updates).length === 0) {
        return errorResponse("Tidak ada data yang diupdate");
      }

      const { data, error } = await supabase
        .from("gallery")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      if (!data) return errorResponse("Foto tidak ditemukan", 404);

      return jsonResponse({ message: "Foto berhasil diupdate", item: data });
    } catch (err) {
      console.error(`PUT /api/gallery/${id} error:`, err);
      return errorResponse("Terjadi kesalahan server", 500);
    }
  }

  return errorResponse("Method not allowed", 405);
}
