// (1) import package yang diperlukan 
const router = require('express').Router();
const multer = require('multer');
// (2) import auth/controller.js
const controller = require('./contoller');
// (3) buat endpoint untuk register user baru
router.post('/register', multer().none(), controller.register);
// (4) export router
module.exports = router;