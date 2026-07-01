const Product = require('../models/Product');
const { restoreImageToDisk } = require('../services/imageCacheService');

/**
 * @desc    Fallback image server. Only reached if express.static already
 *          looked in /uploads and /public/images and found nothing there
 *          (see app.js - this route is mounted AFTER those static
 *          middlewares). That happens right after a Render redeploy wipes
 *          the disk, or if a file was deleted/renamed unexpectedly.
 *
 *          Looks the file up in MongoDB by its stored imageUrl, streams it
 *          back to the browser directly from the base64 backup, and
 *          re-writes it to disk in the background so subsequent requests
 *          for the same image are served by the fast static path again.
 * @route   GET /uploads/:filename
 * @access  Public
 */
exports.serveImageFallback = async (req, res) => {
  const filename = req.params.filename;

  try {
    const product = await Product.findOne({ imageUrl: `/uploads/${filename}` })
      .select('+imageData +imageMimeType');

    if (!product || !product.imageData) {
      console.warn(`⚠️ Image cache miss with no DB backup either: /uploads/${filename}`);
      return res.status(404).json({
        success: false,
        message: 'Image not found on disk or in the database backup.'
      });
    }

    let buffer;
    try {
      buffer = Buffer.from(product.imageData, 'base64');
    } catch (decodeError) {
      console.error(`⚠️ Corrupt base64 image data for product "${product.name}" (${filename}):`, decodeError.message);
      return res.status(500).json({
        success: false,
        message: 'Stored image data is corrupted and could not be decoded.'
      });
    }

    // Self-heal the disk cache for next time. Fire-and-forget - never
    // delays or breaks the response the user is waiting on right now.
    restoreImageToDisk(product).catch(err =>
      console.error(`⚠️ Self-heal write failed for ${filename}:`, err.message)
    );

    res.set('Content-Type', product.imageMimeType || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400'); // 1 day - it's immutable once uploaded
    return res.status(200).send(buffer);
  } catch (error) {
    console.error(`⚠️ Image DB fallback failed for /uploads/${filename}:`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to load image.'
    });
  }
};
