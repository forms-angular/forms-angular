'use strict';

var should = require('should'),
    app = require('../../../server'),
    request = require('supertest');

describe('GET /api/schema/a_unadorned_schema', function() {

  it('should respond with a schema', function(done) {
    request(app)
      .get('/api/schema/a_unadorned_schema')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        JSON.parse(res.text)._id.path.should.be.equal('_id');
        done();
      });
  });
});
