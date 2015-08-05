'use strict';

var assert = require('assert');
var formsAngular = require('../../server/data_form.js');
var express = require('express');
var async = require('async');
var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;
var mongoose = require('mongoose');

describe('API', function () {

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

  describe('data read', function () {

    var aData, bData;

    function getCollection(model, cb) {
      var mockReq = {
        url: '/' + model,
        params : {resourceName : model}
      };
      var mockRes = {
        send: function (data) {
          cb(null, data);
        }
      };
      fng.collection()(mockReq, null, function () {
        fng.collectionGet()(mockReq, mockRes);
      });
    }

    before(function (done) {
      async.auto(
        {
          aData: function (cb) { getCollection('a_unadorned_mongoose', cb); },
          bData: function (cb) { getCollection('b_using_options', cb); }
        },
        function (err, results) {
          if (err) { throw err; }
          aData = results['aData'];
          bData = results['bData'];
          done();
        }
      );
    });

    it('should send the right number of records', function () {
      assert.equal(aData.length, 2);
    });

    it('should send the all the fields of mongoose schema', function () {
      assert(aData[0].surname, 'must send surname');
      assert(aData[0].forename, 'must send forename');
      assert(aData[0].weight, 'must send weight');
      assert(aData[0].eyeColour, 'must send eyeColour');
      assert(aData[0].dateOfBirth, 'must send dob');
      assert.equal(aData[0].accepted, false, 'must send accepted');
    });

    it('should filter out records that do not match the find func', function () {
      assert.equal(bData.length, 2);
    });

    it('should not send secure fields of a modified schema', function () {
      assert(bData[0].surname, 'Must send surname');
      assert(bData[0].forename, 'Must send forename');
      assert.equal(Object.keys(bData[0]).indexOf('login'), -1, 'Must not send secure login field');
      assert.equal(Object.keys(bData[0]).indexOf('passwordHash'), -1, 'Must not send secure password hash field');
      assert(bData[0].email, 'Must send email');
      assert(bData[0].weight, 'Must send weight');
      assert(bData[0].accepted, 'Must send accepted');
      assert(bData[0].interviewScore, 'Must send interview score');
      assert(bData[0].freeText, 'Must send freetext');
    });

    it('should not send secure fields of a modified subschema', function () {
      assert(bData[0].address.line1, 'Must send line1');
      assert(bData[0].address.town, 'Must send town');
      assert(bData[0].address.postcode, 'Must send postcode');
      assert.equal(Object.keys(bData[0]).indexOf('address.surveillance'), -1, 'Must not send secure surveillance field');
    });

  });

  describe('data update', function () {

    var id;

    it('should create a record', function (done) {
      var mockReq = {
        url: '/b_using_options',
        params: {resourceName: 'b_using_options'},
        body: {'surname': 'TestCreate', 'accepted': false},
        ip: '192.168.99.99'
      };
      var mockRes = {
        send: function (data) {
          assert(data._id, 'Must return the id');
          id = data._id;
          assert.equal(data.surname, 'TestCreate');
          assert.equal(data.accepted, false);
          assert.equal(data.ipAddress, '192.168.99.99');
          done();
        }
      };
      fng.collection()(mockReq, null, function () {
        fng.collectionPost()(mockReq, mockRes);
      });
    });

    it('should update a record', function (done) {
      var mockReq = {
        url: '/b_using_options/' + id,
        params: {resourceName: 'b_using_options', id: id},
        body: {'forename': 'Alfie'}
      };
      var mockRes = {
        send: function (data) {
          assert.equal(data.forename, 'Alfie');
          done();
        }
      };
      fng.entity()(mockReq, null, function () {
        fng.entityPut()(mockReq, mockRes);
      });
    });

    it('should delete a record', function (done) {
      var mockReq = {
        url: '/b_using_options/' + id,
        params: {resourceName: 'b_using_options', id: id}
      };
      var mockRes = {
        send: function (data) {
          assert(data.success, 'Failed to delete document');
          done();
        }
      };
      fng.entity()(mockReq, null, function () {
        fng.entityDelete()(mockReq, mockRes);
      });
    });
  });

  describe('Secure fields', function () {

    it('should not be transmitted in a listing', function (done) {
      var mockReq = {url: 'c_subdoc_example', params: {resourceName: 'c_subdoc_example', id: '519aaaaab320153869b175e0'}};
      var mockRes = {
        send: function (data) {
          assert.equal(data.length, 2);
          assert.equal(data[0].surname, 'Anderson');
          assert.equal(data[0].passwordHash, undefined);
          assert.notEqual(data[0].interview.score, undefined);
          assert.equal(data[0].interview.interviewHash, undefined);
          done();
        }
      };
      fng.collection()(mockReq, null, function () {
        fng.collectionGet()(mockReq, mockRes);
      });
    });

    it('should not be transmitted in an entity get', function (done) {
      var mockReq = {
        url: 'c_subdoc_example/519aaaaab320153869b175e0',
        params: {
          resourceName: 'c_subdoc_example',
          id: '519aaaaab320153869b175e0'
        }
      };
      var mockRes = {
        send: function (data) {
          assert.equal(data.surname, 'Anderson');
          assert.equal(data.passwordHash, undefined);
          assert.notEqual(data.interview.score, undefined);
          assert.equal(data.interview.interviewHash, undefined);
          done();
        }
      };
      fng.entity()(mockReq, null, function () {
        fng.entityGet()(mockReq, mockRes);
      });
    });


    it('should not be overwritten and should not be transmitted on update', function (done) {
      var mockReq = {
        url: '/c_subdoc_example/519aaaaab320153869b175e0',
        params: {resourceName: 'c_subdoc_example', id: '519aaaaab320153869b175e0'},
        body: {'surname': 'Anderson', 'forename': 'John', 'weight': 124, 'hairColour': 'Brown', 'accepted': true, 'interview': { 'score': 97, 'date': '23 Mar 2013' }}
      };
      var mockRes = {
        send: function (data) {
          assert.equal(data.weight, 124);
          assert.equal(data.passwordHash, undefined);
          assert.equal(data.interview.score, 97);
          assert.equal(data.interview.interviewHash, undefined);
          var resource = fng.getResource('c_subdoc_example');
          resource.model.findById('519aaaaab320153869b175e0', function (err, dataOnDisk) {
            if (err) { throw err; }
            assert.equal(dataOnDisk.weight, 124);
            assert.equal(dataOnDisk.passwordHash, 'top secret');
            assert.equal(dataOnDisk.interview.score, 97);
            assert.equal(dataOnDisk.interview.interviewHash, 'you think I would tell you?');
            done();
          });
        }
      };
      fng.entity()(mockReq, null, function () {
        fng.entityPut()(mockReq, mockRes);
      });
    });
  });

  describe('Search API', function () {

    it('should find a single match', function (done) {
      var mockReq = {
        url: '/search?q=IsA'
      };
      var mockRes = {
        send: function (data) {
          assert.equal(data.results.length, 1);
          done();
        }
      };
      fng.searchAll()(mockReq, mockRes);
    });

    it('should find two matches', function (done) {
      var mockReq = {
        url: '/search?q=Test'
      };
      var mockRes = {
        send: function (data) {
          assert.equal(data.results.length, 2);
          done();
        }
      };
      fng.searchAll()(mockReq, mockRes);
    });


    it('should not find records that do not meet find function', function (done) {
      var mockReq = {
        url: '/search?q=Not'
      };
      var mockRes = {
        send: function (data) {
          assert.equal(data.results.length, 0);
          done();
        }
      };
      fng.searchAll()(mockReq, mockRes);
    });

    it('shoucd ..ld not find records indexed on a no-search field', function (done) {
      var mockReq = {
        url: '/search?q=ReportingIndex'
      };
      var mockRes = {
        send: function (data) {
          assert.equal(data.results.length, 0);
          done();
        }
      };
      fng.searchAll()(mockReq, mockRes);
    });


    it('should support searchOrder option', function (done) {
      var mockReq = {
        url: '/search?q=Smi'
      };
      var mockRes = {
        send: function (data) {
          assert.equal(data.results.length, 10);
          assert.equal(data.results[0].text, 'Smith00 John00');
          assert.equal(data.results[9].text, 'Smith10 John10');
          assert.equal(JSON.stringify(data.results).indexOf('John07'), -1);
          done();
        }
      };
      fng.searchAll()(mockReq, mockRes);
    });

    it('should find a record from a partial initial string', function (done) {
      var mockReq = {
        url: '/search?q=ann'
      };
      var mockRes = {
        send: function (data) {
          assert.equal(data.results.length, 1);
          assert.equal(data.results[0].id, '51c583d5b5c51226db418f16');
          assert.equal(data.results[0].resource, 'f_nested_schema');
          assert.equal(data.results[0].resourceText, 'Exams');
          assert.equal(data.results[0].text, 'Smith, Anne');
          done();
        }
      };
      fng.searchAll()(mockReq, mockRes);
    });

    it('should find a record from multiple partial initial strings', function (done) {
      var mockReq = {
        url: '/search?q=smi john04',
        route: {path : '/api/search'}
      };
      var mockRes = {
        send: function (data) {
          assert.notEqual(data.moreCount, 0);
          assert.equal(data.results[0].text, 'Smith04 John04');  // Double hit
          assert.equal(data.results[1].text, 'Smith00 John00');  // normal weighting
          done();
        }
      };
      fng.searchAll()(mockReq, mockRes);
    });


    it('should support searchResultFormat option', function (done) {
      var mockReq = {
        url: '/search?q=Br',
        route: {path : '/api/search'}
      };
      var mockRes = {
        send: function (data) {
          assert.equal(data.results.length, 2);
          assert.equal(data.results[0].resourceText, 'Exams');
          assert.equal(data.results[0].resource, 'f_nested_schema');
          assert.equal(data.results[0].text, 'Brown, John');
          done();
        }
      };
      fng.searchAll()(mockReq, mockRes);
    });
  });

  describe('MongoDB selection', function () {

    it('Should filter', function (done) {
      var mockReq = {
        url: '/f_nested_schema?f={"exams.subject":"Physics"}',
        params : {resourceName : 'f_nested_schema'}
      };
      var mockRes = {
        send: function (data) {
          assert.equal(data.length, 1);
          done();
        }
      };
      fng.collection()(mockReq, null, function () {
        fng.collectionGet()(mockReq, mockRes);
      });
    });

    it('Should aggregate and return appropriate records', function (done) {
      var mockReq = {
        url: '/api/f_nested_schema?a=[{"$unwind":"$exams"},{"$sort":{"exams.score":1}},{"$group":{"_id":{"id":"$_id"},' +
          '"bestSubject":{"$last":"$exams.subject"}}},{"$match":{"bestSubject":"English"}},{"$project":{"_id":"$_id.id"}}]',
        params: {resourceName: 'f_nested_schema'}
      };
      var mockRes = {
        send: function (data) {
          assert.equal(data.length, 2);
          assert.equal(data[0].forename, 'John');
          assert.equal(data[1].forename, 'Jenny');
          done();
        }
      };
      fng.collection()(mockReq, null, function () {
        fng.collectionGet()(mockReq, mockRes);
      });
    });

    it('Should combine aggregation and filtering', function (done) {
      var mockReq = {
        url: '/api/f_nested_schema?f={"_id":"51c583d5b5c51226db418f15"}&a=[{"$unwind":"$exams"},{"$sort":{"exams.score":1}},' +
        '{"$group":{"_id":{"id":"$_id"},"bestSubject":{"$last":"$exams.subject"}}},{"$match":{"bestSubject":"English"}},' +
        '{"$project":{"_id":"$_id.id"}}]',
        params : {resourceName: 'f_nested_schema'}
      };
      var mockRes = {
        send: function (data) {
          assert.equal(data.length, 1);
          assert.equal(data[0].forename, 'John');
          done();
        }
      };
      fng.collection()(mockReq, null, function () {
        fng.collectionGet()(mockReq, mockRes);
      });
    });
  });

});
