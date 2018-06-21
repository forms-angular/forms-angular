'use strict';

var express = require('express');
var path = require('path');
var fs = require('fs');
var formsAngular;
try {
  formsAngular = require('forms-angular');
} catch (e) {
  formsAngular = require('./../src/server/data_form');
}
var fngAudit = require('fng-audit');
var fngJqUpload = require('fng-jq-upload');
var mongoose = require('mongoose');

/**
 * Main application file
 */

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = require('./lib/config/config');
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.Promise = global.Promise;

mongoose.set('debug',true);

// Setup Express
var app = express();
require('./lib/config/express')(app);

var fngHandler = new (formsAngular)(mongoose, app, {
  urlPrefix: '/api/',
  plugins: {
    JQMongoFileUploader:  {plugin: fngJqUpload.Controller, options: { } },
    fngAudit:             {plugin: fngAudit.controller, options:{ }}
  }
});

// Bootstrap forms-angular controlled models
var modelsPath = path.join(__dirname, 'app/models');

fs.readdirSync(modelsPath).forEach(function (file) {
  var fname = modelsPath + '/' + file;
  if ((app.get('env') === 'test' || file.slice(0,4) !== 'test') && fs.statSync(fname).isFile()) {
    var fngModelInfo = require(fname);
    fngHandler.newResource(fngModelInfo.model, fngModelInfo.options);
  }
});

// If we are starting the server to run e2e tests then add a little data
if (app.get('env') === 'test') {
  var exec = require('child_process').exec;
  var dataPath = path.join(__dirname, 'test/e2e/e2edata');
  var dataFiles = fs.readdirSync(dataPath);
  var mongoHost = config.mongo.uri.match(/mongodb:\/\/(.*\d)/)[1];

  dataFiles.forEach(function (file) {
    var fname = dataPath + '/' + file;
    if (fs.statSync(fname).isFile()) {
      console.log('mongoimport --host ' + mongoHost + ' --db fng-test --drop --collection ' + file.slice(0, -3) + 's --jsonArray < ' + fname);
      exec('mongoimport --host ' + mongoHost + ' --db fng-test --drop --collection ' + file.slice(0, -3) + 's --jsonArray < ' + fname,
        function (error, stdout, stderr) {
        if (error !== null) {
          console.log('Error importing models : ' + error + ' (Code = ' + error.code + '    ' + error.signal + ') : ' + stderr + ' : ' + stdout);
        }
      });
    }
  });
}

// Start server
app.listen(config.port, config.ip, function () {
  console.log('Express server listening on %s:%d, in %s mode', config.ip, config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;
