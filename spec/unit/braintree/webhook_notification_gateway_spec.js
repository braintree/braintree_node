'use strict';

require('../../spec_helper');
let { ValidationErrorCodes } = require('../../../lib/braintree/validation_error_codes');
let { WebhookNotification } = require('../../../lib/braintree');
let { Dispute } = require('../../../lib/braintree/dispute');
let { Transaction } = require('../../../lib/braintree/transaction');
let { errorTypes } = require('../../../lib/braintree');

describe("WebhookNotificationGateway", function() {
  describe("verify", function() {
    it("creates a verification string for the challenge", function() {
      let result = specHelper.defaultGateway.webhookNotification.verify("20f9f8ed05f77439fe955c977e4c8a53");

      return assert.equal(result, "integration_public_key|d9b899556c966b3f06945ec21311865d35df3ce4");
    });

    it("throws an error when challenge contains non-hex chars", function(done) {
      let { webhookNotification } = specHelper.defaultGateway;

      assert.throws((() => webhookNotification.verify("bad challenge")));
      return done();
    });

    return it("returns an errback with InvalidChallengeError when challenge contains non-hex chars", done =>
      specHelper.defaultGateway.webhookNotification.verify("bad challenge", function(err, response) {
        assert.equal(err.type, errorTypes.invalidChallengeError);
        assert.equal(err.message, "challenge contains non-hex characters");
        return done();
      })
    );
  });

  return describe("sampleNotification", function() {
    it("returns a parsable signature and payload", function(done) {
      let {bt_signature, bt_payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.SubscriptionWentPastDue,
        "my_id"
      );

      return specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function(err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.SubscriptionWentPastDue);
        assert.equal(webhookNotification.subscription.id, "my_id");
        assert.ok(webhookNotification.timestamp != null);
        return done();
      });
    });

    it("retries a payload with a newline", function(done) {
      let {bt_signature, bt_payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.SubscriptionWentPastDue,
        "my_id"
      );

      return specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload.replace(/\n$/,''), function(err, webhookNotification) {
        assert.equal(err, null);
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.SubscriptionWentPastDue);
        assert.equal(webhookNotification.subscription.id, "my_id");
        assert.ok(webhookNotification.timestamp != null);
        return done();
      });
    });

    it("returns an errback with InvalidSignatureError when signature is invalid", function(done) {
      let {bt_signature, bt_payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.SubscriptionWentPastDue,
        "my_id"
      );

      return specHelper.defaultGateway.webhookNotification.parse("bad_signature", bt_payload, function(err, webhookNotification) {
        assert.equal(err.type, errorTypes.invalidSignatureError);
        return done();
      });
    });

    it("returns an errback with InvalidSignatureError when the public key does not match", function(done) {
      let {bt_signature, bt_payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.SubscriptionWentPastDue,
        "my_id"
      );

      return specHelper.defaultGateway.webhookNotification.parse(`bad${bt_signature}`, bt_payload, function(err, webhookNotification) {
        assert.equal(err.type, errorTypes.invalidSignatureError);
        assert.equal(err.message, "no matching public key");
        return done();
      });
    });

    it("returns an errback with InvalidSignatureError when the signature is modified", function(done) {
      let {bt_signature, bt_payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.SubscriptionWentPastDue,
        "my_id"
      );

      return specHelper.defaultGateway.webhookNotification.parse(`${bt_signature}bad`, bt_payload, function(err, webhookNotification) {
        assert.equal(err.type, errorTypes.invalidSignatureError);
        return done();
      });
    });

    it("returns an errback with InvalidSignatureError when the payload is modified", function(done) {
      let {bt_signature, bt_payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.SubscriptionWentPastDue,
        "my_id"
      );

      return specHelper.defaultGateway.webhookNotification.parse(bt_signature, `bad${bt_payload}`, function(err, webhookNotification) {
        assert.equal(err.type, errorTypes.invalidSignatureError);
        assert.equal(err.message, "signature does not match payload - one has been modified");
        return done();
      });
    });

    it("returns an errback with InvalidSignatureError when the payload contains invalid characters", function(done) {
      let {bt_signature, bt_payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.SubscriptionWentPastDue,
        "my_id"
      );

      bt_payload = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+=/\n";

      return specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function(err, webhookNotification) {
        assert.equal(err.type, errorTypes.invalidSignatureError);
        assert.notEqual(err.message, "payload contains illegal characters");
        return done();
      });
    });

    it("allows all valid characters", function(done) {
      let {bt_signature, bt_payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.SubscriptionWentPastDue,
        "my_id"
      );

      return specHelper.defaultGateway.webhookNotification.parse(bt_signature, "^& bad ,* chars @!", function(err, webhookNotification) {
        assert.equal(err.type, errorTypes.invalidSignatureError);
        assert.equal(err.message, "payload contains illegal characters");
        return done();
      });
    });
    it("returns a parsable signature and payload for merchant account approvals", function(done) {
      let {bt_signature, bt_payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.SubMerchantAccountApproved,
        "my_id"
      );

      return specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function(err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.SubMerchantAccountApproved);
        assert.equal(webhookNotification.merchantAccount.id, "my_id");
        assert.ok(webhookNotification.timestamp != null);
        return done();
      });
    });

    it("returns a parsable signature and payload for merchant account declines", function(done) {
      let {bt_signature, bt_payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.SubMerchantAccountDeclined,
        "my_id"
      );

      return specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function(err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.SubMerchantAccountDeclined);
        assert.equal(webhookNotification.merchantAccount.id, "my_id");
        assert.equal(webhookNotification.errors.for("merchantAccount").on("base")[0].code, ValidationErrorCodes.MerchantAccount.ApplicantDetails.DeclinedOFAC);
        assert.equal(webhookNotification.message, "Credit score is too low");
        assert.ok(webhookNotification.timestamp != null);
        return done();
      });
    });

    it("returns a parsable signature and payload for disbursed transaction", function(done) {
      let {bt_signature, bt_payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.TransactionDisbursed,
        "my_id"
      );

      return specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function(err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.TransactionDisbursed);
        assert.equal(webhookNotification.transaction.id, "my_id");
        assert.equal(webhookNotification.transaction.amount, '100');
        assert.ok(webhookNotification.transaction.disbursementDetails.disbursementDate != null);
        return done();
      });
    });

    it("returns a parsable signature and payload for settled transaction", function(done) {
      let {bt_signature, bt_payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.TransactionSettled,
        "my_id"
      );

      return specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function(err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.TransactionSettled);
        assert.equal(webhookNotification.transaction.id, "my_id");
        assert.equal(webhookNotification.transaction.amount, '100');
        assert.equal(webhookNotification.transaction.status, Transaction.Status.Settled);
        assert.equal(webhookNotification.transaction.usBankAccount.last4, "1234");
        assert.equal(webhookNotification.transaction.usBankAccount.accountHolderName, "Dan Schulman");
        assert.equal(webhookNotification.transaction.usBankAccount.routingNumber, "123456789");
        assert.equal(webhookNotification.transaction.usBankAccount.accountType, "checking");
        return done();
      });
    });

    it("returns a parsable signature and payload for settlement declined transaction", function(done) {
      let {bt_signature, bt_payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.TransactionSettlementDeclined,
        "my_id"
      );

      return specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function(err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.TransactionSettlementDeclined);
        assert.equal(webhookNotification.transaction.id, "my_id");
        assert.equal(webhookNotification.transaction.amount, '100');
        assert.equal(webhookNotification.transaction.status, Transaction.Status.SettlementDeclined);
        assert.equal(webhookNotification.transaction.usBankAccount.last4, "1234");
        assert.equal(webhookNotification.transaction.usBankAccount.accountHolderName, "Dan Schulman");
        assert.equal(webhookNotification.transaction.usBankAccount.routingNumber, "123456789");
        assert.equal(webhookNotification.transaction.usBankAccount.accountType, "checking");
        return done();
      });
    });

    it("returns a parsable signature and payload for dispute opened", function(done) {
      let {bt_signature, bt_payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.DisputeOpened,
        "my_id"
      );

      return specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function(err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.DisputeOpened);
        assert.equal(Dispute.Status.Open, webhookNotification.dispute.status);
        assert.equal(Dispute.Kind.Chargeback, webhookNotification.dispute.kind);
        assert.equal('2014-03-28', webhookNotification.dispute.dateOpened);
        return done();
      });
    });

    it("returns a parsable signature and payload for dispute lost", function(done) {
      let {bt_signature, bt_payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.DisputeLost,
        "my_id"
      );

      return specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function(err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.DisputeLost);
        assert.equal(Dispute.Status.Lost, webhookNotification.dispute.status);
        assert.equal(Dispute.Kind.Chargeback, webhookNotification.dispute.kind);
        assert.equal('2014-03-28', webhookNotification.dispute.dateOpened);
        return done();
      });
    });

    it("returns a parsable signature and payload for dispute won", function(done) {
      let {bt_signature, bt_payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.DisputeWon,
        "my_id"
      );

      return specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function(err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.DisputeWon);
        assert.equal(Dispute.Status.Won, webhookNotification.dispute.status);
        assert.equal(Dispute.Kind.Chargeback, webhookNotification.dispute.kind);
        assert.equal('2014-03-28', webhookNotification.dispute.dateOpened);
        assert.equal('2014-09-01', webhookNotification.dispute.dateWon);
        return done();
      });
    });

    it("returns a parsable signature and payload for a disbursed webhook", function(done) {
      let {bt_signature, bt_payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.Disbursement,
        "my_id"
      );

      return specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function(err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.Disbursement);
        assert.equal(webhookNotification.disbursement.id, "my_id");
        assert.equal(webhookNotification.disbursement.amount, "100.00");
        assert.equal(webhookNotification.disbursement.transactionIds[0], "afv56j");
        assert.equal(webhookNotification.disbursement.transactionIds[1], "kj8hjk");
        assert.equal(webhookNotification.disbursement.success, true);
        assert.equal(webhookNotification.disbursement.retry, false);
        assert.equal(webhookNotification.disbursement.disbursementDate, "2014-02-10");
        assert.equal(webhookNotification.disbursement.merchantAccount.id, "merchant_account_token");
        assert.equal(webhookNotification.disbursement.merchantAccount.currencyIsoCode, "USD");
        assert.equal(webhookNotification.disbursement.merchantAccount.subMerchantAccount, false);
        assert.equal(webhookNotification.disbursement.merchantAccount.status, "active");

        return done();
      });
    });

    it("returns a parsable signature and payload for disbursement exception webhook", function(done) {
      let {bt_signature, bt_payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.DisbursementException,
        "my_id"
      );

      return specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function(err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.DisbursementException);
        assert.equal(webhookNotification.disbursement.id, "my_id");
        assert.equal(webhookNotification.disbursement.amount, "100.00");
        assert.equal(webhookNotification.disbursement.transactionIds[0], "afv56j");
        assert.equal(webhookNotification.disbursement.transactionIds[1], "kj8hjk");
        assert.equal(webhookNotification.disbursement.success, false);
        assert.equal(webhookNotification.disbursement.retry, false);
        assert.equal(webhookNotification.disbursement.disbursementDate, "2014-02-10");
        assert.equal(webhookNotification.disbursement.exceptionMessage, "bank_rejected");
        assert.equal(webhookNotification.disbursement.followUpAction, "update_funding_information");
        assert.equal(webhookNotification.disbursement.merchantAccount.id, "merchant_account_token");
        assert.equal(webhookNotification.disbursement.merchantAccount.currencyIsoCode, "USD");
        assert.equal(webhookNotification.disbursement.merchantAccount.subMerchantAccount, false);
        assert.equal(webhookNotification.disbursement.merchantAccount.status, "active");

        return done();
      });
    });

    it("builds a sample notification for a partner merchant connected webhook", function(done) {
      let {bt_signature, bt_payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.PartnerMerchantConnected,
        "my_id"
      );

      return specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function(err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.PartnerMerchantConnected);
        assert.equal(webhookNotification.partnerMerchant.publicKey, 'public_key');
        assert.equal(webhookNotification.partnerMerchant.privateKey, 'private_key');
        assert.equal(webhookNotification.partnerMerchant.clientSideEncryptionKey, 'cse_key');
        assert.equal(webhookNotification.partnerMerchant.merchantPublicId, 'public_id');
        assert.equal(webhookNotification.partnerMerchant.partnerMerchantId, 'abc123');
        assert.ok(webhookNotification.timestamp != null);
        return done();
      });
    });

    it("builds a sample notification for a partner merchant disconnected webhook", function(done) {
      let {bt_signature, bt_payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.PartnerMerchantDisconnected,
        "my_id"
      );

      return specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function(err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.PartnerMerchantDisconnected);
        assert.equal(webhookNotification.partnerMerchant.partnerMerchantId, 'abc123');
        assert.ok(webhookNotification.timestamp != null);
        return done();
      });
    });

    it("builds a sample notification for a partner merchant declined webhook", function(done) {
      let {bt_signature, bt_payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.PartnerMerchantDeclined,
        "my_id"
      );

      return specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function(err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.PartnerMerchantDeclined);
        assert.equal(webhookNotification.partnerMerchant.partnerMerchantId, 'abc123');
        assert.ok(webhookNotification.timestamp != null);
        return done();
      });
    });

    it("builds a sample notification for a successfully charged subscription", function(done) {
      let {bt_signature, bt_payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.SubscriptionChargedSuccessfully,
        "my_id"
      );

      return specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function(err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.SubscriptionChargedSuccessfully);
        assert.equal(webhookNotification.subscription.id, 'my_id');
        assert.equal(webhookNotification.subscription.transactions.length, 1);

        let transaction = webhookNotification.subscription.transactions.pop();
        assert.equal(transaction.status, "submitted_for_settlement");
        assert.equal(transaction.amount, 49.99);
        return done();
      });
    });

    it("builds a sample notification for a check notifications", function(done) {
      let {bt_signature, bt_payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.Check,
        ""
      );

      return specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function(err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.Check);
        return done();
      });
    });


    return it("returns a parsable signature and payload for account updater daily report", function(done) {
      let {bt_signature, bt_payload} = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.AccountUpdaterDailyReport,
        "my_id"
      );

      return specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function(err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.AccountUpdaterDailyReport);
        assert.equal('link-to-csv-report', webhookNotification.accountUpdaterDailyReport.reportUrl);
        assert.equal('2016-01-14', webhookNotification.accountUpdaterDailyReport.reportDate);
        return done();
      });
    });
  });
});
