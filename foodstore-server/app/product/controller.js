// (1) import model `Product`
const Product = require('./model');
const config = require('../config');

const fs = require('fs');
const path = require('path');

async function store(req, res, next) {
    try {

        let payload = req.body;

        if (req.file) {
            // ambil file gambarnya
            let tmp_path = req.file.path;
            // ambil type gambarnya jgp, png, jpeg dll
            let originalExt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];
            // bikin file dengan generat name dari multer 
            let filename = req.file.filename + '.' + originalExt;

            let target_path = path.resolve(config.rootPath, `public/upload/${filename}`);

            // (1) baca file yang masih di lokasi sementara 
            const src = fs.createReadStream(tmp_path);

            // (2) pindahkan file ke lokasi permanen
            const dest = fs.createWriteStream(target_path);

            // (3) mulai pindahkan file dari `src` ke `dest`
            src.pipe(dest);

            src.on('end', async () => {

                try {

                    let product = new Product({ ...payload, image_url: filename })

                    await product.save()

                    return res.json(product);

                } catch (err) {

                    // (1) jika error, hapus file yang sudah terupload pada direktori
                    fs.unlinkSync(target_path);

                    // (2) cek apakah error disebabkan validasi MongoDB
                    if (err && err.name === 'ValidationError') {
                        return res.json({
                            error: 1,
                            message: err.message,
                            fields: err.errors
                        })
                    }

                    next(err);

                }
            });

            src.on('error', async () => {

                next(err);

            });

        } else {

            let product = new Product(payload);

            await product.save();

            return res.json(product);
        }
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