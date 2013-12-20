require("../../spec_helper")
{Environment} = require('../../../lib/braintree/environment')

describe "Environment", ->
  describe "baseUrl", ->
    it "generates a base url with proper scheme and port", ->
      env = new Environment(
        'test.domain',
        '3001',
        'http://auth.venmo.dev',
        false
      )
      assert.equal("http://test.domain", env.baseUrl())

    it "uses https if ssl is true", ->
      env = new Environment(
        'test.domain',
        '3001',
        'http://auth.venmo.dev',
        true
      )
      assert.equal("https://test.domain", env.baseUrl())

    it "includes the port for the Development environment", ->
      baseUrl = "http://localhost:#{process.env['GATEWAY_PORT'] || '3000'}"
      assert.equal(baseUrl, Environment.Development.baseUrl())
