'use strict';

var express = require('express'),
    favicon = require('serve-favicon'),
    morgan = require('morgan'),
    compression = require('compression'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    errorHandler = require('errorhandler'),
    path = require('path'),
    config = require('./config');

/**
 * Express configuration
 */

module.exports = function(app) {
  var env = app.get('env');
  console.log(env);

  if ('development' === env) {
    app.use(require('connect-livereload')());

    // Disable caching of scripts for easier testing
    app.use(function noCache(req, res, next) {
      if (req.url.indexOf('/scripts/') === 0) {
        res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.header('Pragma', 'no-cache');
        res.header('Expires', 0);
      }
      next();
    });

    app.use(express.static(path.join(config.root, '.')));
    app.use(express.static(path.join(config.root, '.tmp')));
    app.use(express.static(path.join(config.root, 'app')));
    app.use(express.static(path.join(config.root, 'dist')));
    app.use(express.static(path.join(config.root, '../src/client/js')));
    app.use(express.static(path.join(config.root, '../src/client/template')));
    app.use(express.static(path.join(config.root, 'dist/public')));
  } else if ('test' === env) {
    app.use(express.static(path.join(config.root, '.tmp')));
    app.use(express.static(path.join(config.root, 'app')));
  } else if ('production' === env) {
    app.use(compression());
    app.use(favicon(path.join(config.root, 'app', 'favicon.ico')));
    app.use(express.static(path.join(config.root, 'dist')));
    app.use(express.static(path.join(config.root, 'dist/public')));
    app.use(express.static(path.join(config.root, 'app')));
  } else {
    throw new Error("Unsupported node environment");
  }
  app.use(express.static(path.join(config.root, 'node_modules')));

  app.use(morgan('dev'));
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
  app.use(methodOverride());

  // Error handler - has to be last
  if ('development' === app.get('env')) {
    app.use(errorHandler());
  }
};
