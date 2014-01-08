require('../../spec_helper')
{Environment} = require('../../../lib/braintree/environment')

describe "BraintreeGateway", ->
  describe "generateAuthorizationInfo", ->
    it "generates a fingerprint", ->
      gateway = specHelper.braintree.connect(specHelper.defaultConfig)
      authInfo = JSON.parse(gateway.generateAuthorizationInfo())
      fingerprintParts = authInfo.fingerprint.split("|")

      signature = fingerprintParts[0]
      payload = fingerprintParts[1]

      assert.isNotNull(signature)

      clientApiUrl = "http://localhost:#{process.env['GATEWAY_PORT'] || '3000'}/merchants/integration_merchant_id/client_api"
      authUrl = "http://auth.venmo.dev:4567"
      assert.equal(authInfo.client_api_url, clientApiUrl)
      assert.equal(authInfo.auth_url, authUrl)
