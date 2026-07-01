const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Initialize Express App
const app = express();

// Load Environment Variables (fallback in case server.js didn't trigger)
require('dotenv').config();

// 1. GLOBAL SECURITY MIDDLEWARES
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'https://sk-cakes.pages.dev',
  'https://www.skcakes.com'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    } else {
      return callback(new Error('Blocked by CORS policy for SK Cakes API'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting Setup
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // Default 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP to 100 requests per window
  message: {
    status: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// 2. PARSERS & LOGGING
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 3. STATIC FILES (For fallback/temporary image hosting before Cloudinary)
const publicImagesRoot = path.join(__dirname, '..', 'public', 'images');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(publicImagesRoot, 'products')));
app.use('/images', express.static(publicImagesRoot));

// 3b. IMAGE CACHE-MISS FALLBACK
// Only reached if the file wasn't found by either express.static middleware
// above (e.g. right after a Render redeploy wipes the disk). Serves the
// image straight from its MongoDB base64 backup and re-caches it to disk.
app.get('/uploads/:filename', require('./controllers/imageController').serveImageFallback);

// 4. API ROUTE BINDINGS (Skeletons to be fully implemented)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Root Status Probe
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    service: 'SK Cakes API Gateway',
    uptime: process.uptime()
  });
});

// Fallback Route for non-matching URLs
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found.`
  });
});

// 5. GLOBAL ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {
  console.error('🔥 Server Error Handler Caught:', err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred',
    errors: err.errors || null,
    // Only leak stack trace in development
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

module.exports = app;
