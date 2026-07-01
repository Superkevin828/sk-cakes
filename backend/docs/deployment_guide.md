# SK Cakes Deployment & Host Guide

This guide details instructions to deploy the decoupled SK Cakes application using the professional, cost-effective infrastructure of **Render** (for the Express/MongoDB server) and **Cloudflare Pages** (for the static React client).

---

## Part 1: MongoDB Database Instance Setup

Before launching the server, provision a permanent database instance.

### 🍃 MongoDB Atlas Setup
1. Log in or create a free account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new database project named `SK-Cakes`.
3. Deploy a free **M0 Shared Sandbox** cluster in a regional zone closest to your audience (e.g., Frankfurt/London for Uganda-focused deployment, or N. Virginia/Santiago for Chile-focused).
4. Establish **Network Access permissions**:
   * Click **Network Access** under Security.
   * Add a temporary whitelist rule `0.0.0.0/0` (Allow access from anywhere). *Required because Render web services use dynamic outbound IP pools.*
5. Create **Database Users**:
   * Create a username and strong password (avoid special characters like `@` or `:` in your password as they cause URI encoding errors).
6. Copy the connection string:
   * Click **Connect** on your Database Cluster -> select **Drivers** (Node.js).
   * Copy the connection string (e.g., `mongodb+srv://<user>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`).
   * Replace `<password>` with the actual user password. Save this string for the next steps.

---

## Part 2: Backend Deployment on Render

Render will host the active Node.js listener container and proxy queries to MongoDB Atlas.

### 🚀 Render Configuration Steps
1. Navigate to the [Render Dashboard](https://dashboard.render.com/) and click **New** -> **Web Service**.
2. Connect your GitHub repository.
3. If it is a monorepo, configure the directory offsets as follows:
   * **Name**: `sk-cakes-api`
   * **Region**: Choose a region closest to your DB clusters (e.g., `Frankfurt` or `Oregon`).
   * **Branch**: `main` (or active development branch)
   * **Root Directory**: `backend` (Crucial! Forces Render to build only this subdirectory)
   * **Runtime**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `node server.js`
4. Set Instance Type to **Free** (or Starter for professional workloads).
5. Open the **Environment Variables** panel and add the following keys:
   * `NODE_ENV` = `production`
   * `PORT` = `10000` (Render binds automatically, but establishing this clarifies endpoints)
   * `MONGODB_URI` = `mongodb+srv://sk_user:YOUR_SECRET_DB_PASSWORD@cluster0.abcde.mongodb.net/sk_cakes?retryWrites=true&w=majority`
   * `JWT_SECRET` = `Generate_a_cryptographically_secure_random_string_using_openssl_rand`
   * `JWT_EXPIRE` = `7d`
   * `FRONTEND_URL` = `https://skcakes.pages.dev` (Your Cloudflare subdomain)
6. Click **Create Web Service**.
7. Wait 2-3 minutes for the build cycle to finish. Copy the assigned Render service URL (e.g., `https://sk-cakes-api.onrender.com`).

---

## Part 3: Frontend Deployment on Cloudflare Pages

Cloudflare Pages provides global edge hosting with instant builds, DDoS protection, and SSL optimization.

### ☁️ Cloudflare Pages Configuration Steps
1. Log in or sign up at the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Select **Workers & Pages** in the sidebar.
3. Click **Create Application** -> **Pages** -> **Connect to Git**.
4. Authorize your GitHub profile and select the repository holding the `frontend` folder.
5. In the **Set up builds and deployments** page, enter these exact settings:
   * **Project Name**: `skcakes` (will determine your fallback address `skcakes.pages.dev`)
   * **Production Branch**: `main`
   * **Framework Preset**: `Vite` (or None, if manually entering parameters)
   * **Root Directory**: `frontend` (Crucial! Directs Cloudflare to execute compilation from the frontend subfolder)
   * **Build Command**: `npm run build`
   * **Build Output Directory**: `dist`
6. Expand **Environment Variables (advanced)** and input:
   * **Key**: `VITE_API_URL`
   * **Value**: `https://sk-cakes-api.onrender.com` (Your live Render Backend address)
7. Click **Save and Deploy**.
8. Cloudflare will build the React site, deploy it to edge endpoints, and output a URL (e.g., `https://skcakes.pages.dev`).

### 🛠️ Single-Page Application (SPA) Redirection Rule
Since Vite uses standard React Router history-state paths, navigating to sub-pages like `https://skcakes.pages.dev/menu` and hitting refresh might return a standard Cloudflare `404 Not Found` error.
To resolve this:
1. Create a `_redirects` file in the frontend's static directory.
2. Put the following single line inside the file:
   ```text
   /*  /index.html  200
   ```
3. When built, this copies over to the root `dist/` directory, instructing Cloudflare Pages to map all client requests back to the master React shell `index.html`, allowing the virtual router to handle paths smoothly.

---

## Part 4: Post-Deployment Inter-Service Check

Verify database connectivity and client queries:
1. Load the backend health probe in your browser: `https://sk-cakes-api.onrender.com/api/health`.
   * Look for a `{"status":"healthy", ...}` output confirming server execution.
2. Open the browser's developer console on your live Cloudflare address (`https://skcakes.pages.dev`).
3. Check the network log when listing menu items to ensure requests return a `200 OK` status without generating CORS headers violations.
