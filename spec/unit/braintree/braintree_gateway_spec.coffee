require('../../spec_helper')
{Environment} = require('../../../lib/braintree/environment')

describe "BraintreeGateway", ->
  describe "generateClientToken", ->
    it "generates a client token", ->
      gateway = specHelper.braintree.connect(specHelper.defaultConfig)
      clientToken = JSON.parse(gateway.generateClientToken())
      fingerprintParts = clientToken.authorization_fingerprint.split("|")

      signature = fingerprintParts[0]
      payload = fingerprintParts[1]

      assert.isNotNull(signature)

      clientApiUrl = "http://localhost:#{process.env['GATEWAY_PORT'] || '3000'}/merchants/integration_merchant_id/client_api"
      authUrl = "http://auth.venmo.dev:4567"
      assert.equal(clientToken.client_api_url, clientApiUrl)
      assert.equal(clientToken.auth_url, authUrl)
