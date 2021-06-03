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
