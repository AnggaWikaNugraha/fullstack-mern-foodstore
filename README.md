![image](https://user-images.githubusercontent.com/37723902/145701345-54409fea-60f8-4768-b5f9-452e4487cb3e.png)
![image](https://user-images.githubusercontent.com/37723902/145702477-7d975a9b-21a0-4487-86b2-51e4db4b4c9d.png)
![image](https://user-images.githubusercontent.com/37723902/145702486-b1c042ba-7d2b-46f6-87fc-d47a2aaa9cd3.png)

# Server side
- NodeJs
- passport-local
- passport
- mongoose
- mongodb Database
- jsonwebtoken , JWT aunthentication and otoritation
- express framework 
- cors
- cookie-parser
- bcrypt
- multer untuk membaca type form data dari client

## entitas 
![image](https://user-images.githubusercontent.com/37723902/120694299-3bc7e900-c4d4-11eb-8d92-cb9344f272c2.png)


# API Spect :
# Product.
## Get Product:
Request :
- Method : GET
- Endpoint : `/products/`
## Create Product:
Request :
- Method : POST
- Endpoint : `/products/`
## Edit Product:
Request :
- Method : PUT
- Endpoint : `/products/:id`
## DELETE Product:
Request :
- Method : POST
- Endpoint : `/products/:id`

  
# Category
## Get Category:
Request :
- Method : GET
- Endpoint : `/categories/` 
## Create Category:
Request :
- Method : POST
- Endpoint : `/categories/` 
## Edit Category:
Request :
- Method : PUT
- Endpoint : `/categories/:id` 
## Delete Category:
Request :
- Method : DELETE
- Endpoint : `/categories/:id` 

# Tag
## Get TAG:
Request :
- Method : GET
- Endpoint : `/tags/`
## create TAG:
Request :
- Method : POST
- Endpoint : `/tags/`
## edit TAG:
Request :
- Method : PUT
- Endpoint : `/tags/:id`
## Delete TAG:
Request :
- Method : DELETE
- Endpoint : `/tags/:id`  
  
# DeliveryAddress
## Get DeliveryAddress:
Request :
- Method : GET
- Endpoint : `/delivery-addresses/`
## Create DeliveryAddress:
Request :
- Method : POST
- Endpoint : `/delivery-addresses/`
## EDIT DeliveryAddress:
Request :
- Method : PUT
- Endpoint : `/delivery-addresses/:id`
## DELETE DeliveryAddress:
Request :
- Method : DELETE
- Endpoint : `/delivery-addresses/:id` 
  
# Order
## Get orders:
Request :
- Method : GET
- Endpoint : `/orders/`
## Post orders:
Request :
- Method : POST
- Endpoint : `/orders/` 

# CartItem
## Get CartItem:
Request :
- Method : GET
- Endpoint : `/carts/`
## Edit CartItem:
Request :
- Method : GET
- Endpoint : `/orders/:id` 

# Client Side using react
 ## stacks 
 - ReactJs from client side
 - React Redux
 - Context Api
 - tailwindcss from css framework
 - redux-thunk middleware
 - react-router-dom router
 - react-hook-form input users
 - axios fetching api
 - Styled component and composition 
 
### Fitur
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

##### add .env foodstore-server

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
