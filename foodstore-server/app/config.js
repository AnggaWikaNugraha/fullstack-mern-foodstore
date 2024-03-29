const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    rootPath: path.resolve(__dirname, '..'),
    serviceName: process.env.SERVICE_NAME,
    secretKey: process.env.SECRET_KEY, // <---
    //----- konfigurasi database ----//
    dbHost: process.env.DB_HOST,
    dbUser: process.env.DB_USER,
    dbPort: process.env_DB_PORT,
    dbPass: process.env.DB_PASS,
    dbName: process.env.DB_NAME,
}