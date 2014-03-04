{ValidationErrorCodes} = require('../../../lib/braintree/validation_error_codes')
{WebhookNotification} = require('../../../lib/braintree')
{errorTypes} = require('../../../lib/braintree')

describe "WebhookNotificationGateway", ->
  describe "verify", ->
    it "creates a verification string for the challenge", ->
      result = specHelper.defaultGateway.webhookNotification.verify("verification_token")

      assert.equal(result, "integration_public_key|c9f15b74b0d98635cd182c51e2703cffa83388c3")

  describe "sampleNotification", ->
    it "returns a parsable signature and payload", (done) ->
      {signature, payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.SubscriptionWentPastDue,
        "my_id"
      )

      specHelper.defaultGateway.webhookNotification.parse signature, payload, (err, webhookNotification) ->
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.SubscriptionWentPastDue)
        assert.equal(webhookNotification.subscription.id, "my_id")
        assert.ok(webhookNotification.timestamp?)
        done()

    it "returns an errback with InvalidSignatureError when signature is invalid", (done) ->
      {signature, payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.SubscriptionWentPastDue,
        "my_id"
      )

      specHelper.defaultGateway.webhookNotification.parse "bad_signature", payload, (err, webhookNotification) ->
        assert.equal(err.type, errorTypes.invalidSignatureError)
        done()

    it "returns an errback with InvalidSignatureError when the public key is modified", (done) ->
      {signature, payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.SubscriptionWentPastDue,
        "my_id"
      )

      specHelper.defaultGateway.webhookNotification.parse "bad#{signature}", payload, (err, webhookNotification) ->
        assert.equal(err.type, errorTypes.invalidSignatureError)
        done()

    it "returns an errback with InvalidSignatureError when the signature is modified", (done) ->
      {signature, payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.SubscriptionWentPastDue,
        "my_id"
      )

      specHelper.defaultGateway.webhookNotification.parse "#{signature}bad", payload, (err, webhookNotification) ->
        assert.equal(err.type, errorTypes.invalidSignatureError)
        done()

    it "returns a parsable signature and payload for merchant account approvals", (done) ->
      {signature, payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.SubMerchantAccountApproved,
        "my_id"
      )

      specHelper.defaultGateway.webhookNotification.parse signature, payload, (err, webhookNotification) ->
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.SubMerchantAccountApproved)
        assert.equal(webhookNotification.merchantAccount.id, "my_id")
        assert.ok(webhookNotification.timestamp?)
        done()

    it "returns a parsable signature and payload for merchant account declines", (done) ->
      {signature, payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.SubMerchantAccountDeclined,
        "my_id"
      )

      specHelper.defaultGateway.webhookNotification.parse signature, payload, (err, webhookNotification) ->
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.SubMerchantAccountDeclined)
        assert.equal(webhookNotification.merchantAccount.id, "my_id")
        assert.equal(webhookNotification.errors.for("merchantAccount").on("base")[0].code, ValidationErrorCodes.MerchantAccount.ApplicantDetails.DeclinedOFAC)
        assert.equal(webhookNotification.message, "Credit score is too low")
        assert.ok(webhookNotification.timestamp?)
        done()

    it "returns a parsable signature and payload for disbursed transaction", (done) ->
      {signature, payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.TransactionDisbursed,
        "my_id"
      )

      specHelper.defaultGateway.webhookNotification.parse signature, payload, (err, webhookNotification) ->
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.TransactionDisbursed)
        assert.equal(webhookNotification.transaction.id, "my_id")
        assert.equal(webhookNotification.transaction.amount, '100')
        assert.ok(webhookNotification.transaction.disbursementDetails.disbursementDate?)
        done()

    it "returns a parsable signature and payload for a disbursed webhook", (done) ->
      {signature, payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.Disbursement,
        "my_id"
      )

      specHelper.defaultGateway.webhookNotification.parse signature, payload, (err, webhookNotification) ->
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.Disbursement)
        assert.equal(webhookNotification.disbursement.id, "my_id")
        assert.equal(webhookNotification.disbursement.amount, "100.00")
        assert.equal(webhookNotification.disbursement.transactionIds[0], "afv56j")
        assert.equal(webhookNotification.disbursement.transactionIds[1], "kj8hjk")
        assert.equal(webhookNotification.disbursement.success, true)
        assert.equal(webhookNotification.disbursement.retry, false)
        assert.equal(webhookNotification.disbursement.disbursementDate, "2014-02-10")
        assert.equal(webhookNotification.disbursement.merchantAccount.id, "merchant_account_token")
        assert.equal(webhookNotification.disbursement.merchantAccount.currencyIsoCode, "USD")
        assert.equal(webhookNotification.disbursement.merchantAccount.subMerchantAccount, false)
        assert.equal(webhookNotification.disbursement.merchantAccount.status, "active")

        done()

    it "returns a parsable signature and payload for disbursement exception webhook", (done) ->
      {signature, payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.DisbursementException,
        "my_id"
      )

      specHelper.defaultGateway.webhookNotification.parse signature, payload, (err, webhookNotification) ->
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.DisbursementException)
        assert.equal(webhookNotification.disbursement.id, "my_id")
        assert.equal(webhookNotification.disbursement.amount, "100.00")
        assert.equal(webhookNotification.disbursement.transactionIds[0], "afv56j")
        assert.equal(webhookNotification.disbursement.transactionIds[1], "kj8hjk")
        assert.equal(webhookNotification.disbursement.success, false)
        assert.equal(webhookNotification.disbursement.retry, false)
        assert.equal(webhookNotification.disbursement.disbursementDate, "2014-02-10")
        assert.equal(webhookNotification.disbursement.exceptionMessage, "bank_rejected")
        assert.equal(webhookNotification.disbursement.followUpAction, "update_funding_information")
        assert.equal(webhookNotification.disbursement.merchantAccount.id, "merchant_account_token")
        assert.equal(webhookNotification.disbursement.merchantAccount.currencyIsoCode, "USD")
        assert.equal(webhookNotification.disbursement.merchantAccount.subMerchantAccount, false)
        assert.equal(webhookNotification.disbursement.merchantAccount.status, "active")

        done()

    it "builds a sample notification for a partner merchant connected webhook", (done) ->
      {signature, payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.PartnerMerchantConnected,
        "my_id"
      )

      specHelper.defaultGateway.webhookNotification.parse signature, payload, (err, webhookNotification) ->
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.PartnerMerchantConnected)
        assert.equal(webhookNotification.partnerMerchant.publicKey, 'public_key')
        assert.equal(webhookNotification.partnerMerchant.privateKey, 'private_key')
        assert.equal(webhookNotification.partnerMerchant.clientSideEncryptionKey, 'cse_key')
        assert.equal(webhookNotification.partnerMerchant.merchantPublicId, 'public_id')
        assert.equal(webhookNotification.partnerMerchant.partnerMerchantId, 'abc123')
        assert.ok(webhookNotification.timestamp?)
        done()

    it "builds a sample notification for a partner merchant disconnected webhook", (done) ->
      {signature, payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.PartnerMerchantDisconnected,
        "my_id"
      )

      specHelper.defaultGateway.webhookNotification.parse signature, payload, (err, webhookNotification) ->
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.PartnerMerchantDisconnected)
        assert.equal(webhookNotification.partnerMerchant.partnerMerchantId, 'abc123')
        assert.ok(webhookNotification.timestamp?)
        done()

    it "builds a sample notification for a partner merchant declined webhook", (done) ->
      {signature, payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.PartnerMerchantDeclined,
        "my_id"
      )

      specHelper.defaultGateway.webhookNotification.parse signature, payload, (err, webhookNotification) ->
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.PartnerMerchantDeclined)
        assert.equal(webhookNotification.partnerMerchant.partnerMerchantId, 'abc123')
        assert.ok(webhookNotification.timestamp?)
        done()
