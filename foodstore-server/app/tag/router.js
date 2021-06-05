// (1) import router dari Express
const router = require('express').Router();
const multer = require('multer');
const tagController = require('./controller');

// (4) buat route baru 
router.post('/tags', multer().none(), tagController.store);

// (5) export router agar bisa digunakan di `app.js`
module.exports = router;