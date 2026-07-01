# SK Cakes REST API Specification

This document details the complete HTTP REST API paths exposed by the SK Cakes Node.js/Express.js backend service.

* **Base URL**: `https://api.skcakes.com` (Production on Render) or `http://localhost:5000` (Local Development)
* **Default Format**: All payloads and responses are formatted as `application/json`.
* **Authentication**: Bearer Token via the `Authorization: Bearer <token>` header.

---

## 1. Authentication Services (`/api/auth`)

### 🔑 Login / Administrator Session Initiation
Authenticate an administrative account and retrieve a JSON Web Token (JWT).
* **Endpoint**: `POST /api/auth/login`
* **Access**: Public
* **Request Payload**:
```json
{
  "email": "admin@skcakes.com",
  "password": "password123"
}
```
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6472b5c00e12ff48e2df89aa",
    "name": "SK Cakes Admin",
    "email": "admin@skcakes.com",
    "role": "admin"
  }
}
```
* **Error Response (401 Unauthorized)**:
```json
{
  "success": false,
  "message": "Invalid credentials provided"
}
```

### 👤 Get Current Admin Profile
Fetch profile details for the authenticated user session.
* **Endpoint**: `GET /api/auth/profile`
* **Access**: Private (Admin Token Required)
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "user": {
    "id": "6472b5c00e12ff48e2df89aa",
    "name": "SK Cakes Admin",
    "email": "admin@skcakes.com",
    "role": "admin",
    "createdAt": "2026-06-30T12:00:00.000Z"
  }
}
```

### ➕ Create a New Administrator Account
Register a secondary administrator profile in the system.
* **Endpoint**: `POST /api/auth/register`
* **Access**: Private (Admin Token Required)
* **Request Payload**:
```json
{
  "name": "Chile Branch Manager",
  "email": "chile@skcakes.com",
  "password": "secure_password_456"
}
```

---

## 2. Product Catalog Services (`/api/products`)

### 🍰 Fetch Product Menu (Filterable)
Retrieve a list of all products (cakes, fast food snacks, chips, drinks, cookies). Supports optional search and category filters.
* **Endpoint**: `GET /api/products`
* **Access**: Public
* **Query Parameters**:
  * `category` (Optional) - Filter by `cakes`, `snacks`, `chips`, `drinks`, `cookies`
  * `search` (Optional) - Match text patterns in title or description
  * `sort` (Optional) - Sort keys, e.g., `price`, `-price` (descending), `createdAt`
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "count": 2,
  "products": [
    {
      "_id": "6472b7a90e12ff48e2df89ab",
      "name": "Classic Birthday Chocolate Cake",
      "description": "Delectable double chocolate sponge cake covered with premium Belgian chocolate frosting.",
      "price": 35000,
      "imageUrl": "/uploads/product-1685231401000.png",
      "category": "cakes",
      "subCategory": "Birthday",
      "stock": 15,
      "isFeatured": true,
      "createdAt": "2026-06-30T12:05:00.000Z"
    }
  ]
}
```

### 🎂 Add a Catalog Product
Register a new cake or fast food product, with associated image uploading.
* **Endpoint**: `POST /api/products`
* **Access**: Private (Admin Token Required)
* **Request Content-Type**: `multipart/form-data`
* **Form Fields**:
  * `name`: "Traditional Beef Samosas"
  * `description`: "Crispy triangular pastries stuffed with spiced minced meat."
  * `price`: 8000
  * `category`: "snacks"
  * `subCategory`: "Samosas"
  * `stock`: 100
  * `isFeatured`: true
  * `image`: (Binary File stream)

---

## 3. Order Placement & CRM (`/api/orders`)

### 🛒 Submit a Customer Order (Checkout)
Pipes selected snacks and custom cakes into the backend, recalculates prices against official database records, and triggers fulfillment.
* **Endpoint**: `POST /api/orders`
* **Access**: Public
* **Request Payload**:
```json
{
  "customerName": "John Doe",
  "customerEmail": "johndoe@example.com",
  "customerPhone": "+256771234567",
  "deliveryAddress": "Plot 12, Ggaba Road, Kampala, Uganda",
  "notes": "Please deliver before 2:00 PM. No onions in chips.",
  "items": [
    {
      "product": "6472b7a90e12ff48e2df89ab",
      "quantity": 2
    }
  ]
}
```
* **Success Response (210 Created)**:
```json
{
  "success": true,
  "message": "Your order has been submitted successfully!",
  "order": {
    "_id": "6472c10b0e12ff48e2df89ac",
    "customerName": "John Doe",
    "customerEmail": "johndoe@example.com",
    "customerPhone": "+256771234567",
    "deliveryAddress": "Plot 12, Ggaba Road, Kampala, Uganda",
    "items": [
      {
        "product": "6472b7a90e12ff48e2df89ab",
        "name": "Classic Birthday Chocolate Cake",
        "quantity": 2,
        "price": 35000,
        "_id": "6472c10b0e12ff48e2df89ad"
      }
    ],
    "totalAmount": 70000,
    "orderStatus": "pending",
    "paymentStatus": "pending",
    "createdAt": "2026-06-30T12:15:00.000Z"
  }
}
```

### 📝 Change Order Delivery or Payment Milestones
Enables administrative dashboards to move orders through the baking queue or delivery fleet.
* **Endpoint**: `PATCH /api/orders/:id/status`
* **Access**: Private (Admin Token Required)
* **Request Payload**:
```json
{
  "orderStatus": "preparing",
  "paymentStatus": "paid"
}
```

---

## 4. Feedback & Custom Enquiries (`/api/messages`)

### 📨 Send Contact Form Message
Enables custom cake orders or corporate catering quote requests.
* **Endpoint**: `POST /api/messages`
* **Access**: Public
* **Request Payload**:
```json
{
  "name": "Maria Elena",
  "email": "maria@chilemail.cl",
  "phone": "+56912345678",
  "subject": "Custom Graduation Cake Inquiry",
  "message": "Hi, I want a 3-tier graduation cake styled in University of Chile colors. Is that possible?"
}
```
