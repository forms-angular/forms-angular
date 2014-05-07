'use strict';

var exec = require('child_process').exec,
  _ = require('underscore'),
  assert = require('assert'),
  mongoose = require('mongoose'),
  cSubdocExample = require('./../../server/models/c_subdoc_example');

describe('Read Data API', function () {

  var aData, bData;

  before(function (done) {
    exec('curl 0.0.0.0:3001/api/a_unadorned_mongoose',
      function (error, stdout) {
        if (error) {
          throw new Error('curl a failed');
        }
        aData = JSON.parse(stdout);
        exec('curl 0.0.0.0:3001/api/b_using_options',
          function (error, stdout) {
            if (error) {
              throw new Error('curl b failed');
            }
            bData = JSON.parse(stdout);
            done();
          });
      });
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

describe('Update Data API', function () {

  it('should create/update/delete a record calling onCleanseRequestSync()', function (done) {
    // create
    exec('curl -X POST -H "Content-Type: application/json" -d \'{"surname":"TestCreate","accepted":false}\' http://0.0.0.0:3001/api/b_using_options',
      function (error, stdout) {
        if (error) {
          throw new Error('curl b failed');
        }
        var bData = JSON.parse(stdout);
        assert.equal(bData.surname, 'TestCreate');
        assert.equal(bData.ipAddress, '127.0.0.1');    // onCleanseRequestSync
        var id = bData._id;
        // update
        exec('curl -X POST -H "Content-Type: application/json" -d \'{"forename":"Alfie"}\' http://0.0.0.0:3001/api/b_using_options/' + id,
          function (error, stdout) {
            if (error) {
              throw new Error('curl b2 failed');
            }
            bData = JSON.parse(stdout);
            assert.equal(bData.forename, 'Alfie');
            // delete
            exec('curl -X DELETE http://0.0.0.0:3001/api/b_using_options/' + id,
              function (error, stdout) {
                if (error) {
                  throw new Error('curl b3 failed');
                }
                bData = JSON.parse(stdout);
                assert(bData.success);
                done();
              }
            );
          }
        );
      }
    );
  });

  it.skip('should update a date field, and support date fields in ?f= and ?a= queries', function (done) {
    exec('curl 0.0.0.0:3001/api/a_unadorned_mongoose/519a6075b320153869b17599',
      function (error, stdout) {
        if (error) {
          throw new Error('curl a(date) failed');
        }
        var aData = JSON.parse(stdout);
        assert.equal(aData.surname, 'TestPerson1');
        aData.dateOfBirth = new Date(1998, 10, 4);
        exec('curl -X POST -H "Content-Type: application/json" -d \'' + JSON.stringify(aData) + '\' http://0.0.0.0:3001/api/a_unadorned_mongoose/519a6075b320153869b17599',
          function (error, stdout) {
            if (error) {
              throw new Error('curl a2(date) failed');
            }
            aData = JSON.parse(stdout);
            assert.equal(aData.dateOfBirth, '1998-11-04T00:00:00.000Z');
            // 0.0.0.0:3001/#/a_unadorned_mongoose?f={"dateOfBirth":"1998-11-04"}
            exec('curl 0.0.0.0:3001/api/a_unadorned_mongoose?f=%7B%22dateOfBirth%22%3A%221998-11-04%22%7D',
              function (error, stdout) {
                if (error) {
                  throw new Error('curl a3(date) failed');
                }
                aData = JSON.parse(stdout);
                assert.equal(aData.length, 1);
                assert.equal(aData[0].surname, 'TestPerson1');
//            http://0.0.0.0:3001/#/a_unadorned_mongoose?a=[{"$match":{22dateOfBirth%22%3A%221998-11-04%22%}},{"$project":{"surname":1}}]
                exec('curl 0.0.0.0:3001/api/a_unadorned_mongoose?a=%5B%7B  7D%5D',
                  function (error, stdout) {
                    if (error) {
                      throw new Error('curl a4(date) failed');
                    }
                    aData = JSON.parse(stdout);
                    assert.equal(aData.length, 1);
                    assert.equal(aData[0].surname, 'TestPerson1');
                    done();
                  }
                );
              }
            );
          }
        );
      }
    );
  });
});

describe('Search API', function () {

  it('should find a single match', function (done) {
    exec('curl 0.0.0.0:3001/api/search?q=IsA',
      function (error, stdout) {
        if (error) {
          throw new Error('curl failed');
        }
        var aData = JSON.parse(stdout);
        assert.equal(aData.results.length, 1);
        done();
      });
  });

  it('should find two matches', function (done) {
    exec('curl 0.0.0.0:3001/api/search?q=Test',
      function (error, stdout) {
        if (error) {
          throw new Error('curl failed');
        }
        var aData = JSON.parse(stdout);
        assert.equal(aData.results.length, 2);
        done();
      });
  });

  it('should not find records that do not meet find function', function (done) {
    exec('curl 0.0.0.0:3001/api/search?q=Not',
      function (error, stdout) {
        if (error) {
          throw new Error('curl failed');
        }
        var aData = JSON.parse(stdout);
        assert.equal(aData.results.length, 0);
        done();
      });
  });

  it('should not find records indexed on a no-search field', function (done) {
    exec('curl 0.0.0.0:3001/api/search?q=ReportingIndex',
      function (error, stdout) {
        if (error) {
          throw new Error('curl failed');
        }
        var aData = JSON.parse(stdout);
        assert.equal(aData.results.length, 0);
        done();
      });
  });

  it('should support searchOrder option', function (done) {
    exec('curl 0.0.0.0:3001/api/search?q=Smi',
      function (error, stdout) {
        if (error) {
          throw new Error('curl failed');
        }
        var aData = JSON.parse(stdout);
        assert.equal(aData.results.length, 10);
        assert.equal(aData.results[0].text, 'Smith00 John00');
        assert.equal(aData.results[9].text, 'Smith10 John10');
        assert.equal(JSON.stringify(aData.results).indexOf('John07'), -1);
        done();
      });
  });

  it('should find a record from a partial initial string', function (done) {
    exec('curl 0.0.0.0:3001/api/search?q=ann',
      function (error, stdout) {
        if (error) {
          throw new Error('curl failed');
        }
        var aData = JSON.parse(stdout);
        assert.equal(aData.results.length, 1);
        assert.equal(aData.results[0].id, '51c583d5b5c51226db418f16');
        assert.equal(aData.results[0].resource, 'f_nested_schema');
        assert.equal(aData.results[0].resourceText, 'Exams');
        assert.equal(aData.results[0].text, 'Smith, Anne');
        done();
      });
  });

  it('should find a record from multiple partial initial strings', function (done) {
    exec('curl 0.0.0.0:3001/api/search?q=smi%20john04',
      function (error, stdout) {
        if (error) {
          throw new Error('curl failed');
        }
        var aData = JSON.parse(stdout);
        assert.notEqual(aData.moreCount, 0);
        assert.equal(aData.results[0].text, 'Smith04 John04');  // Double hit
        assert.equal(aData.results[1].text, 'Smith00 John00');  // normal weighting
        done();
      });
  });


  it('should support searchResultFormat option', function () {
    exec('curl 0.0.0.0:3001/api/search?q=Br',
      function (error, stdout) {
        if (error) {
          throw new Error('curl failed');
        }
        var aData = JSON.parse(stdout);
        assert.equal(aData.results.length, 2);
        assert.equal(aData.results[0].resourceText, 'Exams');
        assert.equal(aData.results[0].resource, 'f_nested_schema');
        assert.equal(aData.results[0].text, 'Brown, John');
      });
  });

});

describe('Models API', function () {

  var aData;

  before(function (done) {
    exec('curl 0.0.0.0:3001/api/models',
      function (error, stdout) {
        if (error) {
          throw new Error('curl a failed');
        }
        aData = JSON.parse(stdout);
        done();
      });
  });

  it('should send at least two records', function () {
    assert(aData.length >= 2);
  });

  it('should send login as a hidden field in b_using_options', function () {
    assert(_.find(aData, function (resource) {
      return resource.resourceName === 'b_using_options';
    }).options.hide.indexOf('login') > -1, 'must send login as a hidden field');
  });
});

describe('MongoDB selection API', function () {

  it('Should filter', function (done) {
    exec('curl 0.0.0.0:3001/api/f_nested_schema?f=%7B%22exams.subject%22:%22Physics%22%7D', function (err, stdout) {
      if (err) {
        throw new Error('curl f with filter failed');
      }
      var data = JSON.parse(stdout);
      assert.equal(data.length, 1);
      done();
    });
  });

  it('Should aggregate and return appropriate records', function (done) {
    exec('curl 0.0.0.0:3001/api/f_nested_schema?a=%5B%7B%22%24unwind%22%3A%22%24exams%22%7D%2C%7B%22%24sort%22%3A%7B%22exams.score' +
        '%22%3A1%7D%7D%2C%7B%22%24group%22%3A%7B%22_id%22%3A%7B%22id%22%3A%22%24_id%22%7D%2C%22bestSubject%22%3A%7B%22%24last' +
        '%22%3A%22%24exams.subject%22%7D%7D%7D%2C%7B%22%24match%22%3A%7B%22bestSubject%22%3A%22English%22%7D%7D%2C%7B%22%24project' +
        '%22%3A%7B%22_id%22%3A%22%24_id.id%22%7D%7D%5D', function (err, stdout) {
      if (err) {
        throw new Error('curl f with aggregation failed');
      }
      var data = JSON.parse(stdout);
      assert.equal(data.length, 2);
      assert.equal(data[0].forename, 'John');
      assert.equal(data[1].forename, 'Jenny');
      done();
    });
  });

  it('Should combine aggregation and filtering', function (done) {
    exec('curl 0.0.0.0:3001/api/f_nested_schema?f=%7B%22_id%22:%2251c583d5b5c51226db418f15%22%7D&a=%5B%7B%22%24unwind%22%3A%22%24exams' +
        '%22%7D%2C%7B%22%24sort%22%3A%7B%22exams.score%22%3A1%7D%7D%2C%7B%22%24group%22%3A%7B%22_id%22%3A%7B%22id%22%3A%22%24_id%22%7D%2C%22' +
        'bestSubject%22%3A%7B%22%24last%22%3A%22%24exams.subject%22%7D%7D%7D%2C%7B%22%24match%22%3A%7B%22bestSubject%22%3A%22English' +
        '%22%7D%7D%2C%7B%22%24project%22%3A%7B%22_id%22%3A%22%24_id.id%22%7D%7D%5D', function (err, stdout) {
      if (err) {
        throw new Error('curl f with aggregation and filter failed');
      }
      var data = JSON.parse(stdout);
      assert.equal(data.length, 1);
      assert.equal(data[0].forename, 'John');
      done();
    });
  });

});

describe('Secure fields', function () {

  before(function (done) {
    mongoose.connect('mongodb://localhost/forms-ng_test');
    done();
  });

  after(function () {
    mongoose.connection.close();
  });

  it('should not be transmitted', function (done) {
    exec('curl 0.0.0.0:3001/api/c_subdoc_example', function (err, stdout) {
      if (err) {
        throw new Error('curl c_subdoc_example failed');
      }
      var data = JSON.parse(stdout);
      assert.equal(data.length, 2);
      assert.equal(data[0].surname, 'Anderson');
      assert.equal(data[0].passwordHash, undefined);
      assert.notEqual(data[0].interview.score, undefined);
      assert.equal(data[0].interview.interviewHash, undefined);
      done();
    });
  });

  it('should not be overwritten', function (done) {
    exec('curl -X POST -H "Content-Type: application/json" -d \'{"surname" : "Anderson", "forename" : "John", "weight" : 124, ' +
        '"hairColour" : "Brown", "accepted" : true, "interview" : { "score" : 97, "date" : "23 Mar 2013" } }\' ' +
        'http://0.0.0.0:3001/api/c_subdoc_example/519aaaaab320153869b175e0', function (err, stdout) {
      if (err) {
        throw new Error('curl c_subdoc_example write failed');
      }
      var data = JSON.parse(stdout);
      assert.equal(data.weight, 124);
      cSubdocExample.findById('519aaaaab320153869b175e0', function (err, realRecord) {
        assert.equal(realRecord.weight, 124);
        assert.equal(realRecord.passwordHash, 'top secret');
        assert.equal(realRecord.interview.score, 97);
        assert.equal(realRecord.interview.interviewHash, 'you think I would tell you?');
        done();
      });
    });
  });

});

// http://0.0.0.0:3001/api/a_unadorned_mongoose?a=%5B%7B%22%24match%22:%7B%22dateOfBirth%22:%221998-11-04%22%7D%7D,%7B%22$project%22:%7B%22surname%22:1%7D%7D%5D