# SK Cakes - Full-Stack Architecture

SK Cakes is a premium bakery and snacks business based in Kampala (Uganda) and Chile. This repository contains the complete full-stack project structure designed for scale, speed, and clean code division.

## Project Architecture Overview

To achieve optimal performance, security, and independent scalability, this project is split into two separate and decoupled modules:

1. **Frontend (`/frontend`)**: A modern, mobile-first single-page application built with React, styled using Tailwind CSS, and optimized for deployment on **Cloudflare Pages**.
2. **Backend (`/backend`)**: A robust RESTful API built with Node.js, Express.js, and MongoDB/Mongoose. Designed for hosting on **Render** with CORS protections, rate limiting, secure JWT authentication, and image upload support.

---

## Workspace Directory Tree

```text
sk-cakes/
├── backend/                  # RESTful API Backend (Hosted on Render)
│   ├── src/                  # Core TypeScript / JavaScript source files
│   ├── controllers/          # Request handlers & business logic (JWT, Products, Orders)
│   ├── models/               # MongoDB Mongoose Schemas (User, Product, Order, Message)
│   ├── routes/               # Express routing endpoints mapping to controllers
│   ├── middleware/           # Auth guards, security headers, file upload config
│   ├── services/             # Integrations (Email handlers, Payment, Cloudinary storage)
│   ├── config/               # DB connection, environment loaders, passport configuration
│   ├── utils/                # Helper modules (loggers, custom validators, formatters)
│   ├── uploads/              # Local temporary upload directory for images
│   ├── public/               # Static public files for fallback server assets
│   ├── database/             # Database seeds, migration helpers, or configuration
│   ├── app.js                # Core Express application configuration
│   ├── server.js             # Server entry-point (database connection & listener)
│   ├── package.json          # Node.js dependencies and run scripts
│   ├── .env.example          # Template for server secrets and database URLs
│   ├── .gitignore            # Excludes node_modules, .env, and local uploads
│   └── README.md             # Detailed documentation for backend setup & endpoints
│
├── frontend/                 # Client Interface (Hosted on Cloudflare Pages)
│   ├── public/               # Public assets, manifest.json, favicons
│   ├── src/                  # Frontend source folder
│   │   ├── pages/            # View components (Home, Menu, Order, Admin Dashboard)
│   │   ├── components/       # Reusable components (Navbar, Button, Card, SnackItem)
│   │   ├── layouts/          # Page layouts (MainLayout, AuthLayout, AdminLayout)
│   │   ├── assets/           # Client-side static local assets
│   │   ├── images/           # High-resolution product images
│   │   ├── icons/            # SVG custom icons or vector configurations
│   │   ├── styles/           # Global styles and tailwind imports
│   │   ├── hooks/            # Reusable React hooks (useAuth, useCart)
│   │   ├── services/         # API connectors (axios proxy, request hooks)
│   │   ├── context/          # React Context managers (CartContext, AuthContext)
│   │   ├── utils/            # Client utility helpers (formatting, local storage)
│   │   ├── router/           # Routing configuration & route guards
│   │   └── App.tsx           # Primary React entry component
│   ├── package.json          # Frontend packages and Vite/PostCSS configurations
│   └── README.md             # Detailed documentation for frontend compilation
│
├── docs/                     # Architectural, database, and API specification docs
│   ├── api_specification.md  # Detailed list of REST endpoints and request payloads
│   ├── database_schema.md    # MongoDB database relationship models
│   └── deployment_guide.md   # Step-by-step setup for Render & Cloudflare Pages
│
├── .gitignore                # Root-level Git exclusions
├── LICENSE                   # Project software license
└── README.md                 # Primary directory orientation manual
```

---

## Detailed Directory Purpose Matrix

| Directory | Purpose | Implementation Detail |
| :--- | :--- | :--- |
| **`backend/controllers`** | Separates raw router pathways from application logic. | Holds controllers for Products, User Auth, Orders, and Contact messages. |
| **`backend/models`** | Strictly enforces structural MongoDB schemas. | Defines fields, indexes, and hooks for database validation using Mongoose. |
| **`backend/routes`** | Defines clean REST endpoints. | Groups related pathways (e.g., `/api/auth`, `/api/products`) before applying controllers. |
| **`backend/middleware`** | Intercepts HTTP requests for cross-cutting concerns. | Contains JWT verification, rate-limiters, error interceptors, and CORS headers. |
| **`backend/services`** | Connects to external software platforms. | Code handling Stripe/Mobile Money payments, Cloudinary image hosting, and SMTP emails. |
| **`backend/uploads`** | Safely receives local multipart files. | Used by multer before offloading assets to cloud providers. |
| **`frontend/pages`** | Represents full-screen templates mapped by routes. | Distinct pages for Home, Product Details, Fast-food menu, Cart, and Admin CRM. |
| **`frontend/components`**| Holds isolated, self-contained UI components. | Buttons, Cards, Modals, Forms, and animated snack listings. |
| **`frontend/context`** | Manages application state across multiple levels. | Holds Context Providers for user authorization state, cart synchronization, and system notifications. |
| **`frontend/services`** | Interfaces client code with backend REST endpoints. | Custom fetch wrappers or Axios instances routing requests using environment variables. |

---

## Deployment & Hosting Workflow

### 🚀 Backend → Render
1. Create a new **Web Service** in your Render Dashboard.
2. Link the backend directory of your GitHub repository.
3. Configure the following build & run settings:
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Set required **Environment Variables** (see `backend/.env.example`).
5. Render will issue a secure URL (e.g., `https://sk-cakes-api.onrender.com`).

### ☁️ Frontend → Cloudflare Pages
1. Log into your Cloudflare Dashboard and navigate to **Workers & Pages**.
2. Create a new Pages Project linked to your GitHub repository.
3. Configure the build parameters:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
4. Define the runtime **Environment Variables**:
   - `VITE_API_URL` pointing directly to your live Render Backend endpoint.
5. Save and deploy. Cloudflare will automatically generate secure edge subdomains with global SSL encryption.

---

## Quick-Start Local Development

### 1. Database Setup
Ensure you have a running MongoDB instance (either locally or on MongoDB Atlas).

### 2. Launch Backend
```bash
cd backend
cp .env.example .env
# Edit the variables inside .env
npm install
npm run dev
```

### 3. Launch Frontend
```bash
cd ../frontend
cp .env.example .env
# Edit VITE_API_URL to point to your backend local address (e.g., http://localhost:5000)
npm install
npm run dev
```

---

## License

This software is licensed under the MIT License. See `LICENSE` for details.
