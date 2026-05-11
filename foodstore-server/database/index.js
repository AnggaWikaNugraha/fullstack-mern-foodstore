const mongoose = require('mongoose');
const { dbHost, dbName, dbPort } = require('../app/config');

const uri = process.env.MONGODB_URI || `mongodb://${dbHost}:${dbPort}/${dbName}`;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const db = mongoose.connection;

db.once('open', () => console.log('MongoDB connected:', uri.split('@')[1] || uri));

module.exports = db;
