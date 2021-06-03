// (1) import package mongoose
const mongoose = require('mongoose');
// (2) kita import konfigurasi terkait MongoDB dari `app/config.js`
const { dbHost, dbName, dbPort, dbUser, dbPass } = require('../app/config');
// (3) connect ke MongoDB menggunakan konfigurasi yang telah kitaimport 
mongoose.connect(`mongodb://${dbHost}:${dbPort}/${dbName}`,
    {
        useNewUrlParser: true, useUnifiedTopology: true,
        useFindAndModify: false
    });
// (4) simpan koneksi dalam constant `db`
const db = mongoose.connection;
// (5) export `db` supaya bisa digunakan oleh file lain yang membutuhkan
module.exports = db;