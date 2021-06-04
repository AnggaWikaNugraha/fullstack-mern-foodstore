// (1) import model `Product`
const Product = require('./model');

async function store(req, res, next) {
    try {

        // (1) bungkus operasi sebelumnya di dalam try 
        let payload = req.body;

        let product = new Product(payload);

        await product.save();

        return res.json(product);
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

module.exports = {
    store
}