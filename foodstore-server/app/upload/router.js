const router = require('express').Router();
const multer = require('multer');
const { uploadToCloudinary } = require('../utils/cloudinary');

const upload = multer({
    limits: { fileSize: 5 * 1024 * 1024 }, // maks 5MB
    fileFilter(req, file, cb) {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Hanya file gambar yang diizinkan'));
        }
        cb(null, true);
    },
});

router.post('/upload', upload.single('image'), async (req, res, next) => {
    try {
        if (!req.user) return res.json({ error: 1, message: 'Unauthorized' });
        if (!req.file) return res.json({ error: 1, message: 'File gambar harus disertakan' });

        const result = await uploadToCloudinary(req.file.buffer, 'foodstore/uploads');

        return res.json({
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
        });
    } catch (err) {
        if (err.message === 'Hanya file gambar yang diizinkan') {
            return res.json({ error: 1, message: err.message });
        }
        next(err);
    }
});

module.exports = router;
