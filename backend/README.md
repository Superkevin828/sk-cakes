# SK Cakes Backend API

This folder houses the robust RESTful API backend for SK Cakes, written in Node.js, Express, and Mongoose. It supports JWT session guards, cors bindings, robust schemas, structured routing patterns, and temporary image upload streams.

---

## Technical Stack & Packages

The backend leverages a carefully chosen group of secure libraries:

* **Framework**: Express.js - Lightweight, fast routing.
* **Database Driver**: Mongoose - Object Modeling for MongoDB.
* **Authentication**: jsonwebtoken (JWT) + bcryptjs - Safe password hashing & session management.
* **Security Headers**: helmet - Protects against common security vulnerabilities.
* **Rate Limiter**: express-rate-limit - Prevents brute force attacks.
* **Logging**: morgan - Clean HTTP transaction reports in terminal outputs.
* **File Streamer**: multer - Handles multipart file submissions for product pictures.

---

## Directory Architecture

```text
backend/
├── src/                  # Core source files (services, integrations)
├── controllers/          # Business logic handlers mapped from router lines
│   ├── authController.js     # User registration, Admin login, Token verification
│   ├── productController.js  # CRUD actions for cakes, snacks, fast-food items
│   ├── orderController.js    # Customer order processing, tracking, statuses
│   ├── messageController.js  # Feedback, custom order inquiries, contact forms
│   └── galleryController.js  # Photo uploads for cake showcase
├── models/               # MongoDB Document Schemas mapped through Mongoose
│   ├── User.js               # Admin profile, email credentials, password hashes
│   ├── Product.js            # Cake/snack names, description, price, categories, image URLs
│   ├── Order.js              # Items list, customer contact details, total price, status
│   ├── Message.js            # Customer contact submissions
│   └── Testimonial.js        # Client reviews and approval flags
├── routes/               # API router files
│   ├── authRoutes.js         # JWT pathways (/api/auth)
│   ├── productRoutes.js      # Public/Admin product endpoints (/api/products)
│   ├── orderRoutes.js        # Ordering operations (/api/orders)
│   ├── messageRoutes.js      # Contact pathways (/api/messages)
│   └── galleryRoutes.js      # Portfolio updates (/api/gallery)
├── middleware/           # Intercepting middlewares
│   ├── authMiddleware.js     # Verifies JWT cookies/headers, extracts role permissions
│   ├── errorMiddleware.js    # Standardized response format for errors
│   ├── uploadMiddleware.js   # Multer file parsing for local/cloud file streams
│   └── rateLimitMiddleware.js# Rate limiters grouped by pathway threat levels
├── services/             # Integrations (Stripe, Cloudinary, Mailer)
├── config/               # Connections and Loaders
│   └── db.js                 # Unified mongoose.connect listener with reconnect retry logic
├── utils/                # Functional helper libraries
├── uploads/              # Local server landing spot for multipart file data
├── public/               # Static folder fallback
├── database/             # Seeds for initial products & Admin setup
├── app.js                # Express app config (loaders, helmet, morgan, route bindings)
├── server.js             # Listener, cluster forks, and active port declarations
└── package.json          # Node modules, system scripts
```

---

## Setup & Local Installation

### Prerequisites
* **Node.js**: `v18.0.0` or higher
* **MongoDB**: A local or remote database string

### Step-by-Step Installation
1. Move to the directory:
   ```bash
   cd backend
   ```
2. Download packages:
   ```bash
   npm install
   ```
3. Establish your environment files:
   ```bash
   cp .env.example .env
   ```
4. Configure key strings inside `.env` (such as `MONGODB_URI` and `JWT_SECRET`).
5. Run DB Seeder to populate default categories, administrative accounts, and products:
   ```bash
   npm run seed
   ```
6. Fire up development server:
   ```bash
   npm run dev
   ```

---

## API Specifications Summary

### Auth Routes (`/api/auth`)
* `POST /api/auth/signup` - Public customer registration
* `POST /api/auth/login` - Authenticate & retrieve Bearer Token
* `GET /api/auth/profile` - Verify token & return user/admin credentials
* `POST /api/auth/register` - Create Admin Account (Protected)

### Product Routes (`/api/products`)
* `GET /api/products` - Return list of all cakes, snacks, and drinks (filter via query string)
* `GET /api/products/:id` - Query a single product details
* `POST /api/products` - Save new product item (Admin required + Image)
* `PUT /api/products/:id` - Update product attributes (Admin required)
* `DELETE /api/products/:id` - Remove product from catalogs (Admin required)

### Order Routes (`/api/orders`)
* `POST /api/orders` - Public customer checkout form submission
* `POST /api/orders/:id/pay-pesapal` - Start the Pesapal payment session for an order
* `POST /api/orders/:id/complete-simulated-payment` - Complete a sandbox Pesapal payment and update order status
* `GET /api/orders` - Fetch all orders (Admin role checked)
* `PATCH /api/orders/:id/status` - Update delivery, preparation, or payment status (Admin checked)

### Message Routes (`/api/messages`)
* `POST /api/messages` - Contact/Feedback form submission
* `GET /api/messages` - Retrieve all feedback submissions (Admin required)
