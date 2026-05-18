# Fullstack MERN Foodstore

A food e-commerce application built with the MERN Stack (MongoDB, Express, React, Node.js). Users can browse food products, add items to their cart, checkout, and view order history. Admins can manage products, categories, and orders.

---

## Coming soon

- Google OAuth — login dengan akun Google (passport-google-oauth20)
- OTP email verification — verifikasi email saat register
- Rekomendasi produk AI — integrasi OpenAI API
- Export laporan — admin export orders/revenue ke Excel atau PDF (SheetJS / jsPDF)
- Low stock alert — notif Pusher ke admin kalau stok produk hampir habi
- PWA (Progressive Web App) — bisa di-install di HP, offline mode, push notif native
- Jest + React Testing Library — unit test komponen React
- TanStack Query (React Query) — gantikan manual loading/error state, auto cache, refetch. Jauh lebih clean dari Redux untuk server state
- Swagger / OpenAPI — auto-generate dokumentasi API dari kode. Profesional banget untuk portfolio
- monitoring Sentry — error tracking production, tau kalau ada crash di user

## New Features

- **Midtrans Payment Gateway** — Snap popup integration, invoice can be paid directly (sandbox mode)
- **Wishlist** — save favourite products, toggle ❤️ on product card, `/wishlist` page
- **Admin Dashboard** — 30-day revenue chart, orders per day, top 5 best-selling products, summary cards
- **Admin Order Management** — admin updates order status from UI (processing → in_delivery → delivered)
- **Rating & Review** — product review only available after payment settlement
- **Cloudinary Image Upload** — product images stored in cloud, old image auto-deleted on update
- **Order Confirmation Email** — sent automatically via Nodemailer on checkout (fire-and-forget)
- **Stock Management** — stock decremented automatically via `$inc` when order is created
- **Pusher Real-time Notifications** — admin gets instant toast when payment settles, customer sees order status update live (Pusher used instead of Socket.io for Vercel serverless compatibility)

---

## Features

- Product listing with search by keyword, category, and tags
- User registration & login (JWT-based auth)
- Shopping cart (per-user, isolated)
- Checkout with delivery address selection
- Order history & invoice detail
- Manage delivery addresses with Indonesian regional data (province, city, district, village)
- Admin product & category management
- Role-based access control (guest / user / admin)

---

## Roles & Permissions (CASL)

| Role  | Access |
|-------|--------|
| guest | Read products |
| user  | CRUD own delivery addresses, update cart, create & view orders, read own invoices, manage wishlist |
| admin | Manage all resources (full access) |

---

## Project Structure

```
fullstack-mern-foodstore/
├── foodstore-server/                  # Backend (Node.js + Express)
│   ├── app/
│   │   ├── auth/                      # Register, login, logout, me
│   │   ├── cart/                      # Shopping cart
│   │   ├── cart-item/                 # Cart item model
│   │   ├── category/                  # Product categories
│   │   ├── dashboard/                 # Admin dashboard stats & charts
│   │   ├── delivery-address/          # Delivery addresses
│   │   ├── invoice/                   # Order invoices
│   │   ├── order/                     # Orders
│   │   ├── order-item/                # Order items
│   │   ├── payment/                   # Midtrans Snap payment gateway
│   │   ├── policy/                    # Role-based access control (CASL)
│   │   ├── product/                   # Food products
│   │   ├── review/                    # Product reviews & ratings
│   │   ├── tag/                       # Product tags
│   │   ├── user/                      # User model
│   │   ├── wilayah/                   # Indonesian regional data (CSV-based)
│   │   ├── wishlist/                  # Wishlist
│   │   ├── utils/
│   │   │   ├── cloudinary.js          # Cloudinary upload helper
│   │   │   ├── mailer.js              # Nodemailer transporter
│   │   │   └── get-token.js           # JWT token helper
│   │   └── config.js
│   ├── database/                      # MongoDB connection
│   └── app.js                         # Express entry point
│
└── foodstore-web/                     # Frontend (React)
    └── src/
        ├── api/                       # Axios API call layer
        │   ├── auth.js
        │   ├── cart.js
        │   ├── category.js
        │   ├── dashboard.js
        │   ├── invoice.js
        │   ├── orders.js
        │   ├── payment.js
        │   ├── products.js
        │   ├── review.js
        │   ├── tag.js
        │   └── wishlist.js
        ├── app/                       # Redux store & middleware listener
        ├── component/                 # Reusable components
        │   ├── AppSidebar/            # Category & admin navigation
        │   ├── Cart/                  # Cart drawer
        │   ├── OnlyAdmin/             # Admin route guard
        │   ├── OnlyGuest/             # Guest route guard
        │   ├── OnlyLogin/             # Auth route guard
        │   ├── SelectWilayah/         # Indonesian region selector
        │   ├── StarRating/            # Star rating display
        │   ├── StatusLabel/           # Payment status badge
        │   └── Topbar/                # Top navigation bar
        ├── features/                  # Redux slices
        │   ├── Auth/
        │   ├── Cart/
        │   ├── categories/
        │   └── products/
        ├── hooks/                     # Custom React hooks
        ├── pages/                     # Application pages
        │   ├── 404/
        │   ├── Account/
        │   ├── AdminOrders/
        │   ├── Checkout/
        │   ├── Dashboard/
        │   ├── Home/
        │   ├── Login/
        │   ├── Register/
        │   ├── RegisterSucces/
        │   ├── UserAddressAdd/
        │   ├── Wishlist/
        │   ├── categories/
        │   ├── invoice/
        │   ├── logout/
        │   ├── product/
        │   ├── tag/
        │   └── userAddress/
        ├── styles/
        └── utils/
```

---

## Pages

| Path | Page | Access |
|------|------|--------|
| `/` | Home — product listing | Everyone |
| `/login` | Login | Guest only |
| `/register` | Register new account | Guest only |
| `/register/berhasil` | Registration success | Guest only |
| `/logout` | Logout | Login only |
| `/account` | Account profile & order history | Login only |
| `/wishlist` | Wishlist | Login only |
| `/alamat-pengiriman/` | Delivery address list | Login only |
| `/alamat-pengiriman/tambah` | Add delivery address | Login only |
| `/checkout` | Checkout | Login only |
| `/invoice/:order_id` | Invoice detail + Midtrans payment | Login only |
| `/admin/dashboard` | Admin dashboard | Admin only |
| `/admin/orders` | Manage orders & status | Admin only |
| `/admin/product` | Manage products | Admin only |
| `/admin/categories` | Manage categories | Admin only |
| `/admin/tag` | Manage tags | Admin only |
| `/error` | 404 page | Everyone |

---

## Tech Stack

### Backend

| Package | Purpose |
|---------|---------|
| Node.js | JavaScript runtime |
| Express | HTTP framework, routing, middleware |
| MongoDB | NoSQL document database |
| Mongoose | ODM — schema, model, query builder |
| jsonwebtoken | JWT authentication & authorization |
| passport | Authentication middleware |
| passport-local | Local email/password strategy |
| bcrypt | Password hashing |
| cors | Cross-origin resource sharing |
| cookie-parser | Cookie parsing middleware |
| multer | Multipart/form-data (file uploads) |
| cloudinary | Cloud image storage & CDN |
| @casl/ability | Role-based access control |
| nodemailer | Transactional email (order confirmation) |
| midtrans-client | Midtrans Snap payment gateway |
| pusher | Trigger real-time events to clients via Pusher API |
| csvtojson | Parse Indonesian regional data from CSV |
| mongoose-sequence | Auto-increment customer_id |
| dotenv | Environment variable configuration |

### Frontend

| Package | Purpose |
|---------|---------|
| React.js | UI library |
| React Redux | Global state management |
| redux-thunk | Async middleware for Redux |
| Context API | Local/shared state without Redux |
| react-router-dom | Client-side routing |
| axios | HTTP client for API calls |
| TailwindCSS | Utility-first CSS framework |
| styled-components | Component-scoped CSS-in-JS |
| @emotion/react & @emotion/styled | CSS-in-JS for upkit components |
| upkit | UI component library (SideNav, LayoutSidebar, etc.) |
| react-hook-form | Form state & validation handling |
| formik | Form state management |
| yup | Validation schema |
| recharts | Chart library (dashboard revenue & orders) |
| react-data-table-component | Admin data tables with pagination |
| react-spinners | Loading indicators |
| pusher-js | Pusher client — subscribe to real-time events from Pusher |

---

## Getting Started

### Backend

```bash
cd foodstore-server
npm install
# Create .env file (see configuration below)
npm start
```

Server runs at `http://localhost:3000`

### Frontend

```bash
cd foodstore-web
npm install
# Create .env file (see configuration below)
npm start
```

Frontend runs at `http://localhost:3001`

---

## Environment Variables

### `foodstore-server/.env`

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

### `foodstore-web/.env`

```
REACT_APP_API_HOST=http://localhost:3000
REACT_APP_SITE_TITLE=FoodStore
REACT_APP_GLOBAL_ONGKIR=20000
REACT_APP_OWNER=YourName
REACT_APP_CONTACT=your@email.com
REACT_APP_BILLING_NO=1234567890
REACT_APP_BILLING_BANK=BCA
```

---

## Entity Diagram

![image](https://user-images.githubusercontent.com/37723902/120694299-3bc7e900-c4d4-11eb-8d92-cb9344f272c2.png)

---

## API Endpoints

Base URL: `http://localhost:3000`

> Auth endpoints are under `/auth`. All other endpoints are prefixed with `/api`.

---

### Auth

#### `POST /auth/register`
**Body (form-data)**
```json
{ "full_name": "string", "email": "string", "password": "string" }
```
**Response**
```json
{ "message": "Register success" }
```

#### `POST /auth/login`
**Body (form-data)**
```json
{ "email": "string", "password": "string" }
```
**Response**
```json
{ "user": { "_id": "", "full_name": "", "role": "user" }, "token": "<jwt>" }
```

#### `GET /auth/me`
Requires `Authorization: Bearer <token>`. Returns current logged-in user.

#### `POST /auth/logout`
Requires `Authorization: Bearer <token>`.

---

### Product

#### `GET /api/products`
**Query params:** `limit`, `skip`, `q` (keyword), `category`, `tags[]`

**Response**
```json
{ "data": [ { "_id": "", "name": "", "price": 0, "image_url": "", "stock": 0 } ], "count": 0 }
```

#### `POST /api/products` — Admin only
**Body (form-data):** `name`, `description`, `price`, `category`, `tags[]`, `image` (file)

**Response:** created product object

#### `PUT /api/products/:id` — Admin only
Same fields as POST, all optional. Old image auto-deleted from Cloudinary on update.

#### `DELETE /api/products/:id` — Admin only
**Response**
```json
{ "message": "Product deleted" }
```

---

### Category

#### `GET /api/categories`
**Response**
```json
{ "data": [ { "_id": "", "name": "" } ], "count": 0 }
```

#### `POST /api/categories`
**Body:** `{ "name": "string" }`

#### `PUT /api/categories/:id`
**Body:** `{ "name": "string" }`

#### `DELETE /api/categories/:id`

---

### Tag

#### `GET /api/tags`
#### `POST /api/tags` — **Body:** `{ "name": "string" }`
#### `PUT /api/tags/:id` — **Body:** `{ "name": "string" }`
#### `DELETE /api/tags/:id`

---

### Delivery Address — Login required

#### `GET /api/delivery-addresses`
**Response**
```json
[ { "_id": "", "nama": "", "provinsi": "", "kabupaten": "", "kecamatan": "", "kelurahan": "", "detail": "" } ]
```

#### `POST /api/delivery-addresses`
**Body**
```json
{ "nama": "string", "provinsi": "string", "kabupaten": "string", "kecamatan": "string", "kelurahan": "string", "detail": "string" }
```

#### `PUT /api/delivery-addresses/:id` — Owner only
#### `DELETE /api/delivery-addresses/:id` — Owner only

---

### Cart — Login required

#### `GET /api/carts`
**Response**
```json
{ "items": [ { "_id": "", "product": {}, "qty": 1 } ] }
```

#### `PUT /api/carts`
**Body**
```json
{ "items": [ { "_id": "<product_id>", "qty": 2 } ] }
```

---

### Order — Login required

#### `GET /api/orders`
**Query params:** `limit`, `skip`

**Response**
```json
{ "data": [ { "_id": "", "status": "processing", "delivery_fee": 20000, "createdAt": "" } ], "count": 0 }
```

#### `POST /api/orders`
Creates order from current cart. Decrements product stock automatically. Sends order confirmation email.

**Body**
```json
{ "delivery_fee": 20000, "delivery_address": "<address_id>" }
```
**Response:** created order object

#### `PUT /api/orders/:id/status` — Admin only
**Body**
```json
{ "status": "processing | in_delivery | delivered" }
```
**Response:** updated order object

---

### Invoice — Login required (owner only)

#### `GET /api/invoices/:order_id`
**Response**
```json
{ "_id": "", "order": "", "amount": 0, "payment_status": "waiting_payment", "items": [] }
```

---

### Payment (Midtrans)

#### `GET /api/payments/token/:order_id` — Login required
Get Snap token to open Midtrans payment popup.

**Response**
```json
{ "token": "<snap_token>" }
```

#### `GET /api/payments/verify/:order_id` — Login required
Force-sync payment status from Midtrans API to database. Call this after payment popup closes.

**Response**
```json
{ "payment_status": "settlement | pending | deny | cancel | expire" }
```

#### `POST /api/payments/notification`
Midtrans webhook — called automatically by Midtrans server after payment event.

**Body (sent by Midtrans)**
```json
{ "order_id": "", "transaction_status": "settlement", "fraud_status": "accept" }
```

---

### Review

#### `POST /api/reviews` — Login required
**Body**
```json
{ "product_id": "", "order_id": "", "rating": 5, "comment": "string" }
```

#### `GET /api/reviews`
**Query params:** `product_id`, `order_id`

**Response**
```json
[ { "_id": "", "user": {}, "rating": 5, "comment": "", "createdAt": "" } ]
```

---

### Wishlist — Login required

#### `GET /api/wishlists`
**Response**
```json
[ { "_id": "", "product": { "_id": "", "name": "", "price": 0, "image_url": "" } } ]
```

#### `POST /api/wishlists`
**Body**
```json
{ "product_id": "<product_id>" }
```

#### `DELETE /api/wishlists/:product_id`

---

### Dashboard — Admin only

#### `GET /api/dashboard/summary`
**Response**
```json
{ "total_revenue": 0, "total_orders": 0, "total_products": 0, "total_users": 0 }
```

#### `GET /api/dashboard/revenue`
Revenue and orders per day, last 30 days.

**Response**
```json
[ { "date": "2024-01-01", "revenue": 150000, "orders": 3 } ]
```

#### `GET /api/dashboard/top-products`
Top 5 best-selling products.

**Response**
```json
[ { "product": { "name": "", "image_url": "" }, "total_qty": 20, "total_revenue": 300000 } ]
```

---

### Wilayah (Indonesian Regional Data)

#### `GET /api/wilayah/provinsi`
#### `GET /api/wilayah/kabupaten?provinsi=<name>`
#### `GET /api/wilayah/kecamatan?kabupaten=<name>`
#### `GET /api/wilayah/desa?kecamatan=<name>`
