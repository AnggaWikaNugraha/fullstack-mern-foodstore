// file app/product/router.js 

// (1) import router dari express
const router = require('express').Router();
const multer = require('multer');
const os = require('os');

// (2) import product controller 
const productController = require('./controller');

router.get('/products', productController.index);
// (3) pasangkan route endpoint dengan method `store`
// agar bisa menerima file upload dengan nama image
router.post('/products', multer({ dest: os.tmpdir() }).single('image'), productController.store);

// (4) export router 
module.exports = router;