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

      baseUrl = "http://localhost:#{process.env['GATEWAY_PORT'] || '3000'}/merchants/integration_merchant_id"
      assert.include(payload, "base_url=#{baseUrl}")
