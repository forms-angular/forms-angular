'use strict';

var path = require('path');

var rootPath = path.normalize(__dirname + '/../../..');

module.exports = {
  root: rootPath,
  ip: '0.0.0.0',
  port: process.env.PORT || 9000,
  mongo: {
    options:{
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    }
  }
};
