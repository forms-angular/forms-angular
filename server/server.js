/**
 * Module dependencies.
 */

var express = require('express')
  , bodyParser = require('body-parser')
  , errorHandler = require('errorhandler')
  , methodOverride = require('method-override')
  , fs = require('fs')
  , mongoose = require('mongoose')
  , exec = require('child_process').exec
  , https = require('https')
  , grid = require('gridfs-uploader');

var env = process.env.NODE_ENV || 'development';
var app = module.exports = express();

// Configuration
app.use(bodyParser({
  uploadDir: __dirname + '/../app/tmp',
  keepExtensions: true
}));
app.get('*', handleCrawlers);
app.use(methodOverride());
if (app.get('env') === 'production') app.use(express.static(__dirname + '/../dist'));
app.use(express.static(__dirname + '/../app'));

// Copy the schemas to somewhere they can be served
exec('cp ' + __dirname + '/../server/models/* ' + __dirname + '/../app/code/',
  function (error, stdout, stderr) {
    if (error !== null) {
      console.log('Error copying models : ' + error + ' (Code = ' + error.code + '    ' + error.signal + ') : ' + stderr + ' : ' + stdout);
    }
});

if ('production' == env) {
  console.log('Production mode');
  app.use(errorHandler());
  mongoose.connect(process.env['DEMODB']);
} else if('test' == env) {
  app.use(errorHandler({ dumpExceptions: true, showStack: true }));
  mongoose.connect('mongodb://localhost/forms-ng_test');

  var data_path = __dirname + '/../test/e2edata';
  var data_files = fs.readdirSync(data_path);
  data_files.forEach(function (file) {
    var fname = data_path + '/' + file;
    if (fs.statSync(fname).isFile()) {
      exec('mongoimport --db forms-ng_test --drop --collection ' + file.slice(0, 1) + 's --jsonArray < ' + fname,
        function (error, stdout, stderr) {
          if (error !== null) {
            console.log('Error importing models : ' + error + ' (Code = ' + error.code + '    ' + error.signal + ') : ' + stderr + ' : ' + stdout);
          }
        });
    }
  });
} else {
  app.use(errorHandler({ dumpExceptions: true, showStack: true }));
  mongoose.connect('mongodb://localhost/forms-ng_dev');
  var g = new grid(mongoose.mongo);
  g.db = mongoose.connection.db;
/*  g.putUniqueFile(__dirname + '/../bower.json', 'bower.json', null, function (err, result) {
    console.log(result);
  });*/
}

var ensureAuthenticated = function (req, res, next) {
  // Here you can do authentication using things like
  //      req.ip
  //      req.route
  //      req.url
  if (true) {
    return next();
  }
  res.status(401).send('No Authentication Provided');
};

function handleCrawlers(req, res, next) {
  if (req.url.slice(0, 22) === '/?_escaped_fragment_=/') {
    fs.readFile(__dirname + '/seo/' + req.url.slice(22), 'utf8', function (err, data) {
      if (err) {
        res.send(403, 'Not crawlable');
      } else {
        res.send(200, data);
      }
    });
  } else {
    next();
  }
}

//// Bootstrap models
var DataFormHandler = new (require(__dirname + '/lib/data_form.js'))(app, {urlPrefix: '/api/'});
// Or if you want to do some form of authentication...
// var DataFormHandler = new (require(__dirname + '/lib/data_form.js'))(app, {urlPrefix : '/api/', authentication : ensureAuthenticated});

var models_path = __dirname + '/models';
var models_files = fs.readdirSync(models_path);
models_files.forEach(function (file) {
  var fname = models_path + '/' + file;
  if (fs.statSync(fname).isFile()) {
    DataFormHandler.addResource(file.slice(0, -3), require(fname));
  }
});

var port;

port = process.env.PORT || 3001;
app.listen(port);
console.log("Express server listening on port %d in %s mode", port, app.settings.env);
