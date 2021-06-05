// (1) import `router` dan `multer`
const router = require('express').Router();
const multer = require('multer');
// (2) import `addressController`
const addressController = require('./controller');

// (3) definisikan _route_ untuk _endpoint_ `create` alamat pengiriman
router.post('/delivery-addresses', multer().none(), addressController.store);

// (4) export `router`
module.exports = router;
