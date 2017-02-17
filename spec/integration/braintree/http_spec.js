require('../../spec_helper');

let { braintree } = specHelper;
let { Config } = require('../../../lib/braintree/config');
let { Http } = require('../../../lib/braintree/http');
let { Environment } = require('../../../lib/braintree/environment');

describe("Http", () =>
  describe("request", function() {
    it("returns a ServerError for 500s", function(done) {
      let http = new Http(new Config(specHelper.defaultConfig));
      return http.post('/test/error', '', function(err, response) {
        assert.equal(err.type, braintree.errorTypes.serverError);

        return done();
      });
    });

    it("can hit the sandbox", function(done) {

      let http = new Http(new Config({
        environment: braintree.Environment.Sandbox,
        merchantId: 'node',
        publicKey: 'node',
        privateKey: 'node'
      }));

      return http.get('/not_found', function(err, response) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);

        return done();
      });
    });

    it("can hit production", function(done) {

      let http = new Http(new Config({
        environment: braintree.Environment.Production,
        merchantId: 'node',
        publicKey: 'node',
        privateKey: 'node'
      }));

      return http.get('/not_found', function(err, response) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);

        return done();
      });
    });

    it("returns timeout errors", function(done) {
      let config = new Config({
        environment: new Environment('not_a_subdomain.braintreegateway.com', '12345', false),
        merchantId: 'node',
        publicKey: 'node',
        privateKey: 'node'
      });
      config.timeout = 1;
      let http = new Http(config);

      return http.get('/not_a_real_url', function(err, response) {
        assert.equal(err.type, braintree.errorTypes.unexpectedError);
        assert.equal(err.message, 'Request timed out');

        return done();
      });
    });

    return it("returns errors to the callback", function(done) {
      let config = new Config({
        environment: new Environment('not_a_subdomain.braintreegateway.com', '12345', false),
        merchantId: 'node',
        publicKey: 'node',
        privateKey: 'node'
      });
      let http = new Http(config);

      return http.get('/not_a_real_url', function(err, response) {
        assert.equal(err.type, braintree.errorTypes.unexpectedError);
        assert.match(err.message, /Unexpected request error:/);

        return done();
      });
    });
  })
);
