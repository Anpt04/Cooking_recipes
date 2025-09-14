'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const sequelize = require('../config/db'); // import từ file mới
const db = {};

// Load all models
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1 &&
      file !== 'associates.js'
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Import và chạy associations
require('./associates')(db);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;