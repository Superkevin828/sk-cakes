const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');

/**
 * @desc    Get all catalog products
 * @route   GET /api/products
 * @access  Public
 */
exports.getAllProducts = async (req, res, next) => {
  try {
    const { category, search, sort } = req.query;
    let query = {};

    // Filter by specific category (e.g. cakes, snacks, chips, drinks)
    if (category) {
      query.category = category;
    }

    // Filter by search string
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Prepare query chain
    let queryResult = Product.find(query);

    // Sorting
    if (sort) {
      const sortBy = sort.split(',').join(' ');
      queryResult = queryResult.sort(sortBy);
    } else {
      queryResult = queryResult.sort('-createdAt'); // Default to newest items
    }

    const products = await queryResult;

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product details
 * @route   GET /api/products/:id
 * @access  Public
 */
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a product (Cake or Fast-food item)
 * @route   POST /api/products
 * @access  Private/Admin
 */
exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, subCategory, stock, isFeatured } = req.body;
    let imageUrl = '/images/products/placeholder-product.png';

    // Verify file upload was caught by multer
    if (req.file) {
      // In production, upload the file path to Cloudinary/S3 and get the secure URL
      // For now, save relative path to local storage
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Create the product in MongoDB
    const newProduct = await Product.create({
      name,
      description,
      price: parseFloat(price),
      category,
      subCategory,
      stock: parseInt(stock) || 0,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      imageUrl
    });

    res.status(201).json({
      success: true,
      message: 'Product catalog item created successfully',
      product: newProduct
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a product details
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product item not found' });
    }

    const updateFields = { ...req.body };
    
    // Typecast numeric inputs
    if (updateFields.price) updateFields.price = parseFloat(updateFields.price);
    if (updateFields.stock) updateFields.stock = parseInt(updateFields.stock);
    if (updateFields.isFeatured) updateFields.isFeatured = (updateFields.isFeatured === 'true' || updateFields.isFeatured === true);

    // If new image supplied, capture it and clean up the old one
    if (req.file) {
      // delete old image if it's not a placeholder
      if (product.imageUrl && !product.imageUrl.includes('placeholder-product.png')) {
        const oldPath = path.join(__dirname, '..', product.imageUrl);
        fs.unlink(oldPath, (err) => {
          if (err) console.error(`Failed to delete previous image file: ${oldPath}`, err);
        });
      }
      updateFields.imageUrl = `/uploads/${req.file.filename}`;
    }

    // Apply update fields
    product = await Product.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Product catalog item updated successfully',
      product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a product item
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product item not found' });
    }

    // Clean up local media files
    if (product.imageUrl && !product.imageUrl.includes('placeholder-product.png')) {
      const oldPath = path.join(__dirname, '..', product.imageUrl);
      fs.unlink(oldPath, (err) => {
        if (err) console.error(`Failed to delete image file associated with deleted product: ${oldPath}`, err);
      });
    }

    // Execute delete
    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product catalog item successfully removed'
    });
  } catch (error) {
    next(error);
  }
};
