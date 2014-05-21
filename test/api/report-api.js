'use strict';

var exec = require('child_process').exec,
  assert = require('assert');

describe('Report API', function () {

  it('handles pipeline request', function (done) {
    exec('curl 0.0.0.0:3001/api/report/g_conditional_fields?r=%7B%22pipeline%22:%7B%22%24group%22:%7B%22_id%22:%22%24sex%22,%22count%22:%7B%22%24sum%22:1%7D%7D%7D%7D', function (error, stdout) {
      var data = JSON.parse(stdout).report;
      assert.equal(data.length, 2);
      assert.deepEqual(data[0], {_id: 'F', count: 11});
      assert.deepEqual(data[1], {_id: 'M', count: 6});
      done();
    });
  });

  it('handles complex pipeline request', function (done) {
    exec('curl 0.0.0.0:3001/api/report/e_referencing_another_collection?r=%7B%22pipeline%22:%5B%7B%22%24group%22:%7B%22_id%22:%22%24teacher%22,%22count%22:%7B%22%24' +
        'sum%22:1%7D%7D%7D%5D,%22title%22:%22Class%20Sizes%22,%22columnDefs%22:%5B%7B%22field%22:%22_id%22,%22displayName%22:%22Teacher%22%7D,%7B%22field%22:%22' +
        'count%22,%22displayName%22:%22Number%20in%20Class%22%7D%5D,%22columnTranslations%22:%5B%7B%22field%22:%22_id%22,%22ref%22:%22b_using_options%22%7D%5D%7D', function (error, stdout) {
      var data = JSON.parse(stdout).report;
      assert.equal(data.length, 1);
      assert.deepEqual(data[0], {_id: 'IsAccepted John true 89', count: 1});
      done();
    });
  });

  it('looks up schema and does a simple translate', function (done) {
    exec('curl 0.0.0.0:3001/api/report/g_conditional_fields/breakdownbysex', function (error, stdout) {
      var data = JSON.parse(stdout).report;
      assert.equal(data.length, 2);
      assert.deepEqual(data[0], {_id: 'Female', count: 11});
      assert.deepEqual(data[1], {_id: 'Male', count: 6});
      done();
    });
  });

  it('supports functions in column translate', function (done) {
    exec('curl 0.0.0.0:3001/api/report/g_conditional_fields/functiondemo', function (error, stdout) {
      var data = JSON.parse(stdout).report;
      assert.equal(data.length, 2);
      assert.deepEqual(data[0], {_id: 'Female', count: 11, functionResult: 21});
      assert.deepEqual(data[1], {_id: 'Male', count: 6, functionResult: 16});
      done();
    });
  });

  it('looks up schema and does a table lookup', function (done) {
    exec('curl 0.0.0.0:3001/api/report/e_referencing_another_collection/class-sizes', function (error, stdout) {
      var data = JSON.parse(stdout).report;
      assert.equal(data.length, 1);
      assert.deepEqual(data[0], {_id: 'IsAccepted John true 89', count: 1});
      done();
    });
  });

  it('handles invalid lookup table error', function (done) {
    exec('curl 0.0.0.0:3001/api/report/e_referencing_another_collection?r=%7B%22pipeline%22:%5B%7B%22%24group%22:%7B%22' +
        '_id%22:%22%24teacher%22,%22count%22:%7B%22%24sum%22:1%7D%7D%7D%5D,%22title%22:%22Class%20Sizes%22,%22columnDefs' +
        '%22:%5B%7B%22field%22:%22_id%22,%22displayName%22:%22Teacher%22%7D,%7B%22field%22:%22count%22,%22displayName%22:%22' +
        'Number%20in%20Class%22%7D%5D,%22columnTranslations%22:%5B%7B%22field%22:%22_id%22,%22ref%22:%22b_usissng_options' +
        '%22%7D%5D%7D', function (error, stdout) {
      assert.equal(stdout, 'Invalid ref property of b_usissng_options in columnTranslations _id');
      done();
    });
  });

  it('supports selection by text parameter', function (done) {
    exec('curl 0.0.0.0:3001/api/report/g_conditional_fields/totalforonesex', function (error, stdout) {
      var data = JSON.parse(stdout).report;
      assert.equal(data.length, 1);
      assert.deepEqual(data[0], {_id: 'Male', count: 6});
      done();
    });
  });

  it('supports selection by query text parameter', function (done) {
    exec('curl 0.0.0.0:3001/api/report/g_conditional_fields/totalforonesex?sex=F', function (error, stdout) {
      var data = JSON.parse(stdout).report;
      assert.equal(data.length, 1);
      assert.deepEqual(data[0], {_id: 'Female', count: 11});
      done();
    });
  });

  it('supports selection by numeric parameter', function (done) {
    exec('curl 0.0.0.0:3001/api/report/g_conditional_fields/selectbynumber?number_param=11', function (error, stdout) {
      var data = JSON.parse(stdout).report;
      assert.equal(data.length, 1);
      assert.deepEqual(data[0], {_id: 'F', count: 11});
      done();
    });
  });

  it('honours findfunc', function (done) {
    exec('curl 0.0.0.0:3001/api/report/b_using_options/allVisible', function (error, stdout) {
      var data = JSON.parse(stdout).report;
      assert.equal(data.length, 1);
      assert.deepEqual(data[0], {_id: true, count: 2});
      done();
    });
  });

  it('prevents access to secure fields', function (done) {
    exec('curl 0.0.0.0:3001/api/report/b_using_options?r=%5B%7B%22$project%22:%7B%22passwordHash%22:1%7D%7D%5D', function (error, stdout) {
      assert.equal(stdout, 'You cannot access passwordHash');
      done();
    });
  });
});

