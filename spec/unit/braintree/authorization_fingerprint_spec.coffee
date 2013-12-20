require('../../spec_helper')
{AuthorizationFingerprint} = require('../../../lib/braintree/authorization_fingerprint')

describe "AuthorizationFingerprint", ->
  describe "generate", ->
    it "signs the payload with a sha256 hash", ->
      fingerprint = AuthorizationFingerprint.generate("integration_merchant_id", "integration_public_key", "private_key")
      signature = fingerprint.split("|")[0]
      assert.match(signature, /[A-Fa-f0-9]{64}/)

    it "includes the required default values", ->
      fingerprint = AuthorizationFingerprint.generate(
        "integration_merchant_id",
        "integration_public_key",
        "private_key",
        "http://localhost:3000/merchants/integration_merchant_id/client_api",
        "http://auth.venmo.dev"
      )

      assert.include(fingerprint, "merchant_id=integration_merchant_id")
      assert.include(fingerprint, "public_key=integration_public_key")
      assert.match(fingerprint, /created_at=\d+/)
      assert.include(fingerprint, "client_api_url=http://localhost:3000/merchants/integration_merchant_id/client_api")
      assert.include(fingerprint, "auth_url=http://auth.venmo.dev")

    it "can include customer id", ->
      fingerprint = AuthorizationFingerprint.generate(
        "integration_merchant_id",
        "integration_public_key",
        "private_key",
        "http://localhost:3000/merchants/integration_merchant_id/client_api",
        "http://auth.venmo.dev",
        {customerId: "a-customer-id"}
      )

      assert.include(fingerprint, "customer_id=a-customer-id")

    it "can include creditCardOptions", ->
      fingerprint = AuthorizationFingerprint.generate(
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
      )

      assert.include(fingerprint, "credit_card[options][make_default]=true")
      assert.include(fingerprint, "credit_card[options][fail_on_duplicate_payment_method]=true")
      assert.include(fingerprint, "credit_card[options][verify_card]=true")

    it "does not allow you to overrwrite merchant_id, public_key, created_at", ->
      fingerprint = AuthorizationFingerprint.generate(
        "integration_merchant_id",
        "integration_public_key",
        "private_key",
        "http://localhost:3000/merchants/integration_merchant_id/client_api",
        "http://auth.venmo.dev",
        {
          merchant_id: "bad-merchant-id",
          public_key: "bad-merchant-public-key",
          created_at: "bad-time"
        }
      )

      assert.isTrue(fingerprint.indexOf("bad-merchant-id") == -1)
      assert.isTrue(fingerprint.indexOf("bad-merchant-public-key") == -1)
      assert.isTrue(fingerprint.indexOf("bad-time") == -1)
