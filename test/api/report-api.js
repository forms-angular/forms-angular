var exec = require('child_process').exec
    , _ = require('underscore')
    , assert = require('assert')
    , mongoose = require('mongoose');

describe('Report API', function () {

    it('handles pipeline request', function(done) {
        exec('curl 0.0.0.0:3001/api/report/g_conditional_fields?r=%7B%22pipeline%22:%7B%22%24group%22:%7B%22_id%22:%22%24sex%22,%22count%22:%7B%22%24sum%22:1%7D%7D%7D%7D', function (error, stdout) {
            var data = JSON.parse(stdout).report;
            assert.equal(data.length, 2);
            assert.deepEqual(data[0],{_id:'F',count:11});
            assert.deepEqual(data[1],{_id:'M',count:6});
            done();
        });
    });

    it('looks up schema and does a simple translate', function(done) {
        exec('curl 0.0.0.0:3001/api/report/g_conditional_fields/breakdownbysex', function (error, stdout) {
            var data = JSON.parse(stdout).report;
            assert.equal(data.length, 2);
            assert.deepEqual(data[0],{_id:'Female',count:11});
            assert.deepEqual(data[1],{_id:'Male',count:6});
            done();
        });
    });

    it('looks up schema and does a table lookup', function(done) {
        exec('curl 0.0.0.0:3001/api/report/e_referencing_another_collection/class-sizes', function (error, stdout) {
            var data = JSON.parse(stdout).report;
            assert.equal(data.length, 1);
            assert.deepEqual(data[0],{_id:'IsAccepted John true 89',count:1});
            done();
        });
    });

});

