require('../../spec_helper')

braintree = specHelper.braintree
{Config} = require('../../../lib/braintree/config')
{Http} = require('../../../lib/braintree/http')

describe "Http", ->
  describe "checkHttpStatus", ->
    it "returns a null for non-error codes => ", ->
      http = new Http(new Config(specHelper.defaultConfig))

      for response in [200, 201, 422]
        assert.equal(http.checkHttpStatus(response), null)

    it "returns an authentication error for 401  => ", ->
      http = new Http(new Config(specHelper.defaultConfig))
      assert.equal(http.checkHttpStatus(401).type, braintree.errorTypes.authenticationError)

    it "returns an authorization error for 403  => ", ->
      http = new Http(new Config(specHelper.defaultConfig))
      assert.equal(http.checkHttpStatus(403).type, braintree.errorTypes.authorizationError)

    it "returns an not found error for 404  => ", ->
      http = new Http(new Config(specHelper.defaultConfig))
      assert.equal(http.checkHttpStatus(404).type, braintree.errorTypes.notFoundError)

    it "returns an upgrade required error for 426  => ", ->
      http = new Http(new Config(specHelper.defaultConfig))
      assert.equal(http.checkHttpStatus(426).type, braintree.errorTypes.upgradeRequired)

    it "returns a server error for 500 =>", ->
      http = new Http(new Config(specHelper.defaultConfig))
      assert.equal(http.checkHttpStatus(500).type, braintree.errorTypes.serverError)

    it "returns a down for maintenance error for 503 =>", ->
      http = new Http(new Config(specHelper.defaultConfig))
      assert.equal(http.checkHttpStatus(503).type, braintree.errorTypes.downForMaintenanceError)
