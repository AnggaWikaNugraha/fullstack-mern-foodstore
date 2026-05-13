// file app/product/router.js 

// (1) import router dari express
const router = require('express').Router();
const multer = require('multer');

const productController = require('./controller');

// Simpan file di memory (buffer), bukan di disk — langsung dikirim ke Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

router.get('/products', productController.index);
router.post('/products', upload.single('image'), productController.store);
router.put('/products/:id', upload.single('image'), productController.update);
router.delete('/products/:id', productController.destroy);

// (4) export router 
module.exports = router;