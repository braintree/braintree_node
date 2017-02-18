'use strict';

require('../../spec_helper');

let braintree = specHelper.braintree;
let Config = require('../../../lib/braintree/config').Config;
let Http = require('../../../lib/braintree/http').Http;
let Environment = require('../../../lib/braintree/environment').Environment;

describe('Http', () =>
  describe('request', function () {
    it('returns a ServerError for 500s', function (done) {
      let http = new Http(new Config(specHelper.defaultConfig));

      http.post('/test/error', '', function (err) {
        assert.equal(err.type, braintree.errorTypes.serverError);

        done();
      });
    });

    it('can hit the sandbox', function (done) {
      let http = new Http(new Config({
        environment: braintree.Environment.Sandbox,
        merchantId: 'node',
        publicKey: 'node',
        privateKey: 'node'
      }));

      return http.get('/not_found', function (err) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);

        done();
      });
    });

    it('can hit production', function (done) {
      let http = new Http(new Config({
        environment: braintree.Environment.Production,
        merchantId: 'node',
        publicKey: 'node',
        privateKey: 'node'
      }));

      return http.get('/not_found', function (err) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);

        done();
      });
    });

    it('returns timeout errors', function (done) {
      let config = new Config({
        environment: new Environment('not_a_subdomain.braintreegateway.com', '12345', false),
        merchantId: 'node',
        publicKey: 'node',
        privateKey: 'node'
      });

      config.timeout = 1;
      let http = new Http(config);

      return http.get('/not_a_real_url', function (err) {
        assert.equal(err.type, braintree.errorTypes.unexpectedError);
        assert.equal(err.message, 'Request timed out');

        done();
      });
    });

    it('returns errors to the callback', function (done) {
      let config = new Config({
        environment: new Environment('not_a_subdomain.braintreegateway.com', '12345', false),
        merchantId: 'node',
        publicKey: 'node',
        privateKey: 'node'
      });
      let http = new Http(config);

      return http.get('/not_a_real_url', function (err) {
        assert.equal(err.type, braintree.errorTypes.unexpectedError);
        assert.match(err.message, /Unexpected request error:/);

        done();
      });
    });
  })
);
