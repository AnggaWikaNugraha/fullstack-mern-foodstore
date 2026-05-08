# Fullstack MERN Foodstore

Aplikasi e-commerce makanan berbasis MERN Stack (MongoDB, Express, React, Node.js). Pengguna dapat menelusuri produk makanan, menambahkan ke keranjang, checkout, dan melihat riwayat pesanan. Admin dapat mengelola produk dan kategori.

## Screenshots

- ![image](https://user-images.githubusercontent.com/37723902/145701345-54409fea-60f8-4768-b5f9-452e4487cb3e.png)
- ![image](https://user-images.githubusercontent.com/37723902/145702477-7d975a9b-21a0-4487-86b2-51e4db4b4c9d.png)
- ![image](https://user-images.githubusercontent.com/37723902/145702486-b1c042ba-7d2b-46f6-87fc-d47a2aaa9cd3.png)
- ![image](https://user-images.githubusercontent.com/37723902/145702559-ee976aca-06f5-49ee-a888-9c546f7afb81.png)

---

## Struktur Proyek

```
fullstack-mern-foodstore/
├── foodstore-server/          # Backend (Node.js + Express)
│   ├── app/
│   │   ├── auth/              # Autentikasi (register, login, logout, me)
│   │   ├── cart/              # Keranjang belanja
│   │   ├── cart-item/         # Model item keranjang
│   │   ├── category/          # Kategori produk
│   │   ├── delivery-address/  # Alamat pengiriman
│   │   ├── invoice/           # Invoice/nota pesanan
│   │   ├── order/             # Pesanan
│   │   ├── order-item/        # Item pesanan
│   │   ├── policy/            # Role-based access control (CASL)
│   │   ├── product/           # Produk makanan
│   │   ├── tag/               # Tag produk
│   │   ├── user/              # Model user
│   │   ├── wilayah/           # Data wilayah Indonesia (provinsi, kab, kec, desa)
│   │   ├── config.js
│   │   └── utils/
│   ├── database/              # Koneksi MongoDB
│   ├── public/upload/         # Penyimpanan gambar produk
│   └── app.js
└── foodstore-web/             # Frontend (React)
    ├── src/
    │   ├── api/               # Layer pemanggil API backend
    │   ├── app/               # Redux store & listener
    │   ├── component/         # Komponen reusable (Topbar, Cart, OnlyLogin, dll)
    │   ├── features/          # Redux slices (Auth, Cart, products, categories)
    │   ├── hooks/             # Custom hooks
    │   ├── pages/             # Halaman-halaman aplikasi
    │   └── utils/             # Fungsi utilitas
    └── public/
```

---

# Server side
- NodeJs
- passport-local
- passport
- mongoose
- mongodb Database
- jsonwebtoken , JWT aunthentication dan otoritation
- express framework 
- cors
- cookie-parser
- bcrypt
- multer untuk membaca type form data dari client
- @casl/ability untuk role-based access control
- csvtojson untuk membaca data wilayah dari file CSV
- mongoose-sequence untuk auto-increment customer_id
- dotenv untuk konfigurasi environment variable

## Entitas 
![image](https://user-images.githubusercontent.com/37723902/120694299-3bc7e900-c4d4-11eb-8d92-cb9344f272c2.png)

## Role & Permission (CASL)

| Role  | Akses                                                                                   |
|-------|-----------------------------------------------------------------------------------------|
| guest | Read product                                                                            |
| user  | CRUD delivery address milik sendiri, update cart, create & view order, read invoice    |
| admin | Manage semua resource (full access)                                                     |

---

## Cara Menjalankan

### Backend (foodstore-server)

```bash
cd foodstore-server
npm install
# Buat file .env (lihat konfigurasi di bawah)
npm start
```

Server berjalan di `http://localhost:3000`

### Frontend (foodstore-web)

```bash
cd foodstore-web
npm install
# Buat file .env (lihat konfigurasi di bawah)
npm start
```

Frontend berjalan di `http://localhost:3001` (atau port berikutnya yang tersedia)

---

# API Spec

Base URL: `http://localhost:3000`

> Endpoint auth berada di `/auth`, sedangkan semua endpoint lainnya berada di bawah prefix `/api`

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

## Me (profil user yang sedang login)
- Method : GET
- Endpoint : `/auth/me`
- Header : `Authorization: Bearer <token>`

## Logout
- Method : POST
- Endpoint : `/auth/logout`
- Header : `Authorization: Bearer <token>`

---

# Product.
## Get Product:
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

## DELETE Product:
Request :
- Method : DELETE
- Endpoint : `/api/products/:id`
- Auth : Admin only

---
  
# Category
## Get Category:
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
## Get TAG:
Request :
- Method : GET
- Endpoint : `/api/tags/`
## create TAG:
Request :
- Method : POST
- Endpoint : `/api/tags/`
## edit TAG:
Request :
- Method : PUT
- Endpoint : `/api/tags/:id`
## Delete TAG:
Request :
- Method : DELETE
- Endpoint : `/api/tags/:id`  

---

# DeliveryAddress
## Get DeliveryAddress:
Request :
- Method : GET
- Endpoint : `/api/delivery-addresses/`
- Auth : Login required
## Create DeliveryAddress:
Request :
- Method : POST
- Endpoint : `/api/delivery-addresses/`
- Auth : Login required
- Body : `nama`, `provinsi`, `kabupaten`, `kecamatan`, `kelurahan`, `detail`
## EDIT DeliveryAddress:
Request :
- Method : PUT
- Endpoint : `/api/delivery-addresses/:id`
- Auth : Login required (hanya milik user sendiri)
## DELETE DeliveryAddress:
Request :
- Method : DELETE
- Endpoint : `/api/delivery-addresses/:id` 
- Auth : Login required (hanya milik user sendiri)

---

# Order
## Get orders:
Request :
- Method : GET
- Endpoint : `/api/orders/`
- Auth : Login required
## Post orders:
Request :
- Method : POST
- Endpoint : `/api/orders/` 
- Auth : Login required
- Body : `delivery_fee`, `delivery_address` (ID alamat)

---

# Cart
## Get CartItem:
Request :
- Method : GET
- Endpoint : `/api/carts/`
- Auth : Login required
## Update CartItem:
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
- Auth : Login required (hanya milik user sendiri)

---

# Wilayah (Data Wilayah Indonesia)
## Get Provinsi:
Request :
- Method : GET
- Endpoint : `/api/wilayah/provinsi`
## Get Kabupaten:
Request :
- Method : GET
- Endpoint : `/api/wilayah/kabupaten`
- Query params : `provinsi`
## Get Kecamatan:
Request :
- Method : GET
- Endpoint : `/api/wilayah/kecamatan`
- Query params : `kabupaten`
## Get Desa/Kelurahan:
Request :
- Method : GET
- Endpoint : `/api/wilayah/desa`
- Query params : `kecamatan`

---

# Client Side using react
 ## Stacks 
 - ReactJs dari client side
 - React Redux + redux-thunk middleware
 - Context API
 - TailwindCSS sebagai CSS framework
 - react-router-dom untuk routing
 - react-hook-form untuk form dan validasi input
 - axios untuk fetching API
 - Styled component dan composition
 - upkit sebagai UI component library
 - yup untuk skema validasi
 - formik untuk manajemen state form
 - react-spinners untuk loading indicator
 - react-data-table-component untuk tabel data admin
 - @emotion/react & @emotion/styled untuk styling

## Halaman (Pages)

| Path                        | Halaman                    | Akses        |
|-----------------------------|----------------------------|--------------|
| `/`                         | Home (daftar produk)       | Semua        |
| `/login`                    | Login                      | Guest only   |
| `/register`                 | Daftar akun baru           | Guest only   |
| `/register/berhasil`        | Registrasi berhasil        | Guest only   |
| `/logout`                   | Logout                     | Login only   |
| `/alamat-pengiriman/`       | Daftar alamat pengiriman   | Login only   |
| `/alamat-pengiriman/tambah` | Tambah alamat pengiriman   | Login only   |
| `/checkout`                 | Halaman checkout           | Login only   |
| `/invoice/:order_id`        | Detail invoice             | Login only   |
| `/admin/product`            | Kelola produk (admin)      | Admin only   |
| `/admin/categories`         | Kelola kategori (admin)    | Admin only   |
| `/error`                    | Halaman 404                | Semua        |

## Fitur
- Fitur-fitur utama yang akan kita bangun antara lain:
- Daftar makanan
- Pencarian makanan berdasarkan keyword
- Filter makanan berdasarkan kategori
- Filter makanan berdasarkan tags
- Login & register user
- Keranjang belanja (cart)
- Checkout
- Riwayat pemesanan
- Kelola daftar alamat pengiriman
- Halaman admin untuk kelola produk dan kategori
- Data wilayah Indonesia (provinsi, kabupaten, kecamatan, kelurahan)

---

## Konfigurasi Environment Variables

##### add .env foodstore-server

```
PORT = 3000
SERVICE_NAME=foodstore-service
DB_HOST=localhost
DB_PORT=27017

# SESUAIKAN dengan username mongo di mesinmu
DB_USER=

# SESUAIKAN dengan password user di mesinmu
DB_PASS=

# SESUAIKAN dengan nama database yang sudah kamu buat
DB_NAME=foodstore 

SECRET_KEY=
```

##### add .env foodstore-web

```
REACT_APP_API_HOST=http://localhost:3000
```
