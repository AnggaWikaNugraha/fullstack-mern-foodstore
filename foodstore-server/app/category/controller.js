const Category = require('./model');

async function store(req, res, next) {
    try {
        // (1) tangkap payload dari _client request_ 
        let payload = req.body;

        // (2) buat category baru dengan model Category;

        let category = new Category(payload);

        // (3) simpan category baru tadi ke MongoDB
        await category.save();

        // (4) respon ke client dengan data category yang baru dibuat.
        return res.json(category);

    } catch (err) {
        // ----- cek tipe error ---- //
        if (err && err.name === 'ValidationError') {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            });
        }
        // (2) tangkap jika terjadi kesalahan kemudian gunakan method `next` agar Express memproses error tersebut
        next(err);
    }
}

async function update(req, res, next) {
    try {
        // (1) tangkap payload dari _client request_ 
        let payload = req.body;

        let category =
            await Category.findOneAndUpdate({ _id: req.params.id }, payload, {
                new:
                    true, runValidators: true
            });


        // (4) respon ke client dengan data category yang baru dibuat.
        return res.json(category);

    } catch (err) {
        // ----- cek tipe error ---- //
        if (err && err.name === 'ValidationError') {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            });
        }
        // (2) tangkap jika terjadi kesalahan kemudian gunakan method `next` agar Express memproses error tersebut
        next(err);
    }
}

async function destroy(req, res, next) {
    try {

        // (1) cari dan hapus categori di MongoDB berdasarkan field _id
        let deleted = await Category.findOneAndDelete({
            _id:
                req.params.id
        });

        // (2) respon ke client dengan data category yang baru saja dihapus
        return res.json(deleted);

    } catch (err) {
        // (3) handle kemungkinan error
        next(err);
    }
}


module.exports = {
    store,
    update, // <--
    destroy
}