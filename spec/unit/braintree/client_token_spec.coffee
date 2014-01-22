require('../../spec_helper')
{ClientToken} = require('../../../lib/braintree/client_token')

describe "ClientToken", ->
  describe "generate", ->
    it "signs the payload with a sha256 hash", ->
      clientToken = ClientToken.generate("integration_merchant_id", "integration_public_key", "private_key")
      signature = JSON.parse(clientToken).authorization_fingerprint.split("|")[0]
      assert.match(signature, /[A-Fa-f0-9]{64}/)

    it "includes the required default values", ->
      rawClientToken = ClientToken.generate(
        "integration_merchant_id",
        "integration_public_key",
        "private_key",
        "http://the.client.api.url",
        "http://the.auth.url"
      )
      clientToken = JSON.parse(rawClientToken)

      assert.include(clientToken.authorization_fingerprint, "public_key=integration_public_key")
      assert.match(clientToken.authorization_fingerprint, /created_at=\d+/)
      assert.equal(clientToken.client_api_url, "http://the.client.api.url")
      assert.equal(clientToken.auth_url, "http://the.auth.url")

    it "can include customer id", ->
      authorizationFingerprint = JSON.parse(ClientToken.generate(
        "integration_merchant_id",
        "integration_public_key",
        "private_key",
        "http://localhost:3000/merchants/integration_merchant_id/client_api",
        "http://auth.venmo.dev",
        {customerId: "a-customer-id"}
      )).authorization_fingerprint

      assert.include(authorizationFingerprint, "customer_id=a-customer-id")

    it "can include creditCardOptions", ->
      authorizationFingerprint = JSON.parse(ClientToken.generate(
        "integration_merchant_id",
        "integration_public_key",
        "private_key",
        "http://localhost:3000/merchants/integration_merchant_id/client_api",
        "http://auth.venmo.dev",
        {
          makeDefault: true,
          failOnDuplicatePaymentMethod: true,
          verifyCard: true
        }
      )).authorization_fingerprint

      assert.include(authorizationFingerprint, "credit_card[options][make_default]=true")
      assert.include(authorizationFingerprint, "credit_card[options][fail_on_duplicate_payment_method]=true")
      assert.include(authorizationFingerprint, "credit_card[options][verify_card]=true")

    it "does not allow you to overrwrite merchant_id, public_key, created_at", ->
      authorizationFingerprint = JSON.parse(ClientToken.generate(
        "integration_merchant_id",
        "integration_public_key",
        "private_key",
        "http://localhost:3000/merchants/integration_merchant_id/client_api",
        "http://auth.venmo.dev",
        {
          public_key: "bad-merchant-public-key",
          created_at: "bad-time"
        }
      )).authorization_fingerprint

      assert.isTrue(authorizationFingerprint.indexOf("bad-merchant-public-key") == -1)
      assert.isTrue(authorizationFingerprint.indexOf("bad-time") == -1)
