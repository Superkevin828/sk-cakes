const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please write a brief catalog description for this product'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please define a product price in the designated currency'],
    min: [0, 'Price cannot be negative']
  },
  imageUrl: {
    type: String,
    default: '/uploads/placeholder-product.png'
  },
  // Permanent backup of the image, so it survives Render's ephemeral disk
  // wipes on redeploy/restart. `select: false` keeps it out of normal
  // /api/products responses (it's large) - it's only pulled explicitly
  // by the image-cache warmup and the disk-cache-miss fallback route.
  imageData: {
    type: String,
    select: false,
    default: null
  },
  imageMimeType: {
    type: String,
    select: false,
    default: 'image/jpeg'
  },
  category: {
    type: String,
    required: [true, 'Please select a core category'],
    enum: {
      values: [
        'cakes',
        'snacks', // includes samosas, sausages, doughnuts, mandazi
        'chips',
        'drinks',
        'cookies',
        'other'
      ],
      message: 'Category must be one of: cakes, snacks, chips, drinks, cookies, other'
    }
  },
  subCategory: {
    type: String,
    trim: true,
    default: '' // e.g. 'Birthday', 'Wedding', 'Graduation', 'Cupcakes', 'Chicken snacks', 'French Fries'
  },
  stock: {
    type: Number,
    required: [true, 'Please specify available inventory'],
    min: [0, 'Stock cannot be negative'],
    default: 10
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
    }
  }
});

// Indexes for speed optimization when sorting or filtering
ProductSchema.index({ category: 1 });
ProductSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', ProductSchema);
