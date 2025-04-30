"use strict";
/* eslint-disable camelcase */

let Buffer = require("buffer").Buffer;
let WebhookNotification = require("../../../lib/braintree").WebhookNotification;
let Dispute = require("../../../lib/braintree/dispute").Dispute;
let Transaction = require("../../../lib/braintree/transaction").Transaction;
let errorTypes = require("../../../lib/braintree").errorTypes;
let CreditCard = require("../../../lib/braintree/credit_card").CreditCard;
let PayPalAccount =
  require("../../../lib/braintree/paypal_account").PayPalAccount;
let VenmoAccount = require("../../../lib/braintree/venmo_account").VenmoAccount;

describe("WebhookNotificationGateway", function () {
  describe("verify", function () {
    it("creates a verification string for the challenge", function () {
      let result = specHelper.defaultGateway.webhookNotification.verify(
        "20f9f8ed05f77439fe955c977e4c8a53"
      );

      assert.equal(
        result,
        "integration_public_key|d9b899556c966b3f06945ec21311865d35df3ce4"
      );
    });

    it("throws an error when challenge contains non-hex chars", function (done) {
      let webhookNotification = specHelper.defaultGateway.webhookNotification;

      assert.throws(() => webhookNotification.verify("bad challenge"));
      done();
    });

    it("returns an errback with InvalidChallengeError when challenge contains non-hex chars", (done) =>
      specHelper.defaultGateway.webhookNotification.verify(
        "bad challenge",
        function (err) {
          assert.equal(err.type, errorTypes.invalidChallengeError);
          assert.equal(err.message, "challenge contains non-hex characters");
          done();
        }
      ));
  });

  describe("sampleNotification", function () {
    it("returns a parsable signature and payload", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.GrantedPaymentMethodRevoked,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.GrantedPaymentMethodRevoked
          );
          assert.equal(
            webhookNotification.revokedPaymentMethodMetadata.token,
            "my_id"
          );
          assert.exists(webhookNotification.timestamp);
          done();
        }
      );
    });

    it("throws an error when signature is empty", function (done) {
      specHelper.defaultGateway.webhookNotification.parse(
        null,
        "some payload",
        function (err) {
          assert.equal(err.type, errorTypes.invalidSignatureError);
          assert.equal(err.message, "signature parameter is required");
          done();
        }
      );
    });

    it("throws an error when payload is empty", function (done) {
      specHelper.defaultGateway.webhookNotification.parse(
        "signature",
        null,
        function (err) {
          assert.equal(err.type, errorTypes.invalidSignatureError);
          assert.equal(err.message, "payload parameter is required");
          done();
        }
      );
    });

    it("returns a parsable signature and payload", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.SubscriptionWentPastDue,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.SubscriptionWentPastDue
          );
          assert.equal(webhookNotification.subscription.id, "my_id");
          assert.exists(webhookNotification.timestamp);
          assert.notExists(webhookNotification.sourceMerchantId);
          done();
        }
      );
    });

    it("returns a source merchant ID if supplied", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.SubscriptionWentPastDue,
          "my_id",
          "my_source_merchant_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.notExists(err);
          assert.equal(
            webhookNotification.sourceMerchantId,
            "my_source_merchant_id"
          );
          assert.exists(webhookNotification.timestamp);
          done();
        }
      );
    });

    it("retries a payload with a newline", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.SubscriptionWentPastDue,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload.replace(/\n$/, ""),
        function (err, webhookNotification) {
          assert.equal(err, null);
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.SubscriptionWentPastDue
          );
          assert.equal(webhookNotification.subscription.id, "my_id");
          assert.exists(webhookNotification.timestamp);
          done();
        }
      );
    });

    it("returns an errback with InvalidSignatureError when signature is invalid", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.SubscriptionWentPastDue,
          "my_id"
        );
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        "bad_signature",
        bt_payload,
        function (err) {
          assert.equal(err.type, errorTypes.invalidSignatureError);
          done();
        }
      );
    });

    it("returns an errback with InvalidSignatureError when the public key does not match", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.SubscriptionWentPastDue,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        `bad${bt_signature}`,
        bt_payload,
        function (err) {
          assert.equal(err.type, errorTypes.invalidSignatureError);
          assert.equal(err.message, "no matching public key");
          done();
        }
      );
    });

    it("returns an errback with InvalidSignatureError when the signature is modified", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.SubscriptionWentPastDue,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        `${bt_signature}bad`,
        bt_payload,
        function (err) {
          assert.equal(err.type, errorTypes.invalidSignatureError);
          done();
        }
      );
    });

    it("returns an errback with InvalidSignatureError when the payload is modified", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.SubscriptionWentPastDue,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        `bad${bt_payload}`,
        function (err) {
          assert.equal(err.type, errorTypes.invalidSignatureError);
          assert.equal(
            err.message,
            "signature does not match payload - one has been modified"
          );
          done();
        }
      );
    });

    it("returns an errback with InvalidSignatureError when the payload contains invalid characters", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.SubscriptionWentPastDue,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      bt_payload =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+=/\n";

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err) {
          assert.equal(err.type, errorTypes.invalidSignatureError);
          assert.notEqual(err.message, "payload contains illegal characters");
          done();
        }
      );
    });

    it("allows all valid characters", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.SubscriptionWentPastDue,
          "my_id"
        );
      let bt_signature = notification.bt_signature;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        "^& bad ,* chars @!",
        function (err) {
          assert.equal(err.type, errorTypes.invalidSignatureError);
          assert.equal(err.message, "payload contains illegal characters");
          done();
        }
      );
    });

    it("returns a parsable signature and payload for disbursed transaction", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.TransactionDisbursed,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.TransactionDisbursed
          );
          assert.equal(webhookNotification.transaction.id, "my_id");
          assert.equal(webhookNotification.transaction.amount, "100");
          assert.exists(
            webhookNotification.transaction.disbursementDetails.disbursementDate
          );
          done();
        }
      );
    });

    it("returns a parsable signature and payload for reviewed transaction", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.TransactionReviewed,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.TransactionReviewed
          );
          assert.equal(
            webhookNotification.transactionReview.transactionId,
            "my_id"
          );
          assert.equal(
            webhookNotification.transactionReview.decision,
            "a smart decision"
          );
          assert.equal(
            webhookNotification.transactionReview.reviewerEmail,
            "hey@girl.com"
          );
          assert.equal(
            webhookNotification.transactionReview.reviewerNote,
            "I reviewed this"
          );
          assert.exists(webhookNotification.transactionReview.reviewedTime);
          done();
        }
      );
    });

    it("returns a parsable signature and payload for settled transaction", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.TransactionSettled,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.TransactionSettled
          );
          assert.equal(webhookNotification.transaction.id, "my_id");
          assert.equal(webhookNotification.transaction.amount, "100");
          assert.equal(
            webhookNotification.transaction.status,
            Transaction.Status.Settled
          );
          assert.equal(
            webhookNotification.transaction.usBankAccount.last4,
            "1234"
          );
          assert.equal(
            webhookNotification.transaction.usBankAccount.accountHolderName,
            "Dan Schulman"
          );
          assert.equal(
            webhookNotification.transaction.usBankAccount.routingNumber,
            "123456789"
          );
          assert.equal(
            webhookNotification.transaction.usBankAccount.accountType,
            "checking"
          );
          done();
        }
      );
    });

    it("returns a parsable signature and payload for settlement declined transaction", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.TransactionSettlementDeclined,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.TransactionSettlementDeclined
          );
          assert.equal(webhookNotification.transaction.id, "my_id");
          assert.equal(webhookNotification.transaction.amount, "100");
          assert.equal(
            webhookNotification.transaction.status,
            Transaction.Status.SettlementDeclined
          );
          assert.equal(
            webhookNotification.transaction.usBankAccount.last4,
            "1234"
          );
          assert.equal(
            webhookNotification.transaction.usBankAccount.accountHolderName,
            "Dan Schulman"
          );
          assert.equal(
            webhookNotification.transaction.usBankAccount.routingNumber,
            "123456789"
          );
          assert.equal(
            webhookNotification.transaction.usBankAccount.accountType,
            "checking"
          );
          done();
        }
      );
    });

    it("returns a parsable signature and payload for refund failed", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.RefundFailed,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.RefundFailed
          );
          assert.equal(webhookNotification.transaction.id, "my_id");
          done();
        }
      );
    });

    it("returns a parsable signature and payload for dispute under_review", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.DisputeUnderReview,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.DisputeUnderReview
          );
          assert.equal(
            Dispute.Status.UnderReview,
            webhookNotification.dispute.status
          );
          assert.equal(
            Dispute.Kind.Chargeback,
            webhookNotification.dispute.kind
          );
          assert.equal("2014-03-28", webhookNotification.dispute.dateOpened);
          done();
        }
      );
    });

    it("returns a parsable signature and payload for dispute opened", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.DisputeOpened,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.DisputeOpened
          );
          assert.equal(Dispute.Status.Open, webhookNotification.dispute.status);
          assert.equal(
            Dispute.Kind.Chargeback,
            webhookNotification.dispute.kind
          );
          assert.equal("2014-03-28", webhookNotification.dispute.dateOpened);
          done();
        }
      );
    });

    it("returns a parsable signature and payload for dispute lost", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.DisputeLost,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.DisputeLost
          );
          assert.equal(Dispute.Status.Lost, webhookNotification.dispute.status);
          assert.equal(
            Dispute.Kind.Chargeback,
            webhookNotification.dispute.kind
          );
          assert.equal("2014-03-28", webhookNotification.dispute.dateOpened);
          done();
        }
      );
    });

    it("returns a parsable signature and payload for dispute won", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.DisputeWon,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.DisputeWon
          );
          assert.equal(Dispute.Status.Won, webhookNotification.dispute.status);
          assert.equal(
            Dispute.Kind.Chargeback,
            webhookNotification.dispute.kind
          );
          assert.equal("2014-03-28", webhookNotification.dispute.dateOpened);
          assert.equal("2014-09-01", webhookNotification.dispute.dateWon);
          done();
        }
      );
    });

    it("returns a parsable signature and payload for dispute accepted", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.DisputeAccepted,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.DisputeAccepted
          );
          assert.equal(
            Dispute.Status.Accepted,
            webhookNotification.dispute.status
          );
          assert.equal(
            Dispute.Kind.Chargeback,
            webhookNotification.dispute.kind
          );
          assert.equal("2014-03-28", webhookNotification.dispute.dateOpened);
          done();
        }
      );
    });

    it("returns a parsable signature and payload for dispute auto accepted", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.DisputeAutoAccepted,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.DisputeAutoAccepted
          );
          assert.equal(
            Dispute.Status.AutoAccepted,
            webhookNotification.dispute.status
          );
          assert.equal(
            Dispute.Kind.Chargeback,
            webhookNotification.dispute.kind
          );
          assert.equal("2014-03-28", webhookNotification.dispute.dateOpened);
          done();
        }
      );
    });

    it("returns a parsable signature and payload for dispute disputed", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.DisputeDisputed,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.DisputeDisputed
          );
          assert.equal(
            Dispute.Status.Disputed,
            webhookNotification.dispute.status
          );
          assert.equal(
            Dispute.Kind.Chargeback,
            webhookNotification.dispute.kind
          );
          assert.equal("2014-03-28", webhookNotification.dispute.dateOpened);
          done();
        }
      );
    });

    it("returns a parsable signature and payload for dispute expired", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.DisputeExpired,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.DisputeExpired
          );
          assert.equal(
            Dispute.Status.Expired,
            webhookNotification.dispute.status
          );
          assert.equal(
            Dispute.Kind.Chargeback,
            webhookNotification.dispute.kind
          );
          assert.equal("2014-03-28", webhookNotification.dispute.dateOpened);
          done();
        }
      );
    });

    it("returns a parsable signature and payload for a disbursed webhook", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.Disbursement,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.Disbursement
          );
          assert.equal(webhookNotification.disbursement.id, "my_id");
          assert.equal(webhookNotification.disbursement.amount, "100.00");
          assert.equal(
            webhookNotification.disbursement.transactionIds[0],
            "afv56j"
          );
          assert.equal(
            webhookNotification.disbursement.transactionIds[1],
            "kj8hjk"
          );
          assert.equal(webhookNotification.disbursement.success, true);
          assert.equal(webhookNotification.disbursement.retry, false);
          assert.equal(
            webhookNotification.disbursement.disbursementDate,
            "2014-02-10"
          );
          assert.equal(
            webhookNotification.disbursement.merchantAccount.id,
            "merchant_account_token"
          );
          assert.equal(
            webhookNotification.disbursement.merchantAccount.currencyIsoCode,
            "USD"
          );
          assert.equal(
            webhookNotification.disbursement.merchantAccount.status,
            "active"
          );

          done();
        }
      );
    });

    it("builds a sample notification for a partner merchant connected webhook", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.PartnerMerchantConnected,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.PartnerMerchantConnected
          );
          assert.equal(
            webhookNotification.partnerMerchant.publicKey,
            "public_key"
          );
          assert.equal(
            webhookNotification.partnerMerchant.privateKey,
            "private_key"
          );
          assert.equal(
            webhookNotification.partnerMerchant.clientSideEncryptionKey,
            "cse_key"
          );
          assert.equal(
            webhookNotification.partnerMerchant.merchantPublicId,
            "public_id"
          );
          assert.equal(
            webhookNotification.partnerMerchant.partnerMerchantId,
            "abc123"
          );
          assert.exists(webhookNotification.timestamp);
          done();
        }
      );
    });

    it("builds a sample notification for a partner merchant disconnected webhook", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.PartnerMerchantDisconnected,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.PartnerMerchantDisconnected
          );
          assert.equal(
            webhookNotification.partnerMerchant.partnerMerchantId,
            "abc123"
          );
          assert.exists(webhookNotification.timestamp);
          done();
        }
      );
    });

    it("builds a sample notification for a partner merchant declined webhook", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.PartnerMerchantDeclined,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.PartnerMerchantDeclined
          );
          assert.equal(
            webhookNotification.partnerMerchant.partnerMerchantId,
            "abc123"
          );
          assert.exists(webhookNotification.timestamp);
          done();
        }
      );
    });

    it("builds a sample notification for an OAuth access revocation webhook", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.OAuthAccessRevoked,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.OAuthAccessRevoked
          );
          assert.equal(
            webhookNotification.oauthAccessRevocation.merchantId,
            "my_id"
          );
          assert.equal(
            webhookNotification.oauthAccessRevocation.oauthApplicationClientId,
            "oauth_application_client_id"
          );
          assert.exists(webhookNotification.timestamp);
          done();
        }
      );
    });

    it("builds a sample notification for a connected merchant status transitioned webhook", (done) => {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.ConnectedMerchantStatusTransitioned,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.ConnectedMerchantStatusTransitioned
          );
          assert.equal(
            webhookNotification.connectedMerchantStatusTransitioned
              .merchantPublicId,
            "my_id"
          );
          assert.equal(
            webhookNotification.connectedMerchantStatusTransitioned.merchantId,
            "my_id"
          );
          assert.equal(
            webhookNotification.connectedMerchantStatusTransitioned.status,
            "new_status"
          );
          assert.equal(
            webhookNotification.connectedMerchantStatusTransitioned
              .oauthApplicationClientId,
            "oauth_application_client_id"
          );
          assert.exists(webhookNotification.timestamp);
          done();
        }
      );
    });

    it("builds a sample notification for a connected merchant paypal status changed webhook", (done) => {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.ConnectedMerchantPayPalStatusChanged,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.ConnectedMerchantPayPalStatusChanged
          );
          assert.equal(
            webhookNotification.connectedMerchantPayPalStatusChanged
              .merchantPublicId,
            "my_id"
          );
          assert.equal(
            webhookNotification.connectedMerchantPayPalStatusChanged.merchantId,
            "my_id"
          );
          assert.equal(
            webhookNotification.connectedMerchantPayPalStatusChanged.action,
            "link"
          );
          assert.equal(
            webhookNotification.connectedMerchantPayPalStatusChanged
              .oauthApplicationClientId,
            "oauth_application_client_id"
          );
          assert.exists(webhookNotification.timestamp);
          done();
        }
      );
    });

    it("builds a sample notification for a billing skipped subscription", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.SubscriptionBillingSkipped,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.SubscriptionBillingSkipped
          );
          assert.equal(webhookNotification.subscription.id, "my_id");
          assert.equal(webhookNotification.subscription.transactions.length, 0);
          assert.equal(webhookNotification.subscription.discounts.length, 0);
          assert.equal(webhookNotification.subscription.addOns.length, 0);

          done();
        }
      );
    });

    it("builds a sample notification for a successfully charged subscription", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.SubscriptionChargedSuccessfully,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.SubscriptionChargedSuccessfully
          );
          assert.equal(webhookNotification.subscription.id, "my_id");
          assert.equal(webhookNotification.subscription.transactions.length, 1);

          let transaction = webhookNotification.subscription.transactions.pop();

          assert.equal(transaction.status, "submitted_for_settlement");
          assert.equal(transaction.amount, 49.99);
          done();
        }
      );
    });

    it("builds a sample notification for a unsuccessfully charged subscription", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.SubscriptionChargedUnsuccessfully,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.SubscriptionChargedUnsuccessfully
          );
          assert.equal(webhookNotification.subscription.id, "my_id");
          assert.equal(webhookNotification.subscription.transactions.length, 1);

          let transaction = webhookNotification.subscription.transactions.pop();

          assert.equal(transaction.status, "failed");
          assert.equal(transaction.amount, 49.99);
          done();
        }
      );
    });

    it("builds a sample notification for a check notifications", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.Check,
          ""
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.Check
          );
          done();
        }
      );
    });

    it("returns a parsable signature and payload for account updater daily report", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.AccountUpdaterDailyReport,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.AccountUpdaterDailyReport
          );
          assert.equal(
            "link-to-csv-report",
            webhookNotification.accountUpdaterDailyReport.reportUrl
          );
          assert.equal(
            "2016-01-14",
            webhookNotification.accountUpdaterDailyReport.reportDate
          );
          done();
        }
      );
    });

    it("returns a parsable signature and payload for Grantor Updated Granted Payment Method", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.GrantorUpdatedGrantedPaymentMethod,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.GrantorUpdatedGrantedPaymentMethod
          );

          let update = webhookNotification.grantedPaymentInstrumentUpdate;

          assert.equal("vczo7jqrpwrsi2px", update.grantOwnerMerchantId);
          assert.equal("cf0i8wgarszuy6hc", update.grantRecipientMerchantId);
          assert.equal(
            "ee257d98-de40-47e8-96b3-a6954ea7a9a4",
            update.paymentMethodNonce.nonce
          );
          assert.equal(false, update.paymentMethodNonce.consumed);
          assert.equal("abc123z", update.token);
          assert.equal("expiration-month", update.updatedFields[0]);
          assert.equal("expiration-year", update.updatedFields[1]);
          done();
        }
      );
    });

    it("returns a parsable signature and payload for Recipient Updated Granted Payment Method", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.RecipientUpdatedGrantedPaymentMethod,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.RecipientUpdatedGrantedPaymentMethod
          );

          let update = webhookNotification.grantedPaymentInstrumentUpdate;

          assert.equal("vczo7jqrpwrsi2px", update.grantOwnerMerchantId);
          assert.equal("cf0i8wgarszuy6hc", update.grantRecipientMerchantId);
          assert.equal(
            "ee257d98-de40-47e8-96b3-a6954ea7a9a4",
            update.paymentMethodNonce.nonce
          );
          assert.equal(false, update.paymentMethodNonce.consumed);
          assert.equal("abc123z", update.token);
          assert.equal("expiration-month", update.updatedFields[0]);
          assert.equal("expiration-year", update.updatedFields[1]);
          done();
        }
      );
    });

    it("returns a parseable signature and payload for Granted Payment Method Revoked credit cards", function (done) {
      let xmlPayload = `<notification>
        <source-merchant-id>12345</source-merchant-id>
        <timestamp type="datetime">2018-10-10T22:46:41Z</timestamp>
        <kind>granted_payment_method_revoked</kind>
        <subject>
          <credit-card>
            <bin>555555</bin>
            <card-type>MasterCard</card-type>
            <cardholder-name>Amber Ankunding</cardholder-name>
            <commercial>Unknown</commercial>
            <country-of-issuance>Unknown</country-of-issuance>
            <created-at type="datetime">2018-10-10T22:46:41Z</created-at>
            <customer-id>credit_card_customer_id</customer-id>
            <customer-location>US</customer-location>
            <debit>Unknown</debit>
            <default type="boolean">true</default>
            <durbin-regulated>Unknown</durbin-regulated>
            <expiration-month>06</expiration-month>
            <expiration-year>2020</expiration-year>
            <expired type="boolean">false</expired>
            <global-id>cGF5bWVudG1ldGhvZF8zcHQ2d2hz</global-id>
            <healthcare>Unknown</healthcare>
            <image-url>https://assets.braintreegateway.com/payment_method_logo/mastercard.png?environment=test</image-url>
            <issuing-bank>Unknown</issuing-bank>
            <last-4>4444</last-4>
            <payroll>Unknown</payroll>
            <prepaid>Unknown</prepaid>
            <prepaid-reloadable>Unknown</prepaid-reloadable>
            <product-id>Unknown</product-id>
            <subscriptions type="array"/>
            <token>credit_card_token</token>
            <unique-number-identifier>08199d188e37460163207f714faf074a</unique-number-identifier>
            <updated-at type="datetime">2018-10-10T22:46:41Z</updated-at>
            <venmo-sdk type="boolean">false</venmo-sdk>
            <verifications type="array"/>
          </credit-card>
        </subject>
      </notification>`;
      let bt_payload = Buffer.from(xmlPayload).toString("base64") + "\n";
      let bt_signature =
        specHelper.defaultGateway.webhookTesting.sampleSignature(bt_payload);

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.GrantedPaymentMethodRevoked
          );

          let metadata = webhookNotification.revokedPaymentMethodMetadata;

          assert.equal("credit_card_customer_id", metadata.customerId);
          assert.equal("credit_card_token", metadata.token);
          assert(metadata.revokedPaymentMethod instanceof CreditCard);
          done();
        }
      );
    });

    it("returns a parseable signature and payload for Granted Payment Method Revoked paypal accounts", function (done) {
      let xmlPayload = `<notification>
        <source-merchant-id>12345</source-merchant-id>
        <timestamp type="datetime">2018-10-10T22:46:41Z</timestamp>
        <kind>granted_payment_method_revoked</kind>
        <subject>
          <paypal-account>
            <billing-agreement-id>billing_agreement_id</billing-agreement-id>
            <created-at type="dateTime">2018-10-11T21:10:33Z</created-at>
            <customer-id>paypal_customer_id</customer-id>
            <default type="boolean">true</default>
            <email>johndoe@example.com</email>
            <global-id>cGF5bWVudG1ldGhvZF9wYXlwYWxfdG9rZW4</global-id>
            <image-url>https://assets.braintreegateway.com/payment_method_logo/mastercard.png?environment=test</image-url>
            <subscriptions type="array"></subscriptions>
            <token>paypal_token</token>
            <updated-at type="dateTime">2018-10-11T21:10:33Z</updated-at>
            <payer-id>a6a8e1a4</payer-id>
          </paypal-account>
        </subject>
      </notification>`;

      const bt_payload = Buffer.from(xmlPayload).toString("base64") + "\n";
      let bt_signature =
        specHelper.defaultGateway.webhookTesting.sampleSignature(bt_payload);

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.GrantedPaymentMethodRevoked
          );

          let metadata = webhookNotification.revokedPaymentMethodMetadata;

          assert.equal("paypal_customer_id", metadata.customerId);
          assert.equal("paypal_token", metadata.token);
          assert(metadata.revokedPaymentMethod instanceof PayPalAccount);
          done();
        }
      );
    });

    it("returns a parseable signature and payload for Granted Payment Method Revoked venmo accounts", function (done) {
      let xmlPayload = `<notification>
        <source-merchant-id>12345</source-merchant-id>
        <timestamp type="datetime">2018-10-10T22:46:41Z</timestamp>
        <kind>granted_payment_method_revoked</kind>
        <subject>
          <venmo-account>
            <default type="boolean">true</default>
            <image-url>https://assets.braintreegateway.com/payment_method_logo/mastercard.png?environment=test</image-url>
            <token>venmo_token</token>
            <source-description>Venmo Account: venmojoe</source-description>
            <username>venmojoe</username>
            <venmo-user-id>456</venmo-user-id>
            <subscriptions type="array"/>
            <customer-id>venmo_customer_id</customer-id>
            <global-id>cGF5bWVudG1ldGhvZF92ZW5tb2FjY291bnQ</global-id>
          </venmo-account>
        </subject>
      </notification>`;

      const bt_payload = Buffer.from(xmlPayload).toString("base64") + "\n";
      let bt_signature =
        specHelper.defaultGateway.webhookTesting.sampleSignature(bt_payload);

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.GrantedPaymentMethodRevoked
          );

          let metadata = webhookNotification.revokedPaymentMethodMetadata;

          assert.equal("venmo_customer_id", metadata.customerId);
          assert.equal("venmo_token", metadata.token);
          assert(metadata.revokedPaymentMethod instanceof VenmoAccount);
          done();
        }
      );
    });

    it("returns a parseable signature and payload for Payment Method Revoked By Customer webhook", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.PaymentMethodRevokedByCustomer,
          "my_payment_method_token"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.PaymentMethodRevokedByCustomer
          );

          let metadata = webhookNotification.revokedPaymentMethodMetadata;

          assert.equal("my_payment_method_token", metadata.token);
          assert(metadata.revokedPaymentMethod instanceof PayPalAccount);
          assert.exists(metadata.revokedPaymentMethod.revokedAt);
          done();
        }
      );
    });

    it("returns a parsable signature and payload for Local Payment Completed", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.LocalPaymentCompleted,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.LocalPaymentCompleted
          );

          let localPaymentCompleted = webhookNotification.localPaymentCompleted;

          assert.equal("a-bic", localPaymentCompleted.bic);
          assert.equal("1234", localPaymentCompleted.ibanLastChars);
          assert.equal("a-payer-id", localPaymentCompleted.payerId);
          assert.equal("a-payer-name", localPaymentCompleted.payerName);
          assert.equal("a-payment-id", localPaymentCompleted.paymentId);
          assert.equal(
            "ee257d98-de40-47e8-96b3-a6954ea7a9a4",
            localPaymentCompleted.paymentMethodNonce
          );
          assert.exists(localPaymentCompleted.transaction);
          assert.equal("1", localPaymentCompleted.transaction.id);
          assert.equal("authorizing", localPaymentCompleted.transaction.status);
          assert.equal("order1234", localPaymentCompleted.transaction.orderId);
          done();
        }
      );
    });

    it("returns blik aliases for Local Payment Completed when funding source is blik one click", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.LocalPaymentCompleted,
          "blik_one_click_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.LocalPaymentCompleted
          );

          let localPaymentCompleted = webhookNotification.localPaymentCompleted;

          assert.equal("a-bic", localPaymentCompleted.bic);
          assert.equal("1234", localPaymentCompleted.ibanLastChars);
          assert.equal("a-payer-id", localPaymentCompleted.payerId);
          assert.equal("a-payer-name", localPaymentCompleted.payerName);
          assert.equal("a-payment-id", localPaymentCompleted.paymentId);
          assert.equal(
            "ee257d98-de40-47e8-96b3-a6954ea7a9a4",
            localPaymentCompleted.paymentMethodNonce
          );

          assert.equal("alias-key-1", localPaymentCompleted.blikAliases[0].key);
          assert.equal(
            "alias-label-1",
            localPaymentCompleted.blikAliases[0].label
          );
          assert.exists(localPaymentCompleted.transaction);
          assert.equal("1", localPaymentCompleted.transaction.id);
          assert.equal("authorizing", localPaymentCompleted.transaction.status);
          assert.equal("order1234", localPaymentCompleted.transaction.orderId);
          done();
        }
      );
    });

    it("returns a parsable signature and payload for Local Payment Expired", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.LocalPaymentExpired,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.LocalPaymentExpired
          );

          let localPaymentExpired = webhookNotification.localPaymentExpired;

          assert.equal("a-payment-id", localPaymentExpired.paymentId);
          assert.equal(
            "a-payment-context-id",
            localPaymentExpired.paymentContextId
          );
          done();
        }
      );
    });

    it("returns a parsable signature and payload for Local Payment Funded", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.LocalPaymentFunded,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.LocalPaymentFunded
          );

          let localPaymentFunded = webhookNotification.localPaymentFunded;

          assert.equal("a-payment-id", localPaymentFunded.paymentId);
          assert.equal(
            "a-payment-context-id",
            localPaymentFunded.paymentContextId
          );
          assert.exists(localPaymentFunded.transaction);
          assert.equal("1", localPaymentFunded.transaction.id);
          assert.equal("settled", localPaymentFunded.transaction.status);
          assert.equal("order1234", localPaymentFunded.transaction.orderId);
          assert.equal("10.00", localPaymentFunded.transaction.amount);
          done();
        }
      );
    });

    it("returns a parsable signature and payload for Local Payment Reversed", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.LocalPaymentReversed,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.LocalPaymentReversed
          );

          let localPaymentReversed = webhookNotification.localPaymentReversed;

          assert.equal("a-payment-id", localPaymentReversed.paymentId);
          done();
        }
      );
    });

    it("returns a parsable signature and payload for Payment Method Customer Data Updated", function (done) {
      let notification =
        specHelper.defaultGateway.webhookTesting.sampleNotification(
          WebhookNotification.Kind.PaymentMethodCustomerDataUpdated,
          "my_id"
        );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(
        bt_signature,
        bt_payload,
        function (err, webhookNotification) {
          assert.equal(
            webhookNotification.kind,
            WebhookNotification.Kind.PaymentMethodCustomerDataUpdated
          );

          let paymentMethodCustomerDataUpdatedMetadata =
            webhookNotification.paymentMethodCustomerDataUpdatedMetadata;

          assert.equal(
            "TOKEN-12345",
            paymentMethodCustomerDataUpdatedMetadata.token
          );
          assert.equal(
            "2022-01-01T21:28:37Z",
            paymentMethodCustomerDataUpdatedMetadata.datetimeUpdated
          );

          let paymentMethod =
            paymentMethodCustomerDataUpdatedMetadata.paymentMethod;

          assert.equal("my_id", paymentMethod.token);

          let enrichedCustomerData =
            paymentMethodCustomerDataUpdatedMetadata.enrichedCustomerData;

          let billingAddress = {
            streetAddress: "Billing Street Address",
            extendedAddress: "Billing Extended Address",
            locality: "Locality",
            region: "Region",
            postalCode: "Postal Code",
          };

          let shippingAddress = {
            streetAddress: "Shipping Street Address",
            extendedAddress: "Shipping Extended Address",
            locality: "Locality",
            region: "Region",
            postalCode: "Postal Code",
          };

          assert.equal("username", enrichedCustomerData.fieldsUpdated[0]);

          let profileData = enrichedCustomerData.profileData;

          assert.equal("John", profileData.firstName);
          assert.equal("Doe", profileData.lastName);
          assert.equal("venmo_username", profileData.username);
          assert.equal("1231231234", profileData.phoneNumber);
          assert.equal("john.doe@paypal.com", profileData.email);
          assert.deepEqual(billingAddress, profileData.billingAddress);
          assert.deepEqual(shippingAddress, profileData.shippingAddress);

          done();
        }
      );
    });
  });
});
