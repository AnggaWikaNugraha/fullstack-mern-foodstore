const router = require('express').Router();
const multer = require('multer');
const controller = require('./controller');

const upload = multer({
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter(req, file, cb) {
        if (!file.mimetype.startsWith('image/')) return cb(new Error('Hanya file gambar yang diizinkan'));
        cb(null, true);
    },
});

router.put('/users/set-password', controller.setPassword);
router.put('/users/avatar', upload.single('image'), controller.updateAvatar);
router.put('/users/mobile/fcm-token', multer().none(), controller.updateFcmToken);

module.exports = router;
