var express = require('express');
var path = require('path');
var fs = require('fs');
var FormsAngular;
try {
    FormsAngular = require('forms-angular');
}
catch (e) {
    FormsAngular = require('./../src/server/data_form');
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
// Setup Express
var app = express();
require('./lib/config/express')(app);
var fngHandler = new FormsAngular.FormsAngular(mongoose, app, {
    urlPrefix: '/api/',
    plugins: {
        JQMongoFileUploader: { plugin: fngJqUpload.Controller, options: {} },
        fngAudit: { plugin: fngAudit.controller, options: {} }
    }
});
// Bootstrap forms-angular controlled models
var modelsPath = path.join(__dirname, 'app/models');
fs.readdirSync(modelsPath).forEach(function (file) {
    var fname = modelsPath + '/' + file;
    if ((app.get('env') === 'test' || file.slice(0, 4) !== 'test') && fs.statSync(fname).isFile() && fname.match(/.js$/)) {
        var fngModelInfo = require(fname);
        fngHandler.newResource(fngModelInfo.model, fngModelInfo.options);
    }
});
// If we are starting the server to run e2e tests then add a little data
if (app.get('env') === 'test') {
    var exec_1 = require('child_process').exec;
    var dataPath_1 = path.join(__dirname, 'test/e2e/e2edata');
    var dataFiles = fs.readdirSync(dataPath_1);
    var mongoHost_1 = config.mongo.uri.match(/mongodb:\/\/(.*\d)/)[1];
    dataFiles.forEach(function (file) {
        var fname = dataPath_1 + '/' + file;
        if (fs.statSync(fname).isFile()) {
            console.log('mongoimport --host ' + mongoHost_1 + ' --db fng-test --drop --collection ' + file.slice(0, -5) + 's --jsonArray < ' + fname);
            exec_1('mongoimport --host ' + mongoHost_1 + ' --db fng-test --drop --collection ' + file.slice(0, -5) + 's --jsonArray < ' + fname, function (error, stdout, stderr) {
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
//# sourceMappingURL=server.js.map