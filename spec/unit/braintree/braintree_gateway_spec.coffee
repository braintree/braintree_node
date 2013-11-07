require('../../spec_helper')

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
