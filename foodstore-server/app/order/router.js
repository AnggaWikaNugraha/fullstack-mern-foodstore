// (1) import `router` dan `multer`
const router = require('express').Router();
const multer = require('multer');
// (2) import `orderController`
const orderController = require('./controller');
// (3) _route_ untuk membuat `order`
router.post('/orders', multer().none(), orderController.store);
router.get('/orders/stats', orderController.stats);
router.get('/orders/export', orderController.exportAll);
router.get('/orders', orderController.index);
router.get('/orders/:id', orderController.show);
router.put('/orders/:id/status', multer().none(), orderController.updateStatus);

// (4) export `router`
module.exports = router;