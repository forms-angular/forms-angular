'use strict';

var assert = require('assert');
var formsAngular = require('../../server/data_form.js');
var express = require('express');
var async = require('async');
var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;
var mongoose = require('mongoose');

describe('List API', function () {

  var fng, app;

  before(function (done) {

    app = express();

    fng = new (formsAngular)(app, {urlPrefix: '/api/'});

    mongoose.connect('localhost', 'forms-ng_test');
    mongoose.connection.on('error', function () {
      console.error('connection error', arguments);
    });

    mongoose.connection.on('open', function () {
      // Bootstrap models
      var modelsPath = path.join(__dirname, '/models');
      fs.readdirSync(modelsPath).forEach(function (file) {
        var fname = modelsPath + '/' + file;
        if (fs.statSync(fname).isFile()) {
          fng.addResource(file.slice(0, -3), require(fname), {suppressDeprecatedMessage: true});
        }
      });
    });

    // Import test data
    var dataPath = path.join(__dirname, 'data');
    async.each(fs.readdirSync(dataPath), function (file, callback) {
      var fname = dataPath + '/' + file;
      if (fs.statSync(fname).isFile()) {
        exec('mongoimport --db forms-ng_test --drop --collection ' + file.slice(0, 1) + 's --jsonArray < ' + fname, callback);
      }
    }, function (err) {
      if (err) {
        console.log('Problem importing test data ' + err.message);
      } else {
        done();
      }
    });
  });

  after(function (done) {
    mongoose.connection.db.dropDatabase(function () {
      mongoose.disconnect(function () {
        done();
      });
    });
  });

  it('returns explicit list fields', function (done) {
    var mockReq = {
      url: '/api/c_subdoc_example/519aaaaab320153869b175e0/list',
      params: {resourceName: 'c_subdoc_example', id: '519aaaaab320153869b175e0'}
    };
    var mockRes = {
      send: function (data) {
        assert.equal(data.list, 'Anderson John');
        done();
      }
    };
    fng.entity()(mockReq, null, function () {
      fng.entityList()(mockReq, mockRes);
    });
  });

  it('returns hidden list fields', function (done) {
    var mockReq = {
      url: '/api/b_using_options/519a6075b320153869b175e0/list',
      params: {resourceName: 'b_using_options', id: '519a6075b320153869b175e0'}
    };
    var mockRes = {
      send: function (data) {
        assert.equal(data.list, 'NotAccepted John false 89');
        done();
      }
    };
    fng.entity()(mockReq, null, function () {
      fng.entityList()(mockReq, mockRes);
    });
  });

  it('returns first string field if no explicit list fields', function (done) {
    var mockReq = {
      url: '/api/a_unadorned_mongoose/519a6075b320153869b17599/list',
      params: {resourceName: 'a_unadorned_mongoose', id: '519a6075b320153869b17599'}
    };
    var mockRes = {
      send: function (data) {
        assert.equal(data.list, 'TestPerson1');
        done();
      }
    };
    fng.entity()(mockReq, null, function () {
      fng.entityList()(mockReq, mockRes);
    });
  });


});