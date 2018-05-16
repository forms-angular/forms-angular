'use strict';

var assert = require('assert');
var formsAngular = require('../../dist/server/data_form.js');
var express = require('express');
var async = require('async');
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var exec = require('child_process').exec;
var mongoose = require('mongoose');

describe('original API', function () {

  var fng, app;

  before(function (done) {
    app = express();

    fng = new (formsAngular)(mongoose, app, {urlPrefix: '/api/'});

    mongoose.connect('mongodb://localhost/forms-ng_test', {
      keepAlive: 1,
      connectTimeoutMS: 30000,
      reconnectTries: 30,
      reconnectInterval: 5000
    });
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
        exec('mongoimport --db forms-ng_test --drop --collection ' + file.slice(0, 1) + 's --jsonArray < ' + fname, function(error, stdout, stderr) {
          if (error !== null) {
            callback('Error executing ' + command + ' : ' + error + ' (Code = ' + error.code + '    ' + error.signal + ') : ' + stderr + ' : ' + stdout);
          } else {
            callback();
          }
        });
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

  it('returns models', function () {
    var mockReq = null;
    var mockRes = {
      send: function (models) {
        assert.equal(models.length, 11);
        assert(_.find(models, function (resource) {
          return resource.resourceName === 'b_using_options';
        }).options.hide.indexOf('login') > -1, 'must send login as a hidden field');
      }
    };
    fng.models()(mockReq, mockRes);
  });

  it('returns straight schema', function (done) {
    var mockReq = {params : {resourceName: 'a_unadorned_mongoose'}};
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

  it('returns nested schema', function (done) {
    var mockReq = {params : {resourceName: 'f_nested_schema'}};
    var mockRes = {
      send: function (schema) {
        var keys = Object.keys(schema);
        assert.equal(keys.length, 5);
        assert.equal(keys[0], 'surname');
        assert.equal(schema[keys[0]].path, 'surname');
        assert.equal(keys[1], 'forename');
        assert.equal(schema[keys[1]].path, 'forename');
        assert.equal(keys[2], 'aTest');
        assert.equal(schema[keys[2]].path, 'aTest');
        assert.equal(keys[3], 'exams');
        keys = Object.keys(schema[keys[3]].schema);
        assert.equal(keys.length, 6);
        assert.equal(keys[0], 'subject');
        assert.equal(schema.exams.schema[keys[0]].path, 'subject');
        assert.equal(keys[3], 'result');
        assert.equal(schema.exams.schema[keys[3]].path, 'result');
        done();
      }
    };
    fng.schema()(mockReq, mockRes);
  });


  it('returns forms schema', function (done) {
    var mockReq = {params : {resourceName: 'b_using_options', formName: 'justnameandpostcode'}};
    var mockRes = {
      send: function (schema) {
        var keys = Object.keys(schema);
        assert.equal(keys.length, 4);
        assert.equal(schema[keys[0]].path, 'surname');
        assert.equal(schema[keys[1]].path, 'address.postcode');
        done();
      }
    };
    fng.schema()(mockReq, mockRes);
  });

  it('supports nested schemas within form schemas', function (done) {
    var mockReq = {params : {resourceName: 'f_nested_schema', formName: 'EnglishAndMaths'}};
    var mockRes = {
      send: function (schema) {
        var keys = Object.keys(schema);
        assert.equal(keys.length, 3);
        assert.equal(schema[keys[0]].path, 'surname');
        assert.equal(keys[0], 'surname');
        assert.equal(schema[keys[1]].path, 'forename');
        assert.equal(keys[1], 'forename');
        assert.equal(keys[2], 'exams');
        keys = Object.keys(schema[keys[2]].schema);
        assert.equal(keys.length, 6);
        assert.equal(keys[0], 'subject');
        assert.equal(schema.exams.schema[keys[0]].path, 'subject');
        assert.equal(keys[3], 'result');
        assert.equal(schema.exams.schema[keys[3]].path, 'result');
        assert.equal(keys[4], 'grader');
        assert.equal(schema.exams.schema[keys[4]].options.form.label, 'Marked by');
        done();
      }
    };
    fng.schema()(mockReq, mockRes);
  });

  it('allows form schemas to override nested schemas', function (done) {
    var mockReq = {params : {resourceName: 'f_nested_schema', formName: 'ResultsOnly'}};
    var mockRes = {
      send: function (schema) {
        var keys = Object.keys(schema);
        assert.equal(keys.length, 3);
        assert.equal(schema[keys[0]].path, 'surname');
        assert.equal(keys[0], 'surname');
        assert.equal(schema[keys[1]].path, 'forename');
        assert.equal(keys[1], 'forename');
        assert.equal(keys[2], 'exams');
        keys = Object.keys(schema[keys[2]].schema);
        assert.equal(keys.length, 2);
        assert.equal(keys[0], 'subject');
        assert.equal(schema.exams.schema[keys[0]].path, 'subject');
        assert.equal(keys[1], 'result');
        assert.equal(schema.exams.schema[keys[1]].path, 'result');
        assert.equal(schema.exams.schema[keys[1]].options.form.label, 'Outcome');
        done();
      }
    };
    fng.schema()(mockReq, mockRes);
  });

  it('supports enums with values and labels', function (done) {
    var mockReq = {params : {resourceName: 'b_using_options'}};
    var mockRes = {
      send: function (schema) {
        var keys = Object.keys(schema);
        assert.equal(schema['education'].enumValues[1], 'univ');
        assert.equal(schema['education'].options.enum.values[1], 'univ');
        assert.equal(schema['education'].options.enum.labels[1], 'University');
        assert.equal(schema['education'].validators[0].enumValues[1], 'univ');
        done();
      }
    };
    fng.schema()(mockReq, mockRes);
  });

});
