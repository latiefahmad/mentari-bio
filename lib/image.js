const sharp = require("sharp");

const MAX_WIDTH = 1920;
const WEBP_QUALITY = 85;

/**
 * Konversi buffer gambar ke WebP
 */
async function convertToWebP(inputBuffer) {
  const image = sharp(inputBuffer);
  const metadata = await image.metadata();

  let pipeline = image;

  if (metadata.width && metadata.width > MAX_WIDTH) {
    pipeline = pipeline.resize(MAX_WIDTH, null, {
      withoutEnlargement: true,
      fit: "inside",
    });
  }

  const webpBuffer = await pipeline
    .webp({ quality: WEBP_QUALITY })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: webpBuffer.data,
    width: webpBuffer.info.width,
    height: webpBuffer.info.height,
    size: webpBuffer.info.size,
  };
}

/**
 * Validasi apakah buffer adalah gambar yang valid
 */
async function isValidImage(buffer) {
  try {
    const metadata = await sharp(buffer).metadata();
    return !!metadata.format;
  } catch {
    return false;
  }
}

/**
 * Generate nama file unik untuk storage
 */
function generateFileName(prefix = "img") {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${timestamp}-${random}.webp`;
}

module.exports = { convertToWebP, isValidImage, generateFileName };
