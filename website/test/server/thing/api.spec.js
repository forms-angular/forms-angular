'use strict';

const assert = require('assert');
const app = require('../../../server');
const request = require('supertest');

describe('GET /api/schema/a_unadorned_schema', function() {

  it('should respond with a schema', function(done) {
    request(app)
      .get('/api/schema/a_unadorned_schema')
      .expect(200)
      .end(function(err, res) {
        if (err) {
            return done(err);
        }
        assert.strictEqual(JSON.parse(res.text)._id.path, '_id');
        done();
      });
  });
});
