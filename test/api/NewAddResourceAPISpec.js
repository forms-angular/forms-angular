'use strict';

var assert = require('assert');
var formsAngular = require('../../server/data_form.js');
var express = require('express');
var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var mongoose = require('mongoose');

describe('mongoose collection name API', function () {

  var fng, app;

  before(function (done) {
    app = express();

    fng = new (formsAngular)(app, {urlPrefix: '/api/'});

    mongoose.connect('localhost', 'forms-ng_test');
    mongoose.connection.on('error', function () {
      console.error('connection error', arguments);
    });

    mongoose.connection.once('open', function () {
      // Bootstrap models
      var modelsPath = path.join(__dirname, '/models');
      fs.readdirSync(modelsPath).forEach(function (file) {
        var fname = modelsPath + '/' + file;
        if (fs.statSync(fname).isFile()) {
          fng.newResource(require(fname), {suppressDeprecatedMessage: true});
        }
      });
      done();
    });

  });

  after(function (done) {
    mongoose.connection.db.dropDatabase(function () {
      mongoose.disconnect(function () {
        done();
      });
    });
  });

  it('returns models', function () {
    var mockReq = null;
    var mockRes = {
      send: function (models) {
        assert.equal(models.length, 11);
        assert(_.find(models, function (resource) {
          return resource.resourceName === 'B';
        }).options.hide.indexOf('login') > -1, 'must send login as a hidden field');
      }
    };
    fng.models()(mockReq, mockRes);
  });

  it('returns straight schema', function (done) {
    var mockReq = {params : {resourceName: 'A'}};
    var mockRes = {
      send: function (schema) {
        var keys = Object.keys(schema);
        assert.equal(keys.length, 8);
        assert.equal(schema[keys[0]].path, 'surname');
        assert.equal(schema[keys[1]].path, 'forename');
        assert.equal(schema[keys[2]].path, 'phone');
        assert.equal(schema[keys[3]].path, 'weight');
        assert.equal(schema[keys[4]].path, 'eyeColour');
        assert.equal(schema[keys[5]].path, 'dateOfBirth');
        assert.equal(schema[keys[6]].path, 'accepted');
        assert.equal(schema[keys[7]].path, '_id');
        done();
      }
    };
    fng.schema()(mockReq, mockRes);
  });

});