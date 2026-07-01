const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

/**
 * Why this exists:
 * Render's disk is ephemeral - every redeploy (and free-tier spin-down/up)
 * wipes backend/uploads/. MongoDB is the durable store: every product image
 * is saved there as base64 (see productController). This service copies
 * those base64 images back onto disk so express.static can keep serving
 * them fast, without every image request having to touch the DB.
 *
 * Order of operations on boot: "Featured Specialties" products restore
 * first (that's what the homepage needs immediately), then everything
 * else restores in the background so server startup isn't blocked by a
 * large catalog.
 */

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

function filenameFromImageUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('/uploads/')) {
    return null;
  }
  return imageUrl.replace('/uploads/', '');
}

/**
 * Writes one product's base64 image to disk under its EXACT original
 * filename (so imageUrl links already in the DB/frontend keep working).
 * Safe to call repeatedly - skips the write if the file is already cached.
 */
async function restoreImageToDisk(product) {
  const filename = filenameFromImageUrl(product.imageUrl);

  if (!filename) {
    return { skipped: true, reason: 'not a local /uploads image' };
  }
  if (!product.imageData) {
    return { skipped: true, reason: 'no base64 backup stored for this product' };
  }

  const diskPath = path.join(UPLOADS_DIR, filename);

  if (fs.existsSync(diskPath)) {
    return { alreadyCached: true };
  }

  try {
    ensureUploadsDir();
    const buffer = Buffer.from(product.imageData, 'base64');
    await fs.promises.writeFile(diskPath, buffer);
    return { restored: true, filename };
  } catch (error) {
    console.error(`⚠️ Failed to restore image "${filename}" for product "${product.name}":`, error.message);
    return { restored: false, error: error.message };
  }
}

async function restoreMany(products, label) {
  let restored = 0;
  let alreadyCached = 0;
  let failed = 0;

  for (const product of products) {
    const result = await restoreImageToDisk(product);
    if (result.restored) restored++;
    else if (result.alreadyCached) alreadyCached++;
    else if (result.restored === false) failed++;
  }

  console.log(
    `🖼️  Image cache [${label}]: ${restored} restored, ${alreadyCached} already cached, ${failed} failed (of ${products.length})`
  );
}

/**
 * Called once at server startup, after MongoDB connects.
 * Awaits the Featured Specialties restore (fast, small set - the homepage
 * depends on these), then restores the rest of the catalog in the
 * background without blocking server start.
 */
async function warmImageCache() {
  try {
    ensureUploadsDir();

    const featuredProducts = await Product.find({ isFeatured: true })
      .select('+imageData +imageMimeType');
    await restoreMany(featuredProducts, 'featured');

    // Background pass for everything else - doesn't block app.listen()
    Product.find({ isFeatured: { $ne: true } })
      .select('+imageData +imageMimeType')
      .then(rest => restoreMany(rest, 'catalog'))
      .catch(err => console.error('⚠️ Background image cache warmup failed:', err.message));
  } catch (error) {
    console.error('⚠️ Image cache warmup failed (site will still run - images fall back to DB on demand):', error.message);
  }
}

module.exports = {
  warmImageCache,
  restoreImageToDisk,
  filenameFromImageUrl,
  UPLOADS_DIR
};
