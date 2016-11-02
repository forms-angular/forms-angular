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

    var aData, aPtr, bData, bPtr;

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
      fng.collectionGet()(mockReq, mockRes);
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
          aPtr = aData.find(function(obj) {return obj.surname === 'TestPerson1'});
          bData = results['bData'];
          bPtr = bData.find(function(obj) {return obj.surname === 'IsAccepted'});
          done();
        }
      );
    });

    it('should send the right number of records', function () {
      assert.equal(aData.length, 2);
    });

    it('should send the all the fields of mongoose schema', function () {
      assert(aPtr.surname, 'must send surname');
      assert(aPtr.forename, 'must send forename');
      assert(aPtr.weight, 'must send weight');
      assert(aPtr.eyeColour, 'must send eyeColour');
      assert(aPtr.dateOfBirth, 'must send dob');
      assert.equal(aPtr.accepted, false, 'must send accepted');
    });

    it('should filter out records that do not match the find func', function () {
      assert.equal(bData.length, 2);
    });

    it('should not send secure fields of a modified schema', function () {
      assert(bPtr.surname, 'Must send surname');
      assert(bPtr.forename, 'Must send forename');
      assert.equal(Object.keys(bPtr).indexOf('login'), -1, 'Must not send secure login field');
      assert.equal(Object.keys(bPtr).indexOf('passwordHash'), -1, 'Must not send secure password hash field');
      assert(bPtr.email, 'Must send email');
      assert(bPtr.weight, 'Must send weight');
      assert(bPtr.accepted, 'Must send accepted');
      assert(bPtr.interviewScore, 'Must send interview score');
      assert(bPtr.freeText, 'Must send freetext');
    });

    it('should not send secure fields of a modified subschema', function () {
      assert(bPtr.address.line1, 'Must send line1');
      assert(bPtr.address.town, 'Must send town');
      assert(bPtr.address.postcode, 'Must send postcode');
      assert.equal(Object.keys(bPtr).indexOf('address.surveillance'), -1, 'Must not send secure surveillance field');
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
      fng.collectionPost()(mockReq, mockRes);
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
      fng.entityPut()(mockReq, mockRes);
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
      fng.entityDelete()(mockReq, mockRes);
    });

  });

  describe('Secure fields', function () {

    it('should not be transmitted in a listing', function (done) {
      var mockReq = {url: 'c_subdoc_example', params: {resourceName: 'c_subdoc_example', id: '519aaaaab320153869b175e0'}};
      var mockRes = {
        send: function (data) {
          assert.equal(data.length, 2);
          var dataPtr = data.find(function(obj) {return obj.surname === 'Anderson'});
          assert.equal(dataPtr.passwordHash, undefined);
          assert.notEqual(dataPtr.interview.score, undefined);
          assert.equal(dataPtr.interview.interviewHash, undefined);
          done();
        }
      };
      fng.collectionGet()(mockReq, mockRes);
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
      fng.entityGet()(mockReq, mockRes);
    });


    it('should not be overwritten by nulls and should not be transmitted on update', function (done) {
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
      fng.entityPut()(mockReq, mockRes);
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
          assert.equal(data.results[0].text, 'Smith04 John04');  // Double hit should come first
          assert.equal(data.results[1].text, 'Smith00 John00');  // normal weighting
          done();
        }
      };
      fng.searchAll()(mockReq, mockRes);
    });

    it('should not repeat a record in the results', function (done) {
      var mockReq = {
        url: '/search?q=smith04 john04',
        route: {path : '/api/search'}
      };
      var mockRes = {
        send: function (data) {
          assert.equal(data.results.length, 1);
          assert.equal(data.results[0].text, 'Smith04 John04');
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
      fng.collectionGet()(mockReq, mockRes);
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
          assert.notEqual(null, data.find(function(obj) {return obj.forename === 'John'}));
          assert.notEqual(null, data.find(function(obj) {return obj.forename === 'Jenny'}));
          done();
        }
      };
      fng.collectionGet()(mockReq, mockRes);
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
      fng.collectionGet()(mockReq, mockRes);
    });
  });

});
