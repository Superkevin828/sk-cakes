# SK Cakes Database Schema Specification

This document maps out the MongoDB database structure managed by the Mongoose ODM in the SK Cakes backend.

```text
  ┌─────────────────┐             ┌─────────────────┐
  │      User       │             │     Product     │
  ├─────────────────┤             ├─────────────────┤
  │ _id (ObjectId)  │             │ _id (ObjectId)  │
  │ name (String)   │             │ name (String)   │
  │ email (String)  │             │ price (Number)  │
  │ password(String)│             │ category (Enum) │
  │ role (Enum)     │             │ stock (Number)  │
  └─────────────────┘             └────────┬────────┘
                                           │
                                           │ references
                                           ▼
                                  ┌─────────────────┐
                                  │      Order      │
                                  ├─────────────────┤
                                  │ _id (ObjectId)  │
                                  │ customerName    │
                                  │ customerPhone   │
                                  │ totalAmount     │
                                  │ items [         │
                                  │   product  ─────┼─── (Ref: Product)
                                  │   quantity      │
                                  │   price         │
                                  │ ]               │
                                  └─────────────────┘
```

---

## 1. Collection: `users` (Admin Accounts)

This collection houses profiles permitted to edit the website, manage product catalogs, view messages, and track deliveries.

| Key | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **`_id`** | `ObjectId` | Auto-generated, Primary Key | Unique ID. |
| **`name`** | `String` | Required, Trimmed | Full display name. |
| **`email`** | `String` | Required, Unique, Lowercase | Primary contact/login email. Regex validated. |
| **`password`** | `String` | Required, MinLength (6), Excluded | Salted hash of login password (bcrypt-10). |
| **`role`** | `String` | Required, Enum | Allowed values: `admin`, `superadmin`. Default: `admin`. |
| **`createdAt`** | `Date` | Auto-generated | Timestamp of account registration. |
| **`updatedAt`** | `Date` | Auto-generated | Timestamp of last profile change. |

---

## 2. Collection: `products` (Cake & Snack Catalog)

Holds definitions for all fast food snacks, customized cakes, beverages, cookies, and miscellaneous confectioneries sold by SK Cakes.

| Key | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **`_id`** | `ObjectId` | Auto-generated, Primary Key | Unique ID. |
| **`name`** | `String` | Required, Trimmed, MaxLength (100) | Item name. Indexed for text-search queries. |
| **`description`**| `String` | Required, MaxLength (1000) | Detailed catalog or menu description. |
| **`price`** | `Number` | Required, Min (0) | Base cost in local currency (UGX / CLP). |
| **`imageUrl`** | `String` | Default: `/uploads/placeholder-product.png`| Hosting path of the product vector or picture. |
| **`category`** | `String` | Required, Enum | Options: `cakes`, `snacks`, `chips`, `drinks`, `cookies`, `other`. |
| **`subCategory`**| `String` | Trimmed, Default: `""` | Sub-filters (e.g., `Birthday`, `Chicken snacks`). |
| **`stock`** | `Number` | Required, Min (0), Default: `10` | Real-time stock counts. |
| **`isFeatured`** | `Boolean` | Default: `false` | Highlight flags for home page showcase sliders. |

### Indexes
* `category: 1` - Single field index to optimize category queries.
* `name: "text", description: "text"` - Multi-field text index to accelerate keyword search queries.

---

## 3. Collection: `orders` (Fulfillment Log)

Documents all cake and snack orders sent by customers, mapping purchased products directly through references.

| Key | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **`_id`** | `ObjectId` | Auto-generated, Primary Key | Order reference ID. |
| **`customerName`**| `String` | Required, Trimmed | Full name of recipient. |
| **`customerEmail`**| `String` | Trimmed, Regex Validated | Email address for confirmation receipt. |
| **`customerPhone`**| `String` | Required | Phone number for delivery coordinator. |
| **`deliveryAddress`**| `String`| Required, Trimmed | Street address/GPS coordinate for drops. |
| **`items`** | `Array` | Contains `OrderItem` schemas | List of food items selected. See Sub-schema below. |
| **`totalAmount`**| `Number` | Required, Min (0) | Overall order price in regional currency. |
| **`notes`** | `String` | Trimmed, Default: `""` | Bakery instructions or allergen warnings. |
| **`orderStatus`**| `String` | Required, Enum | Options: `pending`, `preparing`, `delivering`, `completed`, `cancelled`. Default: `pending`. |
| **`paymentStatus`**| `String`| Required, Enum | Options: `pending`, `paid`, `failed`. Default: `pending`. |

### Sub-Schema: `OrderItem`
Embedded document defining single products purchased.
* **`product`**: `ObjectId` (Refers to `Product` model) - Foreign key check.
* **`name`**: `String` - Snapshot of name at checkout time.
* **`quantity`**: `Number` - Amount ordered (Min: 1).
* **`price`**: `Number` - Snapshot of price at checkout time (protects histories against subsequent price increases).

---

## 4. Collection: `messages` (Inquiries & Form entries)

| Key | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| **`_id`** | `ObjectId` | Auto-generated, Primary Key | Message unique reference. |
| **`name`** | `String` | Required, Trimmed | Name of the sender. |
| **`email`** | `String` | Required, Lowercase | Sender's email. |
| **`phone`** | `String` | Trimmed | Sender's phone. |
| **`subject`** | `String` | Trimmed, Default: `'General Inquiry'`| Inquiry topic or custom cake title. |
| **`message`** | `String` | Required, MaxLength (2000) | Detailed custom request text. |
| **`isRead`** | `Boolean` | Default: `false` | Action toggle. |
| **`createdAt`** | `Date` | Auto-generated | Time submitted. |
