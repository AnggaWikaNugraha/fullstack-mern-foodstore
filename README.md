# Fullstack MERN Foodstore

A food e-commerce application built with the MERN Stack (MongoDB, Express, React, Node.js). Users can browse food products, add items to their cart, checkout, and view order history. Admins can manage products and categories.

## Soon Feature
- Socket.io — real-time notif order status (customer lihat pesanan diproses → dikirim → selesai live)
- Web Push Notification	Service Worker + Push notif firebase
- Redis + Bull queue — upgrade email job ke proper queue system untuk production
- Wishlist — simpan produk favorit
- Admin dashboard — grafik revenue, produk terlaris, total order per hari
- AI product recommendation	OpenAI API	AI integration, trending banget
- Full-text search	Elasticsearch / Meilisearch	Fuzzy search, typo tolerance
- Admin order management — admin bisa update status order (processing → in_delivery → delivered), sekarang status tidak bisa diubah dari UI sama sekali

## New Features:
- **Midtrans Payment Gateway** — integrasi Snap popup, invoice bisa dibayar langsung (sandbox mode)
- Product Rating & Review
- Stock Management
- Cloudinary Image Upload
- Email Konfirmasi Order (Nodemailer)

### BE New API
- `POST /api/reviews` — submit a review (login required)
- `GET /api/reviews?product_id=&order_id=` — get reviews by product or order
- `GET /api/payments/token/:order_id` — get Midtrans Snap token for an invoice
- `GET /api/payments/verify/:order_id` — verify & sync payment status from Midtrans API to DB
- `POST /api/payments/notification` — Midtrans webhook handler (update invoice & order status)
- Stock decremented automatically via `$inc` on each ordered product when order is created
- Product images uploaded to Cloudinary (multer memoryStorage → Cloudinary upload_stream), old image auto-deleted on update
- Email konfirmasi order dikirim otomatis via Nodemailer (fire-and-forget, tidak blok response checkout)

## Features
- Product listing
- Search products by keyword
- Filter products by category
- Filter products by tags
- User login & registration
- Shopping cart (per-user, isolated)
- Checkout
- Order history
- Manage delivery addresses
- Admin page for managing products and categories
- Indonesian regional data (province, city, district, village)

---

# Server Side
- Node.js
- passport-local
- passport
- mongoose
- MongoDB database
- jsonwebtoken — JWT authentication and authorization
- Express framework
- cors
- cookie-parser
- bcrypt
- multer — reads multipart/form-data from client
- @casl/ability — role-based access control
- csvtojson — reads regional data from CSV files
- mongoose-sequence — auto-increments customer_id
- dotenv — environment variable configuration
- cloudinary — cloud image storage
- nodemailer — transactional email (order confirmation)
- midtrans-client — Midtrans payment gateway (Snap)

## Project Structure

```
fullstack-mern-foodstore/
├── foodstore-server/          # Backend (Node.js + Express)
│   ├── app/
│   │   ├── auth/              # Authentication (register, login, logout, me)
│   │   ├── cart/              # Shopping cart
│   │   ├── cart-item/         # Cart item model
│   │   ├── category/          # Product categories
│   │   ├── delivery-address/  # Delivery addresses
│   │   ├── invoice/           # Order invoices
│   │   ├── order/             # Orders
│   │   ├── order-item/        # Order items
│   │   ├── policy/            # Role-based access control (CASL)
│   │   ├── product/           # Food products
│   │   ├── tag/               # Product tags
│   │   ├── user/              # User model
│   │   ├── wilayah/           # Indonesian regional data (province, city, district, village)
│   │   ├── config.js
│   │   └── utils/
│   ├── database/              # MongoDB connection
│   ├── public/upload/         # Product image storage
│   └── app.js
└── foodstore-web/             # Frontend (React)
    ├── src/
    │   ├── api/               # API call layer
    │   ├── app/               # Redux store & listener
    │   ├── component/         # Reusable components (Topbar, Cart, OnlyLogin, etc.)
    │   ├── features/          # Redux slices (Auth, Cart, products, categories)
    │   ├── hooks/             # Custom hooks
    │   ├── pages/             # Application pages
    │   └── utils/             # Utility functions
    └── public/
```

---

## Entity Diagram
![image](https://user-images.githubusercontent.com/37723902/120694299-3bc7e900-c4d4-11eb-8d92-cb9344f272c2.png)

## Roles & Permissions (CASL)

| Role  | Access                                                                                       |
|-------|----------------------------------------------------------------------------------------------|
| guest | Read products                                                                                |
| user  | CRUD own delivery addresses, update cart, create & view orders, read own invoices           |
| admin | Manage all resources (full access)                                                           |

---

## Getting Started

### Backend (foodstore-server)

```bash
cd foodstore-server
npm install
# Create .env file (see configuration below)
npm start
```

Server runs at `http://localhost:3000`

### Frontend (foodstore-web)

```bash
cd foodstore-web
npm install
# Create .env file (see configuration below)
npm start
```

Frontend runs at `http://localhost:3001` (or the next available port)

---

# API Spec

Base URL: `http://localhost:3000`

> Auth endpoints are under `/auth`. All other endpoints are prefixed with `/api`.

---

# Auth

## Register
- Method : POST
- Endpoint : `/auth/register`
- Body (form-data) : `full_name`, `email`, `password`

## Login
- Method : POST
- Endpoint : `/auth/login`
- Body (form-data) : `email`, `password`
- Response : `{ user, token }`

## Me (currently logged-in user profile)
- Method : GET
- Endpoint : `/auth/me`
- Header : `Authorization: Bearer <token>`

## Logout
- Method : POST
- Endpoint : `/auth/logout`
- Header : `Authorization: Bearer <token>`

---

# Product
## Get Products:
Request :
- Method : GET
- Endpoint : `/api/products/`
- Query params : `limit`, `skip`, `q` (keyword), `category`, `tags[]`

## Create Product:
Request :
- Method : POST
- Endpoint : `/api/products/`
- Auth : Admin only
- Body (form-data) : `name`, `description`, `price`, `category`, `tags[]`, `image` (file)

## Edit Product:
Request :
- Method : PUT
- Endpoint : `/api/products/:id`
- Auth : Admin only

## Delete Product:
Request :
- Method : DELETE
- Endpoint : `/api/products/:id`
- Auth : Admin only

---

# Category
## Get Categories:
Request :
- Method : GET
- Endpoint : `/api/categories/`
## Create Category:
Request :
- Method : POST
- Endpoint : `/api/categories/`
## Edit Category:
Request :
- Method : PUT
- Endpoint : `/api/categories/:id`
## Delete Category:
Request :
- Method : DELETE
- Endpoint : `/api/categories/:id`

---

# Tag
## Get Tags:
Request :
- Method : GET
- Endpoint : `/api/tags/`
## Create Tag:
Request :
- Method : POST
- Endpoint : `/api/tags/`
## Edit Tag:
Request :
- Method : PUT
- Endpoint : `/api/tags/:id`
## Delete Tag:
Request :
- Method : DELETE
- Endpoint : `/api/tags/:id`

---

# Delivery Address
## Get Delivery Addresses:
Request :
- Method : GET
- Endpoint : `/api/delivery-addresses/`
- Auth : Login required
## Create Delivery Address:
Request :
- Method : POST
- Endpoint : `/api/delivery-addresses/`
- Auth : Login required
- Body : `nama`, `provinsi`, `kabupaten`, `kecamatan`, `kelurahan`, `detail`
## Edit Delivery Address:
Request :
- Method : PUT
- Endpoint : `/api/delivery-addresses/:id`
- Auth : Login required (owner only)
## Delete Delivery Address:
Request :
- Method : DELETE
- Endpoint : `/api/delivery-addresses/:id`
- Auth : Login required (owner only)

---

# Order
## Get Orders:
Request :
- Method : GET
- Endpoint : `/api/orders/`
- Auth : Login required
## Create Order:
Request :
- Method : POST
- Endpoint : `/api/orders/`
- Auth : Login required
- Body : `delivery_fee`, `delivery_address` (address ID)

---

# Cart
## Get Cart Items:
Request :
- Method : GET
- Endpoint : `/api/carts/`
- Auth : Login required
## Update Cart Items:
Request :
- Method : PUT
- Endpoint : `/api/carts/`
- Auth : Login required
- Body : `items` (array of `{ _id, qty }`)

---

# Invoice
## Get Invoice by Order:
Request :
- Method : GET
- Endpoint : `/api/invoices/:order_id`
- Auth : Login required (owner only)

---

# Wilayah (Indonesian Regional Data)
## Get Provinces:
Request :
- Method : GET
- Endpoint : `/api/wilayah/provinsi`
## Get Regencies/Cities:
Request :
- Method : GET
- Endpoint : `/api/wilayah/kabupaten`
- Query params : `provinsi`
## Get Districts:
Request :
- Method : GET
- Endpoint : `/api/wilayah/kecamatan`
- Query params : `kabupaten`
## Get Villages:
Request :
- Method : GET
- Endpoint : `/api/wilayah/desa`
- Query params : `kecamatan`

---

# Client Side — React
## Stacks
- React.js — client side UI
- React Redux + redux-thunk middleware
- Context API
- TailwindCSS — CSS framework
- react-router-dom — routing
- react-hook-form — form input handling
- axios — API fetching
- Styled components and composition
- upkit — UI component library
- yup — validation schema
- formik — form state management
- react-spinners — loading indicators
- react-data-table-component — admin data tables
- @emotion/react & @emotion/styled — styling

## Pages
| Path                        | Page                       | Access       |
|-----------------------------|----------------------------|--------------|
| `/`                         | Home (product listing)     | Everyone     |
| `/login`                    | Login                      | Guest only   |
| `/register`                 | Register new account       | Guest only   |
| `/register/berhasil`        | Registration success       | Guest only   |
| `/logout`                   | Logout                     | Login only   |
| `/alamat-pengiriman/`       | Delivery address list      | Login only   |
| `/alamat-pengiriman/tambah` | Add delivery address       | Login only   |
| `/checkout`                 | Checkout                   | Login only   |
| `/invoice/:order_id`        | Invoice detail             | Login only   |
| `/admin/product`            | Manage products (admin)    | Admin only   |
| `/admin/categories`         | Manage categories (admin)  | Admin only   |
| `/error`                    | 404 page                   | Everyone     |


## Environment Variables

##### add .env to foodstore-server

```
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/foodstore
SECRET_KEY=your_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Nodemailer (Gmail App Password)
MAIL_USER=
MAIL_PASS=

# Midtrans (Sandbox)
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false
```

##### add .env to foodstore-web

```
REACT_APP_API_HOST=http://localhost:3000
REACT_APP_SITE_TITLE=FoodStore
REACT_APP_GLOBAL_ONGKIR=20000
REACT_APP_OWNER=YourName
REACT_APP_CONTACT=your@email.com
REACT_APP_BILLING_NO=1234567890
REACT_APP_BILLING_BANK=BCA
```
