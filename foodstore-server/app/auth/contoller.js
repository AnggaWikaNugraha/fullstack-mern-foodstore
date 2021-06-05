const User = require('../user/model');

async function register(req, res, next) {
    try {
        // (1) tangkap payload dari request 
        const payload = req.body;

        // (2) buat objek user baru 
        let user = new User(payload);

        // (3) simpan user baru ke MongoDB 
        await user.save();

        // (4) berikan response ke client 
        return res.json(user);

    } catch (err) {
        // (1) cek kemungkinan kesalahan terkait validasi
        if (err && err.name === 'ValidationError') {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            });
        }
        // (2) error lainnya 
        next(err);
    }
}

module.exports = {
    register
}
