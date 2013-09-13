var exec = require('child_process').exec
    , _ = require('underscore')
    , assert = require('assert')
    , mongoose = require('mongoose');

describe('Report API', function () {

    it('handles pipeline request', function() {
        exec('curl 0.0.0.0:3001/api/g_conditional_fields?p=%7B%22%24group%22:%7B%22_id%22:%22%24sex%22,%22count%22:%7B%22%24sum%22:1%7D%7D%7D', function (error, stdout) {
            var data = JSON.parse(stdout);
            assert.equal(data.length, 2);
            assert.equal(data[0],{_id:'F',count:11});
            assert.equal(data[1],{_id:'M',count:6});
        });
    });

});

