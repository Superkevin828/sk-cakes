const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// Public catalog pathways
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Admin restricted pathways (With file upload handlers)
router.post('/', protect, adminOnly, upload.single('image'), productController.createProduct);
router.put('/:id', protect, adminOnly, upload.single('image'), productController.updateProduct);
router.delete('/:id', protect, adminOnly, productController.deleteProduct);

module.exports = router;
