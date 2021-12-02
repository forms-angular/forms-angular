'use strict';

const assert = require('assert');
const _ = require('lodash');
const mongoose = require('mongoose');
const dbHelpers = require('../helpers/db-helpers');
const async = require("async");

let fngInstance: any;

before(function(done) {
  dbHelpers.setUpDB(mongoose, function(fngRet) {
    fngInstance = fngRet;
    done();
  });
});

after(function(done) {
  dbHelpers.dropDb(mongoose, function() {
    done();
  });
});

describe('API tests', function() {

  describe('original API', function() {

    it('returns models', function() {
      const mockReq = null;
      const mockRes = {
        send: function(models) {
          assert.equal(models.length, 11);
          assert(_.find(models, function(resource) {
            return resource.resourceName === 'b_using_options';
          }).options.hide.indexOf('login') > -1, 'must send login as a hidden field');
        }
      };
      fngInstance.models()(mockReq, mockRes);
    });

    it('returns straight schema', function(done) {
      const mockReq = { params: { resourceName: 'a_unadorned_mongoose' } };
      const mockRes = {
        send: function(schema) {
          let keys = Object.keys(schema);
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
      fngInstance.schema()(mockReq, mockRes);
    });

    it('returns nested schema', function(done) {
      const mockReq = { params: { resourceName: 'f_nested_schema' } };
      const mockRes = {
        send: function(schema) {
          let keys = Object.keys(schema);
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
      fngInstance.schema()(mockReq, mockRes);
    });


    it('returns forms schema', function(done) {
      const mockReq = { params: { resourceName: 'b_using_options', formName: 'justnameandpostcode' } };
      const mockRes = {
        send: function(schema) {
          let keys = Object.keys(schema);
          assert.equal(keys.length, 4);
          assert.equal(schema[keys[0]].path, 'surname');
          assert.equal(schema[keys[1]].path, 'address.postcode');
          done();
        }
      };
      fngInstance.schema()(mockReq, mockRes);
    });

    it('supports nested schemas within form schemas', function(done) {
      const mockReq = { params: { resourceName: 'f_nested_schema', formName: 'EnglishAndMaths' } };
      const mockRes = {
        send: function(schema) {
          let keys = Object.keys(schema);
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
      fngInstance.schema()(mockReq, mockRes);
    });

    it('allows form schemas to override nested schemas', function(done) {
      const mockReq = { params: { resourceName: 'f_nested_schema', formName: 'ResultsOnly' } };
      const mockRes = {
        send: function(schema) {
          let keys = Object.keys(schema);
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
      fngInstance.schema()(mockReq, mockRes);
    });

    it('supports enums with values and labels', function(done) {
      const mockReq = { params: { resourceName: 'b_using_options' } };
      const mockRes = {
        send: function(schema) {
          assert.equal(schema['education'].enumValues[1], 'univ');
          assert.equal(schema['education'].options.enum.values[1], 'univ');
          assert.equal(schema['education'].options.enum.labels[1], 'University');
          assert.equal(schema['education'].validators[0].enumValues[1], 'univ');
          done();
        }
      };
      fngInstance.schema()(mockReq, mockRes);
    });

  });

  describe('API', function() {

    describe('document read', function() {

      let bData, status;

      function getItem(id, query, cb) {
        const mockReq = {
          url: '/b_using_options/' + id,
          params: { resourceName: 'b_using_options', id: id },
          query: query
        };
        const mockRes = {
          status: function(data) {
            status = data;
            return this;
          },
          send: function(data) {
            cb(null, data);
          }
        };
        fngInstance.entityGet()(mockReq, mockRes);
      }

      describe('simple', function() {

        before(function(done) {
          getItem('519a6075b320153869b175e0', {}, function(err, result) {
            if (err) {throw err;}
            bData = result;
            done();
          });
        });

        it('should send a record', function() {
          assert(status === 200);
          assert(bData);
        });

        it('should not send secure fields of a modified schema', function() {
          assert(bData.surname, 'Must send surname');
          assert(bData.forename, 'Must send forename');
          assert(!bData.login, 'Must not send secure login field');
          assert(!bData.passwordHash, 'Must not send secure password hash field');
          assert(bData.email, 'Must send email');
          assert(bData.weight, 'Must send weight');
          assert(bData.accepted, 'Must send accepted');
          assert(bData.interviewScore, 'Must send interview score');
          assert(bData.freeText, 'Must send freetext');
        });

        it('should not send secure fields of a modified subschema', function() {
          assert(bData.address.line1, 'Must send line1');
          assert(bData.address.town, 'Must send town');
          assert(bData.address.postcode, 'Must send postcode');
          assert(!bData.address.surveillance, 'Must not send secure surveillance field');
        });

      });

      describe('projection', function() {

        before(function(done) {
          getItem('519a6075b320153869b175e0', {p: {surname:1, forename:1, login:1, 'address.line1':1, 'address.surveillance': 1}}, function(err, result) {
            if (err) {throw err;}
            bData = result;
            done();
          });
        });

        it('should send a record', function() {
          assert(bData);
          assert(status === 200);
        });

        it('should not send secure fields of a modified schema', function() {
          assert(bData.surname, 'Must send surname');
          assert(bData.forename, 'Must send forename');
          assert(!bData.login, 'Must not send secure login field');
          assert(!bData.passwordHash, 'Must not send secure password hash field');
          assert(!bData.email, 'Must not send email');
          assert(!bData.weight, 'Must not send weight');
          assert(!bData.accepted, 'Must not send accepted');
          assert(!bData.interviewScore, 'Must not send interview score');
          assert(!bData.freeText, 'Must not send freetext');
        });

        it('should not send secure fields of a modified subschema', function() {
          assert(bData.address.line1, 'Must send line1');
          assert(!bData.address.town, 'Must not send town');
          assert(!bData.address.postcode, 'Must not send postcode');
          assert(!bData.address.surveillance, 'Must not send secure surveillance field');
        });

      });

      describe('findFunc filter', function() {

        before(function(done) {
          getItem('519a6075b440153869b155e0', {}, function(err, result) {
            if (err) {throw err;}
            bData = result;
            done();
          });
        });

        it('should not send a record', function() {
          assert(!bData || !bData.success);
          assert(status === 404);
        });

      });

    });

    describe('collection read', function() {

      let aData, aPtr, bData, bPtr;

      function getCollection(model, cb) {
        const mockReq = {
          url: '/' + model,
          params: { resourceName: model }
        };
        const mockRes = {
          send: function(data) {
            cb(null, data);
          }
        };
        fngInstance.collectionGet()(mockReq, mockRes);
      }

      before(function(done) {
        async.auto(
          {
            aData: function(cb) {
              getCollection('a_unadorned_mongoose', cb);
            },
            bData: function(cb) {
              getCollection('b_using_options', cb);
            }
          },
          function(err, results) {
            if (err) {
              throw err;
            }
            aData = results['aData'];
            aPtr = aData.find(function(obj) {
              return obj.surname === 'TestPerson1'
            });
            bData = results['bData'];
            bPtr = bData.find(function(obj) {
              return obj.surname === 'IsAccepted1'
            });
            done();
          }
        );
      });

      it('should send the right number of records', function() {
        assert.equal(aData.length, 2);
      });

      it('should send the all the fields of mongoose schema', function() {
        assert(aPtr.surname, 'must send surname');
        assert(aPtr.forename, 'must send forename');
        assert(aPtr.weight, 'must send weight');
        assert(aPtr.eyeColour, 'must send eyeColour');
        assert(aPtr.dateOfBirth, 'must send dob');
        assert.equal(aPtr.accepted, false, 'must send accepted');
      });

      it('should filter out records that do not match the find func', function() {
        assert.equal(bData.length, 2);
      });

      it('should not send secure fields of a modified schema', function() {
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

      it('should not send secure fields of a modified subschema', function() {
        assert(bPtr.address.line1, 'Must send line1');
        assert(bPtr.address.town, 'Must send town');
        assert(bPtr.address.postcode, 'Must send postcode');
        assert.equal(Object.keys(bPtr).indexOf('address.surveillance'), -1, 'Must not send secure surveillance field');
      });

    });

    describe('collection projection', function() {

      let aData, aPtr, bData, bPtr;

      function getCollectionProjection(model, proj, cb) {
        const mockReq = {
          url: '/' + model,
          query : {p : JSON.stringify(proj)},
          params: { resourceName: model }
        };
        const mockRes = {
          send: function(data) {
            cb(null, data);
          }
        };
        fngInstance.collectionGet()(mockReq, mockRes);
      }

      before(function(done) {
        async.auto(
          {
            aData: function(cb) {
              getCollectionProjection('a_unadorned_mongoose', {forename:0, weight:0}, cb);
            },
            bData: function(cb) {
              getCollectionProjection('b_using_options', {surname: 1, weight: 1, login: 1, 'address.surveillance': 1, 'address.line1': 1}, cb);
            }
          },
          function(err, results) {
            if (err) {
              throw err;
            }
            aData = results['aData'];
            aPtr = aData.find(function(obj) {
              return obj.surname === 'TestPerson1'
            });
            bData = results['bData'];
            bPtr = bData.find(function(obj) {
              return obj.surname === 'IsAccepted1'
            });
            done();
          }
        );
      });

      it('should send the right number of records', function() {
        assert.strictEqual(aData.length, 2);
      });

      it('should suppress unselected fields', function() {
        assert(aPtr.surname, 'must send surname');
        assert(!aPtr.forename, 'must not send forename');
        assert(!aPtr.weight, 'must not send weight');
        assert(aPtr.eyeColour, 'must send eyeColour');
        assert(aPtr.dateOfBirth, 'must send dob');
        assert.strictEqual(aPtr.accepted, false, 'must send accepted');
      });

      it('should send select fields unless they are secure', function() {
        assert(bPtr.surname, 'Must send surname');
        assert(!bPtr.forename, 'Must not send forename');
        assert(!bPtr.login, 'Must not send secure login field');
        assert(!bPtr.passwordHash, 'Must not send secure password hash field');
        assert(!bPtr.email, 'Must not send email');
        assert(bPtr.weight, 'Must send weight');
        assert(!bPtr.accepted, 'Must not send accepted');
        assert(!bPtr.interviewScore, 'Must not send interview score');
        assert(!bPtr.freeText, 'Must not send freetext');
      });

      it('should not send secure fields of a modified subschema', function() {
        assert(bPtr.address.line1, 'Must send line1');
        assert(!bPtr.address.town, 'Must not send town');
        assert(!bPtr.address.postcode, 'Must not send postcode');
        assert(!bPtr.address.surveillance, 'Must not send secure surveillance field');
      });

    });

    describe('data update', function() {

      let id;

      it('should create a record', function(done) {
        const mockReq = {
          url: '/b_using_options',
          params: { resourceName: 'b_using_options' },
          body: { 'surname': 'TestCreate', 'accepted': true },
          ip: '192.168.99.99'
        };
        const mockRes = {
          send: function(data) {
            assert(data._id, 'Must return the id');
            id = data._id;
            assert.equal(data.surname, 'TestCreate');
            assert.equal(data.accepted, true);
            assert.equal(data.ipAddress, '192.168.99.99');
            done();
          }
        };
        fngInstance.collectionPost()(mockReq, mockRes);
      });

      it('should update a record', function(done) {
        const mockReq = {
          url: '/b_using_options/' + id,
          params: { resourceName: 'b_using_options', id: id },
          body: { 'forename': 'Alfie' }
        };
        const mockRes = {
          send: function(data) {
            assert.equal(data.forename, 'Alfie');
            done();
          }
        };
        fngInstance.entityPut()(mockReq, mockRes);
      });

      it('should delete a record', function(done) {
        const mockReq = {
          url: '/b_using_options/' + id,
          params: { resourceName: 'b_using_options', id: id }
        };
        const mockRes = {
          status: function(code) {
            assert.strictEqual(code, 200);
            return this;
          },
          send: function() {
            done();
          }
        };
        fngInstance.entityDelete()(mockReq, mockRes);
      });

    });

    describe('Secure fields', function() {

      it('should not be transmitted in a listing', function(done) {
        const mockReq = {
          url: 'c_subdoc_example',
          params: {
            resourceName: 'c_subdoc_example',
            id: '519aaaaab320153869b175e0'
          }
        };
        const mockRes = {
          send: function(data) {
            assert.equal(data.length, 2);
            const dataPtr = data.find(function(obj) {
              return obj.surname === 'Anderson'
            });
            assert.equal(dataPtr.passwordHash, undefined);
            assert.notEqual(dataPtr.interview.score, undefined);
            assert.equal(dataPtr.interview.interviewHash, undefined);
            done();
          }
        };
        fngInstance.collectionGet()(mockReq, mockRes);
      });

      it('should not be transmitted in an entity get', function(done) {
        const mockReq = {
          url: 'c_subdoc_example/519aaaaab320153869b175e0',
          params: {
            resourceName: 'c_subdoc_example',
            id: '519aaaaab320153869b175e0'
          }
        };
        const mockRes = {
          status: function(code) {
            assert.strictEqual(code, 200);
            return this;
          },
          send: function(data) {
            assert.equal(data.surname, 'Anderson');
            assert.equal(data.passwordHash, undefined);
            assert.notEqual(data.interview.score, undefined);
            assert.equal(data.interview.interviewHash, undefined);
            done();
          }
        };
        fngInstance.entityGet()(mockReq, mockRes);
      });


      it('should not be overwritten by nulls and should not be transmitted on update', function(done) {
        const mockReq = {
          url: '/c_subdoc_example/519aaaaab320153869b175e0',
          params: { resourceName: 'c_subdoc_example', id: '519aaaaab320153869b175e0' },
          body: {
            'surname': 'Anderson',
            'forename': 'John',
            'weight': 124,
            'hairColour': 'Brown',
            'accepted': true,
            'interview': { 'score': 97, 'date': '23 Mar 2013' }
          }
        };
        const mockRes = {
          send: function(data) {
            assert.equal(data.weight, 124);
            assert.equal(data.passwordHash, undefined);
            assert.equal(data.interview.score, 97);
            assert.equal(data.interview.interviewHash, undefined);
            const resource = fngInstance.getResource('c_subdoc_example');
            resource.model.findById('519aaaaab320153869b175e0', function(err, dataOnDisk) {
              if (err) {
                throw err;
              }
              assert.equal(dataOnDisk.weight, 124);
              assert.equal(dataOnDisk.passwordHash, 'top secret');
              assert.equal(dataOnDisk.interview.score, 97);
              assert.equal(dataOnDisk.interview.interviewHash, 'you think I would tell you?');
              done();
            });
          }
        };
        fngInstance.entityPut()(mockReq, mockRes);
      });
    });

    describe('Filtering records', function() {

      let id;

      it('should create a record', function(done) {
        const mockReq = {
          url: '/b_using_options',
          params: { resourceName: 'b_using_options' },
          body: { 'surname': 'TestCreate', 'forename': 'Alice', 'accepted': false },
          ip: '192.168.99.99'
        };
        const mockRes = {
          send: function(data) {
            assert(data._id, 'Must return the id');
            id = data._id;
            assert.equal(data.surname, 'TestCreate');
            assert.equal(data.accepted, false);
            assert.equal(data.ipAddress, '192.168.99.99');
            done();
          }
        };
        fngInstance.collectionPost()(mockReq, mockRes);
      });

      it('should not update a record', function(done) {
        const mockReq = {
          url: '/b_using_options/' + id,
          params: { resourceName: 'b_using_options', id: id },
          body: { 'forename': 'Alfie' }
        };
        const mockRes = {
          status: function(code) {
            assert.strictEqual(code, 404);
            return this;
          },
          send: function(data) {
            assert.equal(data.success, false);
            done();
          }
        };
        fngInstance.entityPut()(mockReq, mockRes);
      });

      it('should not delete a record', function(done) {
        const mockReq = {
          url: '/b_using_options/' + id,
          params: { resourceName: 'b_using_options', id: id }
        };
        const mockRes = {
          status: function(code) {
            assert.strictEqual(code, 404);
            return this;
          },
          send: function(data) {
            assert(!data.success, 'Was allowed to delete document');
            done();
          }
        };
        fngInstance.entityDelete()(mockReq, mockRes);
      });

    });

    describe('Search API', function() {

      it('should find a single match', function(done) {
        const mockReq = {
          url: '/search',
          query: {
            q: 'IsAccepted1'
          }
        };
        const mockRes = {
          status: function(code) {
            assert.strictEqual(code, 200);
            return this;
          },
          send: function(data) {
            assert.equal(data.results.length, 1);
            done();
          }
        };
        fngInstance.searchAll()(mockReq, mockRes);
      });

      it('should find two matches', function(done) {
        const mockReq = {
          url: '/search',
          query: {
            q: 'Test'
          }
        };
        const mockRes = {
          status: function(code) {
            assert.strictEqual(code, 200);
            return this;
          },
          send: function(data) {
            assert.equal(data.results.length, 2);
            done();
          }
        };
        fngInstance.searchAll()(mockReq, mockRes);
      });


      it('should not find records that do not meet find function', function(done) {
        const mockReq = {
          url: '/search',
          query: {
            q: 'Jones'
          }
        };
        const mockRes = {
          send: function(data) {
            assert.equal(data.results.length, 0);
            done();
          }
        };
        fngInstance.searchAll()(mockReq, mockRes);
      });

      it('should not find records indexed on a no-search field', function(done) {
        const mockReq = {
          url: '/search',
          query: {
            q: 'ReportingIndex'
          }
        };
        const mockRes = {
          send: function(data) {
            assert.equal(data.results.length, 0);
            done();
          }
        };
        fngInstance.searchAll()(mockReq, mockRes);
      });


      it('should support searchOrder option', function(done) {
        const mockReq = {
          url: '/search',
          query: {
            q: 'Smi'
          }
        };
        const mockRes = {
          status: function(code) {
            assert.strictEqual(code, 200);
            return this;
          },
          send: function(data) {
            assert.equal(data.results.length, 10);
            assert.equal(data.results[0].text, 'Smith00 John00');
            assert.equal(data.results[9].text, 'Smith10 John10');
            assert.equal(JSON.stringify(data.results).indexOf('John07'), -1);
            done();
          }
        };
        fngInstance.searchAll()(mockReq, mockRes);
      });

      it('should find a record from a partial initial string', function(done) {
        const mockReq = {
          url: '/search',
          query: {
            q: 'ann'
          }
        };
        const mockRes = {
          status: function(code) {
            assert.strictEqual(code, 200);
            return this;
          },
          send: function(data) {
            assert.equal(data.results.length, 1);
            assert.equal(data.results[0].id, '51c583d5b5c51226db418f16');
            assert.equal(data.results[0].resource, 'f_nested_schema');
            assert.equal(data.results[0].resourceText, 'Exams');
            assert.equal(data.results[0].text, 'Smith, Anne');
            done();
          }
        };
        fngInstance.searchAll()(mockReq, mockRes);
      });

      it('should find a record from multiple partial initial strings', function(done) {
        const mockReq = {
          url: '/search',
          query: {
            q: 'smi john04'
          },
          route: { path: '/api/search' }
        };
        const mockRes = {
          status: function(code) {
            assert.strictEqual(code, 200);
            return this;
          },
          send: function(data) {
            assert.notEqual(data.moreCount, 0);
            assert.equal(data.results[0].text, 'Smith04 John04');  // Double hit should come first
            assert.equal(data.results[1].text, 'Smith00 John00');  // normal weighting
            done();
          }
        };
        fngInstance.searchAll()(mockReq, mockRes);
      });

      /*
        Thought about doing this, but decided it would make it too complicated for users
       */
      it.skip('should find only records that match all partial initial strings concatenated by &', function(done) {
        const mockReq = {
          url: '/search',
          query: {
            q: 'smi&john04'
          },
          route: { path: '/api/search' }
        };
        const mockRes = {
          send: function(data) {
            assert.notEqual(data.moreCount, 0);
            assert.equal(data.results.length, 1);
            assert.equal(data.results[0].text, 'Smith04 John04');
            done();
          }
        };
        fngInstance.searchAll()(mockReq, mockRes);
      });

      it('should not repeat a record in the results', function(done) {
        const mockReq = {
          url: '/search',
          query: {
            q: 'smith04 john04'
          },
          route: { path: '/api/search' }
        };
        const mockRes = {
          status: function(code) {
            assert.strictEqual(code, 200);
            return this;
          },
          send: function(data) {
            assert.equal(data.results.length, 1);
            assert.equal(data.results[0].text, 'Smith04 John04');
            done();
          }
        };
        fngInstance.searchAll()(mockReq, mockRes);
      });

      it('should support searchResultFormat option', function(done) {
        const mockReq = {
          url: '/search',
          query: {
            q: 'Br'
          },
          route: { path: '/api/search' }
        };
        const mockRes = {
          status: function(code) {
            assert.strictEqual(code, 200);
            return this;
          },
          send: function(data) {
            assert.equal(data.results.length, 2);
            assert.equal(data.results[0].resourceText, 'Exams');
            assert.equal(data.results[0].resource, 'f_nested_schema');
            assert.equal(data.results[0].text, 'Brown, John');
            done();
          }
        };
        fngInstance.searchAll()(mockReq, mockRes);
      });

      it('will select from a given collection if specified', (done) => {
        const mockReq = {
          url: '/search',
          query: {
            q: 'f_nested_schema:a'
          },
          route: { path: '/api/search' }
        };
        const mockRes = {
          status: function(code) {
            assert.strictEqual(code, 200);
            return this;
          },
          send: function(data) {
            assert.equal(data.results.length, 1);
            assert.equal(data.results[0].resourceText, 'Exams');
            assert.equal(data.results[0].resource, 'f_nested_schema');
            assert.equal(data.results[0].text, 'Smith, Anne');
            done();
          }
        };
        fngInstance.searchAll()(mockReq, mockRes);
      });

      it('will select from a synonym collection if specified', (done) => {
        const mockReq = {
          url: '/search',
          query: {
            q: 'Exams:a'
          },
          route: { path: '/api/search' }
        };
        const mockRes = {
          status: function(code) {
            assert.strictEqual(code, 200);
            return this;
          },
          send: function(data) {
            assert.equal(data.results.length, 1);
            assert.equal(data.results[0].resourceText, ' ');
            assert.equal(data.results[0].resource, 'f_nested_schema');
            assert.equal(data.results[0].text, 'Smith, Anne');
            done();
          }
        };
        fngInstance.searchAll()(mockReq, mockRes);
      });

      it('will select from a filtered synonym collection if specified', (done) => {
        const mockReq = {
          url: '/search',
          query: {
            q: 'Retakes:'
          },
          route: { path: '/api/search' }
        };
        const mockRes = {
          status: function(code) {
            assert.strictEqual(code, 200);
            return this;
          },
          send: function(data) {
            assert.equal(data.results.length, 1);
            assert.equal(data.results[0].resource, 'f_nested_schema');
            assert.equal(data.results[0].text, 'Brown, Jenny');
            assert.equal(data.results[0].resourceText, 'Retakes');
            done();
          }
        };
        fngInstance.searchAll()(mockReq, mockRes);
      });

    });

    describe('MongoDB selection', function() {

      it('Should filter', function(done) {
        const mockReq = {
          url: '/f_nested_schema',
          query: {
            f: '{"exams.subject":"Physics"}'
          },
          params: { resourceName: 'f_nested_schema' }
        };
        const mockRes = {
          send: function(data) {
            assert.equal(data.length, 1);
            done();
          }
        };
        fngInstance.collectionGet()(mockReq, mockRes);
      });

      it('Should aggregate and return appropriate records', function(done) {
        const mockReq = {
          url: '/api/f_nested_schema',
          query: {
            a: '[{"$unwind":"$exams"},{"$sort":{"exams.score":1}},{"$group":{"_id":{"id":"$_id"},"bestSubject":{"$last":"$exams.subject"}}},{"$match":{"bestSubject":"English"}},{"$project":{"_id":"$_id.id"}}]'
          },
          params: { resourceName: 'f_nested_schema' }
        };
        const mockRes = {
          send: function(data) {
            assert.equal(data.length, 2);
            assert.notEqual(null, data.find(function(obj) {
              return obj.forename === 'John'
            }));
            assert.notEqual(null, data.find(function(obj) {
              return obj.forename === 'Jenny'
            }));
            done();
          }
        };
        fngInstance.collectionGet()(mockReq, mockRes);
      });

      it('Should combine aggregation and filtering', function(done) {
        const mockReq = {
          url: '/api/f_nested_schema',
          query: {
            f: '{"_id":"51c583d5b5c51226db418f15"}',
            a: '[{"$unwind":"$exams"},{"$sort":{"exams.score":1}},' +
            '{"$group":{"_id":{"id":"$_id"},"bestSubject":{"$last":"$exams.subject"}}},{"$match":{"bestSubject":"English"}},' +
            '{"$project":{"_id":"$_id.id"}}]'
          },
          params: { resourceName: 'f_nested_schema' }
        };
        const mockRes = {
          send: function(data) {
            assert.equal(data.length, 1);
            assert.equal(data[0].forename, 'John');
            done();
          }
        };
        fngInstance.collectionGet()(mockReq, mockRes);
      });
    });

  });

  describe('List API', function () {

    it('returns explicit list fields', function (done) {
      const mockReq = {
        url: '/api/c_subdoc_example/519aaaaab320153869b175e0/list',
        params: {resourceName: 'c_subdoc_example', id: '519aaaaab320153869b175e0'}
      };
      const mockRes = {
        send: function (data) {
          assert.equal(data.list, 'Anderson John');
          done();
        }
      };
      fngInstance.entityList()(mockReq, mockRes);
    });

    it('returns hidden list fields', function (done) {
      const mockReq = {
        url: '/api/b_using_options/519a6075b320153869b175e0/list',
        params: {resourceName: 'b_using_options', id: '519a6075b320153869b175e0'}
      };
      const mockRes = {
        send: function (data) {
          assert.equal(data.list, 'IsAccepted1 John true 89');
          done();
        }
      };
      fngInstance.entityList()(mockReq, mockRes);
    });

    it('returns first string field if no explicit list fields', function (done) {
      const mockReq = {
        url: '/api/a_unadorned_mongoose/519a6075b320153869b17599/list',
        params: {resourceName: 'a_unadorned_mongoose', id: '519a6075b320153869b17599'}
      };
      const mockRes = {
        send: function (data) {
          assert.equal(data.list, 'TestPerson1');
          done();
        }
      };
      fngInstance.entityList()(mockReq, mockRes);
    });

    it('returns looked up fields', function() {

    });

    it('handles list items in search', function() {

    });

  });

  describe('mongoose collection name API', function () {

    it('returns models', function () {
      const mockReq = null;
      const mockRes = {
        send: function (models) {
          assert.equal(models.length, 11);
          assert(_.find(models, function (resource) {
            return resource.resourceName === 'b_using_options';
          }).options.hide.indexOf('login') > -1, 'must send login as a hidden field');
        }
      };
      fngInstance.models()(mockReq, mockRes);
    });

    it('returns straight schema', function (done) {
      const mockReq = {params : {resourceName: 'a_unadorned_mongoose'}};
      const mockRes = {
        send: function (schema) {
          let keys = Object.keys(schema);
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
      fngInstance.schema()(mockReq, mockRes);
    });

  });

  describe('Report API', function () {

    it('handles pipeline request', function (done) {
      const mockReq = {
        url: '/report/g_conditional_fields',
        query: {r:'{"pipeline":{"$group":{"_id":"x","count":{"$sum":1}}}}'},
        params: {resourceName: 'g_conditional_fields'}
      };
      const mockRes = {
        send: function (data) {
          assert.equal(data.report.length, 1);
          assert.deepEqual(data.report[0], {_id: 'x', count: 17});
          done();
        }
      };
      fngInstance.report()(mockReq, mockRes);
    });

    it('handles complex pipeline request', function (done) {
      const mockReq = {
        url: 'report/e_referencing_another_collection',
        query: {r:'{"pipeline":[{"$group":{"_id":"$teacher","count":{"$' +
          'sum":1}}}],"title":"Class Sizes","columnDefs":[{"field":"_id","displayName":"Teacher"},{"field":"' +
          'count","displayName":"Number in Class"}],"columnTranslations":[{"field":"_id","ref":"b_using_options"}]}'},
        params: {resourceName: 'e_referencing_another_collection'}
      };
      const mockRes = {
        send: function (data) {
          assert.equal(data.report.length, 1);
          assert.deepEqual(data.report[0], {_id: 'IsAccepted2 Johan true 89', count: 1});
          done();
        }
      };
      fngInstance.report()(mockReq, mockRes);
    });

    it('looks up schema and does a simple translate', function (done) {
      const mockReq = {
        url: 'report/g_conditional_fields/breakdownbysex',
        params : {
          resourceName: 'g_conditional_fields',
          reportName: 'breakdownbysex'
        }
      };
      const mockRes = {
        send: function (data) {
          assert.equal(data.report.length, 2);
          assert.deepEqual(data.report[0], {_id: 'Female', count: 11});
          assert.deepEqual(data.report[1], {_id: 'Male', count: 6});
          done();
        }
      };
      fngInstance.report()(mockReq, mockRes);
    });

    it('supports two reference lookups', function (done) {
      const reportSpec = {
        'pipeline': [{'$project': {'surname': 1, 'forename': 1, 'teacher': 1, 'mentor': 1}}],
        'title': 'Class Sizes',
        'columnTranslations': [{'field': 'teacher', 'ref': 'b_using_options'}, {'field': 'mentor', 'ref': 'c_subdoc_example'}]
      };
      const mockReq = {
        url: 'report/e_referencing_another_collection',
        query: {r : JSON.stringify(reportSpec)},
        params: {resourceName: 'e_referencing_another_collection'}
      };
      const mockRes = {
        send: function (data) {
          assert.equal(data.report.length, 1);
          assert.equal(data.report[0].surname, 'Smith');
          assert.equal(data.report[0].forename, 'John');
          assert.equal(data.report[0].teacher, 'IsAccepted2 Johan true 89');
          assert.equal(data.report[0].mentor, 'Anderson John');
          done();
        }
      };
      fngInstance.report()(mockReq, mockRes);
    });

    it('supports functions in column translate', function (done) {
      const mockReq = {
        url: 'report/g_conditional_fields/functiondemo',
        params : {
          resourceName: 'g_conditional_fields',
          reportName: 'functiondemo'
        }
      };
      const mockRes = {
        send: function (data) {
          assert.equal(data.report.length, 2);
          assert.deepEqual(data.report[0], {_id: 'Female', count: 11, functionResult: 21});
          assert.deepEqual(data.report[1], {_id: 'Male', count: 6, functionResult: 16});
          done();
        }
      };
      fngInstance.report()(mockReq, mockRes);
    });

    it('looks up schema and does a table lookup', function (done) {
      const mockReq = {
        url: 'report/e_referencing_another_collection/class-sizes',
        params : {
          resourceName: 'e_referencing_another_collection',
          reportName: 'class-sizes'
        }
      };
      const mockRes = {
        send: function (data) {
          assert.equal(data.report.length, 1);
          assert.deepEqual(data.report[0], {_id: 'IsAccepted2 Johan true 89', count: 1});
          done();
        }
      };
      fngInstance.report()(mockReq, mockRes);
    });

    it('handles invalid lookup table error', function (done) {
      const mockReq = {
        url: 'report/e_referencing_another_collection',
        query: {r: '{"pipeline":[{"$group":{"' +
          '_id":"$teacher","count":{"$sum":1}}}],"title":"Class Sizes","columnDefs' +
          '":[{"field":"_id","displayName":"Teacher"},{"field":"count","displayName":"' +
          'Number in Class"}],"columnTranslations":[{"field":"_id","ref":"b_usissng_options' +
          '"}]}'},
        params : {resourceName: 'g_conditional_fields'}
      };
      const mockRes = {
        send: function (data) {
          assert.equal(data, 'Invalid ref property of b_usissng_options in columnTranslations _id');
          done();
        }
      };
      fngInstance.report()(mockReq, mockRes);
    });

    it('supports selection by text parameter', function (done) {
      const mockReq = {
        url: 'report/g_conditional_fields/totalforonesex',
        params : {
          resourceName: 'g_conditional_fields',
          reportName: 'totalforonesex'
        }
      };
      const mockRes = {
        send: function (data) {
          assert.equal(data.report.length, 1);
          assert.deepEqual(data.report[0], {_id: 'Male', count: 6});
          done();
        }
      };
      fngInstance.report()(mockReq, mockRes);
    });

    it('supports selection by query text parameter', function (done) {
      const mockReq = {
        query: {sex: 'F'},
        url: 'report/g_conditional_fields/totalforonesex',
        params : {
          resourceName: 'g_conditional_fields',
          reportName: 'totalforonesex'
        }
      };
      const mockRes = {
        send: function (data) {
          assert.equal(data.report.length, 1);
          assert.deepEqual(data.report[0], {_id: 'Female', count: 11});
          done();
        }
      };
      fngInstance.report()(mockReq, mockRes);
    });

    it('supports selection by numeric parameter', function (done) {
      const mockReq = {
        url: 'report/g_conditional_fields/selectbynumber',
        query:{
          number_param:11
        },
        params : {
          resourceName: 'g_conditional_fields',
          reportName: 'selectbynumber'
        }
      };
      const mockRes = {
        send: function (data) {
          assert.equal(data.report.length, 1);
          assert.deepEqual(data.report[0], {_id: 'F', count: 11});
          done();
        }
      };
      fngInstance.report()(mockReq, mockRes);
    });

    it('honours findfunc', function (done) {
      const mockReq = {
        url: 'report/b_using_options/allVisible',
        params : {
          resourceName: 'b_using_options',
          reportName: 'allVisible'
        }
      };
      const mockRes = {
        send: function (data) {
          assert.equal(data.report.length, 1);
          assert.deepEqual(data.report[0], {_id: true, count: 2});
          done();
        }
      };
      fngInstance.report()(mockReq, mockRes);
    });

    it('prevents access to secure fields', function (done) {
      const mockReq = {
        url: 'report/b_using_options',
        query: {
          r: '[{"$project":{"passwordHash":true, "surname": true}}]'
        },
        params : {
          resourceName: 'b_using_options'
        }
      };
      const mockRes = {
        send: function (data) {
          assert.equal(data.report.length, 2);
          assert.strictEqual(typeof data.report[0].passwordHash, "undefined");
          assert.notStrictEqual(typeof data.report[0].surname, "undefined");
          assert.strictEqual(typeof data.report[1].passwordHash, "undefined");
          assert.notStrictEqual(typeof data.report[1].surname, "undefined");
          done();
        }
      };
      fngInstance.report()(mockReq, mockRes);
    });

    it('supports lookups where the list item is a lookup', function() {

    });

  });

});
