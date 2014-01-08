require('../../spec_helper')
{AuthorizationInfo} = require('../../../lib/braintree/authorization_info')

describe "AuthorizationInfo", ->
  describe "generate", ->
    it "signs the payload with a sha256 hash", ->
      authInfo = AuthorizationInfo.generate("integration_merchant_id", "integration_public_key", "private_key")
      signature = JSON.parse(authInfo).fingerprint.split("|")[0]
      assert.match(signature, /[A-Fa-f0-9]{64}/)

    it "includes the required default values", ->
      rawAuthInfo = AuthorizationInfo.generate(
        "integration_merchant_id",
        "integration_public_key",
        "private_key",
        "http://the.client.api.url",
        "http://the.auth.url"
      )
      authInfo = JSON.parse(rawAuthInfo)

      assert.include(authInfo.fingerprint, "public_key=integration_public_key")
      assert.match(authInfo.fingerprint, /created_at=\d+/)
      assert.equal(authInfo.client_api_url, "http://the.client.api.url")
      assert.equal(authInfo.auth_url, "http://the.auth.url")

    it "can include customer id", ->
      fingerprint = JSON.parse(AuthorizationInfo.generate(
        "integration_merchant_id",
        "integration_public_key",
        "private_key",
        "http://localhost:3000/merchants/integration_merchant_id/client_api",
        "http://auth.venmo.dev",
        {customerId: "a-customer-id"}
      )).fingerprint

      assert.include(fingerprint, "customer_id=a-customer-id")

    it "can include creditCardOptions", ->
      fingerprint = JSON.parse(AuthorizationInfo.generate(
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
      )).fingerprint

      assert.include(fingerprint, "credit_card[options][make_default]=true")
      assert.include(fingerprint, "credit_card[options][fail_on_duplicate_payment_method]=true")
      assert.include(fingerprint, "credit_card[options][verify_card]=true")

    it "does not allow you to overrwrite merchant_id, public_key, created_at", ->
      fingerprint = JSON.parse(AuthorizationInfo.generate(
        "integration_merchant_id",
        "integration_public_key",
        "private_key",
        "http://localhost:3000/merchants/integration_merchant_id/client_api",
        "http://auth.venmo.dev",
        {
          public_key: "bad-merchant-public-key",
          created_at: "bad-time"
        }
      )).fingerprint

      assert.isTrue(fingerprint.indexOf("bad-merchant-public-key") == -1)
      assert.isTrue(fingerprint.indexOf("bad-time") == -1)
