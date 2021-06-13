// hp
// const mongoose = require('mongoose');
// const { dbHost, dbName, dbPort, dbUser, dbPass } = require('../app/config');
// mongoose.connect(`mongodb://${dbHost}:${dbPort}/${dbName}`,
//     {
//         useNewUrlParser: true, useUnifiedTopology: true,
//         useFindAndModify: false
//     });
// const db = mongoose.connection;
// module.exports = db;

// rog
const mongoose = require("mongoose");
const { dbHost, dbName, dbPort, dbUser, dbPass } = require("../app/config");
mongoose.connect(`mongodb://${dbHost}:${dbPort}/${dbName}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
const db = mongoose.connection;
module.exports = db;
