require('../../spec_helper')
{Environment} = require('../../../lib/braintree/environment')

describe "BraintreeGateway", ->
  describe "generateAuthorizationFingerprint", ->
    it "generates a fingerprint", ->
      gateway = specHelper.braintree.connect(specHelper.defaultConfig)
      fingerprint = gateway.generateAuthorizationFingerprint()
      fingerprintParts = fingerprint.split("|")

      signature = fingerprintParts[0]
      payload = fingerprintParts[1]

      assert.isNotNull(signature)
      assert.include(payload, "merchant_id=integration_merchant_id")

      clientApiUrl = "http://localhost:#{process.env['GATEWAY_PORT'] || '3000'}/merchants/integration_merchant_id/client_api"
      authUrl = "http://auth.venmo.dev:4567"
      assert.include(payload, "client_api_url=#{clientApiUrl}")
      assert.include(payload, "auth_url=#{authUrl}")
