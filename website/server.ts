const express = require('express');
const path = require('path');
const fs = require('fs');
let FormsAngular;
try {
  FormsAngular = require('forms-angular');
} catch (e) {
  FormsAngular = require('./../src/server/data_form');
}
const fngAudit = require('fng-audit');
const fngJqUpload = require('fng-jq-upload');
const mongoose = require('mongoose');

/**
 * Main application file
 */

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const config = require('./lib/config/config');
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.Promise = global.Promise;

// Setup Express
const app = express();
require('./lib/config/express')(app);

const fngHandler = new FormsAngular.FormsAngular(mongoose, app, {
  urlPrefix: '/api/',
  plugins: {
    JQMongoFileUploader:  {plugin: fngJqUpload.controller, options: { } },
    fngAudit:             {plugin: fngAudit.controller, options:{ }}
  }
});

// Bootstrap forms-angular controlled models
const modelsPath = path.join(__dirname, 'app/models');

fs.readdirSync(modelsPath).forEach(function (file) {
  const fname = modelsPath + '/' + file;
  if ((app.get('env') === 'test' || file.slice(0,4) !== 'test') && fs.statSync(fname).isFile() && fname.match(/.js$/)) {
    const fngModelInfo = require(fname);
    fngHandler.newResource(fngModelInfo.model, fngModelInfo.options);
  }
});

// If we are starting the server to run e2e tests then add a little data
if (app.get('env') === 'test') {
  const exec = require('child_process').exec;
  const dataPath = path.join(__dirname, 'test/e2e/e2edata');
  const dataFiles = fs.readdirSync(dataPath);
  const mongoHost = config.mongo.uri.match(/mongodb:\/\/(.*\d)/)[1];

  dataFiles.forEach(function (file) {
    const fname = dataPath + '/' + file;
    if (fs.statSync(fname).isFile()) {
      console.log('mongoimport --host ' + mongoHost + ' --db fng-test --drop --collection ' + file.slice(0, -5) + 's --jsonArray < ' + fname);
      exec('mongoimport --host ' + mongoHost + ' --db fng-test --drop --collection ' + file.slice(0, -5) + 's --jsonArray < ' + fname,
        function (error, stdout, stderr) {
        if (error !== null) {
          console.log('Error importing models : ' + error + ' (Code = ' + error.code + '    ' + error.signal + ') : ' + stderr + ' : ' + stdout);
        }
      });
    }
  });
}

// mongoose.set('debug', true);

// Start server
app.listen(config.port, config.ip, function () {
  console.log('Express server listening on %s:%d, in %s mode', config.ip, config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;
