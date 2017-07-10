'use strict';

let braintree = specHelper.braintree;
let Config = require('../../../lib/braintree/config').Config;
let Http = require('../../../lib/braintree/http').Http;

describe('Http', function () {
  describe('checkHttpStatus', function () {
    it('returns a null for non-error codes => ', function () {
      let http = new Http(new Config(specHelper.defaultConfig));

      return [200, 201, 422].map((response) =>
        assert.equal(http.checkHttpStatus(response), null));
    });

    it('returns an authentication error for 401  => ', function () {
      let http = new Http(new Config(specHelper.defaultConfig));

      assert.equal(http.checkHttpStatus(401).type, braintree.errorTypes.authenticationError);
    });

    it('returns an authorization error for 403  => ', function () {
      let http = new Http(new Config(specHelper.defaultConfig));

      assert.equal(http.checkHttpStatus(403).type, braintree.errorTypes.authorizationError);
    });

    it('returns an not found error for 404  => ', function () {
      let http = new Http(new Config(specHelper.defaultConfig));

      assert.equal(http.checkHttpStatus(404).type, braintree.errorTypes.notFoundError);
    });

    it('returns an upgrade required error for 426  => ', function () {
      let http = new Http(new Config(specHelper.defaultConfig));

      assert.equal(http.checkHttpStatus(426).type, braintree.errorTypes.upgradeRequired);
    });

    it('returns an not found error for 429  => ', function () {
      let http = new Http(new Config(specHelper.defaultConfig));

      assert.equal(http.checkHttpStatus(429).type, braintree.errorTypes.tooManyRequestsError);
    });

    it('returns a down for maintenance error for 500 =>', function () {
      let http = new Http(new Config(specHelper.defaultConfig));

      assert.equal(http.checkHttpStatus(500).type, braintree.errorTypes.serverError);
    });

    it('returns a down for maintenance error for 503 =>', function () {
      let http = new Http(new Config(specHelper.defaultConfig));

      assert.equal(http.checkHttpStatus(503).type, braintree.errorTypes.downForMaintenanceError);
    });
  });

  describe('_headers', function () {
    it('sets Accept-Encoding to gzip', function () {
      let http = new Http(new Config(specHelper.defaultConfig));

      assert.equal(http._headers()['Accept-Encoding'], 'gzip');
    });
  });
});
