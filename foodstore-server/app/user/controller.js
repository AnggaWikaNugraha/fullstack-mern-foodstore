const bcrypt = require('bcrypt');
const User = require('./model');

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

module.exports = { setPassword };
