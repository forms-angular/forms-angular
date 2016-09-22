'use strict';

var assert = require('assert');
var formsAngular = require('../../server/data_form.js');
var express = require('express');
var async = require('async');
var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;
var mongoose = require('mongoose');

describe('Report API', function () {

  var fng, app;

  before(function (done) {
    app = express();

    fng = new (formsAngular)(app, {urlPrefix: '/api/'});

    mongoose.connect('localhost', 'forms-ng_test');
//    mongoose.set('debug',true);
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

  it('handles pipeline request', function (done) {
    var mockReq = {
      // url: '/report/g_conditional_fields?r={"pipeline":[{"$group":{"_id":"$sex","count":{"$sum":1}}},{"$sort":{"_id":1}}]}',
      url: '/report/g_conditional_fields?r={"pipeline":{"$group":{"_id":"x","count":{"$sum":1}}}}',
      params: {resourceName: 'g_conditional_fields'}
    };
    var mockRes = {
      send: function (data) {
        assert.equal(data.report.length, 1);
        assert.deepEqual(data.report[0], {_id: 'x', count: 17});
        done();
      }
    };
    fng.report()(mockReq, mockRes);
  });

  it('handles complex pipeline request', function (done) {
    var mockReq = {
      url: 'report/e_referencing_another_collection?r={"pipeline":[{"$group":{"_id":"$teacher","count":{"$' +
        'sum":1}}}],"title":"Class Sizes","columnDefs":[{"field":"_id","displayName":"Teacher"},{"field":"' +
        'count","displayName":"Number in Class"}],"columnTranslations":[{"field":"_id","ref":"b_using_options"}]}',
      params: {resourceName: 'e_referencing_another_collection'}
    };
    var mockRes = {
      send: function (data) {
        assert.equal(data.report.length, 1);
        assert.deepEqual(data.report[0], {_id: 'IsAccepted John true 89', count: 1});
        done();
      }
    };
    fng.report()(mockReq, mockRes);
  });

  it('looks up schema and does a simple translate', function (done) {
    var mockReq = {
      url: 'report/g_conditional_fields/breakdownbysex',
      params : {
        resourceName: 'g_conditional_fields',
        reportName: 'breakdownbysex'
      }
    };
    var mockRes = {
      send: function (data) {
        assert.equal(data.report.length, 2);
        assert.deepEqual(data.report[0], {_id: 'Female', count: 11});
        assert.deepEqual(data.report[1], {_id: 'Male', count: 6});
        done();
      }
    };
    fng.report()(mockReq, mockRes);
  });

  it('supports two reference lookups', function (done) {
    var reportSpec = {
      'pipeline': [{'$project': {'surname': 1, 'forename': 1, 'teacher': 1, 'mentor': 1}}],
      'title': 'Class Sizes',
      'columnTranslations': [{'field': 'teacher', 'ref': 'b_using_options'}, {'field': 'mentor', 'ref': 'c_subdoc_example'}]
    };
    var mockReq = {
      url: 'report/e_referencing_another_collection?r=' + JSON.stringify(reportSpec),
      params: {resourceName: 'e_referencing_another_collection'}
    };
    var mockRes = {
      send: function (data) {
        assert.equal(data.report.length, 1);
        assert.equal(data.report[0].surname, 'Smith');
        assert.equal(data.report[0].forename, 'John');
        assert.equal(data.report[0].teacher, 'IsAccepted John true 89');
        assert.equal(data.report[0].mentor, 'Anderson John');
        done();
      }
    };
    fng.report()(mockReq, mockRes);
  });

  it('supports functions in column translate', function (done) {
    var mockReq = {
      url: 'report/g_conditional_fields/functiondemo',
      params : {
        resourceName: 'g_conditional_fields',
        reportName: 'functiondemo'
      }
    };
    var mockRes = {
      send: function (data) {
        assert.equal(data.report.length, 2);
        assert.deepEqual(data.report[0], {_id: 'Female', count: 11, functionResult: 21});
        assert.deepEqual(data.report[1], {_id: 'Male', count: 6, functionResult: 16});
        done();
      }
    };
    fng.report()(mockReq, mockRes);
  });

  it('looks up schema and does a table lookup', function (done) {
    var mockReq = {
      url: 'report/e_referencing_another_collection/class-sizes',
      params : {
        resourceName: 'e_referencing_another_collection',
        reportName: 'class-sizes'
      }
    };
    var mockRes = {
      send: function (data) {
        assert.equal(data.report.length, 1);
        assert.deepEqual(data.report[0], {_id: 'IsAccepted John true 89', count: 1});
        done();
      }
    };
    fng.report()(mockReq, mockRes);
  });

  it('handles invalid lookup table error', function (done) {
    var mockReq = {
      url: 'report/e_referencing_another_collection?r={"pipeline":[{"$group":{"' +
        '_id":"$teacher","count":{"$sum":1}}}],"title":"Class Sizes","columnDefs' +
        '":[{"field":"_id","displayName":"Teacher"},{"field":"count","displayName":"' +
        'Number in Class"}],"columnTranslations":[{"field":"_id","ref":"b_usissng_options' +
        '"}]}',
      params : {resourceName: 'g_conditional_fields'}
    };
    var mockRes = {
      send: function (data) {
        assert.equal(data, 'Invalid ref property of b_usissng_options in columnTranslations _id');
        done();
      }
    };
    fng.report()(mockReq, mockRes);
  });

  it('supports selection by text parameter', function (done) {
    var mockReq = {
      url: 'report/g_conditional_fields/totalforonesex',
      params : {
        resourceName: 'g_conditional_fields',
        reportName: 'totalforonesex'
      }
    };
    var mockRes = {
      send: function (data) {
        assert.equal(data.report.length, 1);
        assert.deepEqual(data.report[0], {_id: 'Male', count: 6});
        done();
      }
    };
    fng.report()(mockReq, mockRes);
  });

  it('supports selection by query text parameter', function (done) {
    var mockReq = {
      url: 'report/g_conditional_fields/totalforonesex?sex=F',
      params : {
        resourceName: 'g_conditional_fields',
        reportName: 'totalforonesex'
      }
    };
    var mockRes = {
      send: function (data) {
        assert.equal(data.report.length, 1);
        assert.deepEqual(data.report[0], {_id: 'Female', count: 11});
        done();
      }
    };
    fng.report()(mockReq, mockRes);
  });

  it('supports selection by numeric parameter', function (done) {
    var mockReq = {
      url: 'report/g_conditional_fields/selectbynumber?number_param=11',
      params : {
        resourceName: 'g_conditional_fields',
        reportName: 'selectbynumber'
      }
    };
    var mockRes = {
      send: function (data) {
        assert.equal(data.report.length, 1);
        assert.deepEqual(data.report[0], {_id: 'F', count: 11});
        done();
      }
    };
    fng.report()(mockReq, mockRes);
  });

  it('honours findfunc', function (done) {
    var mockReq = {
      url: 'report/b_using_options/allVisible',
      params : {
        resourceName: 'b_using_options',
        reportName: 'allVisible'
      }
    };
    var mockRes = {
      send: function (data) {
        assert.equal(data.report.length, 1);
        assert.deepEqual(data.report[0], {_id: true, count: 2});
        done();
      }
    };
    fng.report()(mockReq, mockRes);
  });

  it('prevents access to secure fields', function (done) {
    var mockReq = {
      url: 'report/b_using_options?r=[{"$project":{"passwordHash":1}}]',
      params : {
        resourceName: 'b_using_options'
      }
    };
    var mockRes = {
      send: function (data) {
        assert.equal(data, 'You cannot access passwordHash');
        done();
      }
    };
    fng.report()(mockReq, mockRes);
  });

  it('supports lookups where the list item is a lookup', function() {

  });

});
