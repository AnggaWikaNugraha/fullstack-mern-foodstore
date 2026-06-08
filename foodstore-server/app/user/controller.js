const bcrypt = require('bcrypt');
const User = require('./model');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

const HASH_ROUND = 10;

async function setPassword(req, res, next) {
    try {
        const { password, password_confirmation } = req.body;

        if (!password || !password_confirmation) {
            return res.json({ error: 1, message: 'Password dan konfirmasi password harus diisi' });
        }

        if (password !== password_confirmation) {
            return res.json({ error: 1, message: 'Password dan konfirmasi password tidak sama' });
        }

        if (password.length < 6) {
            return res.json({ error: 1, message: 'Password minimal 6 karakter' });
        }

        const hashed = bcrypt.hashSync(password, HASH_ROUND);

        await User.findByIdAndUpdate(req.user._id, { password: hashed });

        return res.json({ message: 'Password berhasil disimpan' });
    } catch (err) {
        next(err);
    }
}

async function updateAvatar(req, res, next) {
    try {
        if (!req.user) return res.json({ error: 1, message: 'Unauthorized' });
        if (!req.file) return res.json({ error: 1, message: 'File gambar harus disertakan' });

        const user = await User.findById(req.user._id);

        // hapus foto lama dari Cloudinary kalau ada
        if (user.image_url) await deleteFromCloudinary(user.image_url);

        const result = await uploadToCloudinary(req.file.buffer, 'foodstore/avatars');

        await User.findByIdAndUpdate(req.user._id, { image_url: result.secure_url });

        return res.json({ message: 'Foto profil berhasil diupdate', image_url: result.secure_url });
    } catch (err) {
        next(err);
    }
}

module.exports = { setPassword, updateAvatar };
