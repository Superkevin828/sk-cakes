const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true
  }
});

const OrderSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: [true, 'Please provide the customer name for this order'],
    trim: true
  },
  customerEmail: {
    type: String,
    trim: true,
    lowercase: true,
    // customerEmail is optional -- skip validation entirely when blank so
    // checkout doesn't fail for customers who don't provide an email.
    validate: {
      validator: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: 'Please provide a valid email format'
    }
  },
  customerPhone: {
    type: String,
    required: [true, 'A primary contact phone number is required for deliveries']
  },
  deliveryAddress: {
    type: String,
    required: [true, 'Please supply a destination address for delivery'],
    trim: true
  },
  items: [OrderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  orderStatus: {
    type: String,
    required: true,
    enum: ['pending', 'preparing', 'delivering', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'pesapal'],
    default: 'cash'
  },
  pesapalTrackingId: {
    type: String,
    trim: true
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

module.exports = mongoose.model('Order', OrderSchema);