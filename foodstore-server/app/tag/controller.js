const Tag = require('./model');

async function store(req, res, next) {
    try {
        // (1) dapatkan data dari request yang dikirimkan client
        let payload = req.body;

        // (2) buat objek Tag baru berdasarkan payload
        let tag = new Tag(payload)

        // (3) simpan tag ke MongoDB
        await tag.save();

        // (4) respon ke client dengan data tag yang baru saja disimpan
        return res.json(tag);

    } catch (err) {
        // (5) tangani kemungkinan error validasi dan error lainnya
        if (err && err.name === 'ValidationError') {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            });
        }
        next(err);
    }
}

module.exports = {
    store
}