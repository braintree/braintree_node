'use strict';
/* eslint-disable camelcase */

let ValidationErrorCodes = require('../../../lib/braintree/validation_error_codes').ValidationErrorCodes;
let WebhookNotification = require('../../../lib/braintree').WebhookNotification;
let Dispute = require('../../../lib/braintree/dispute').Dispute;
let Transaction = require('../../../lib/braintree/transaction').Transaction;
let errorTypes = require('../../../lib/braintree').errorTypes;

describe('WebhookNotificationGateway', function () {
  describe('verify', function () {
    it('creates a verification string for the challenge', function () {
      let result = specHelper.defaultGateway.webhookNotification.verify('20f9f8ed05f77439fe955c977e4c8a53');

      assert.equal(result, 'integration_public_key|d9b899556c966b3f06945ec21311865d35df3ce4');
    });

    it('throws an error when challenge contains non-hex chars', function (done) {
      let webhookNotification = specHelper.defaultGateway.webhookNotification;

      assert.throws(() => webhookNotification.verify('bad challenge'));
      done();
    });

    it('returns an errback with InvalidChallengeError when challenge contains non-hex chars', done =>
      specHelper.defaultGateway.webhookNotification.verify('bad challenge', function (err) {
        assert.equal(err.type, errorTypes.invalidChallengeError);
        assert.equal(err.message, 'challenge contains non-hex characters');
        done();
      })
    );
  });

  describe('sampleNotification', function () {
    it('returns a parsable signature and payload', function (done) {
      let notification = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.SubscriptionWentPastDue,
        'my_id'
      );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function (err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.SubscriptionWentPastDue);
        assert.equal(webhookNotification.subscription.id, 'my_id');
        assert.ok(webhookNotification.timestamp != null);
        assert.notExists(webhookNotification.sourceMerchantId);
        done();
      });
    });

    it('returns a source merchant ID if supplied', function (done) {
      let notification = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.SubscriptionWentPastDue,
        'my_id',
        'my_source_merchant_id'
      );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function (err, webhookNotification) {
        assert.notExists(err);
        assert.equal(webhookNotification.sourceMerchantId, 'my_source_merchant_id');
        done();
      });
    });

    it('retries a payload with a newline', function (done) {
      let notification = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.SubscriptionWentPastDue,
        'my_id'
      );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload.replace(/\n$/, ''), function (err, webhookNotification) {
        assert.equal(err, null);
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.SubscriptionWentPastDue);
        assert.equal(webhookNotification.subscription.id, 'my_id');
        assert.ok(webhookNotification.timestamp != null);
        done();
      });
    });

    it('returns an errback with InvalidSignatureError when signature is invalid', function (done) {
      let notification = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.SubscriptionWentPastDue,
        'my_id'
      );
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse('bad_signature', bt_payload, function (err) {
        assert.equal(err.type, errorTypes.invalidSignatureError);
        done();
      });
    });

    it('returns an errback with InvalidSignatureError when the public key does not match', function (done) {
      let notification = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.SubscriptionWentPastDue,
        'my_id'
      );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(`bad${bt_signature}`, bt_payload, function (err) {
        assert.equal(err.type, errorTypes.invalidSignatureError);
        assert.equal(err.message, 'no matching public key');
        done();
      });
    });

    it('returns an errback with InvalidSignatureError when the signature is modified', function (done) {
      let notification = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.SubscriptionWentPastDue,
        'my_id'
      );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(`${bt_signature}bad`, bt_payload, function (err) {
        assert.equal(err.type, errorTypes.invalidSignatureError);
        done();
      });
    });

    it('returns an errback with InvalidSignatureError when the payload is modified', function (done) {
      let notification = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.SubscriptionWentPastDue,
        'my_id'
      );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(bt_signature, `bad${bt_payload}`, function (err) {
        assert.equal(err.type, errorTypes.invalidSignatureError);
        assert.equal(err.message, 'signature does not match payload - one has been modified');
        done();
      });
    });

    it('returns an errback with InvalidSignatureError when the payload contains invalid characters', function (done) {
      let notification = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.SubscriptionWentPastDue,
        'my_id'
      );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      bt_payload = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+=/\n';

      specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function (err) {
        assert.equal(err.type, errorTypes.invalidSignatureError);
        assert.notEqual(err.message, 'payload contains illegal characters');
        done();
      });
    });

    it('allows all valid characters', function (done) {
      let notification = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.SubscriptionWentPastDue,
        'my_id'
      );
      let bt_signature = notification.bt_signature;

      specHelper.defaultGateway.webhookNotification.parse(bt_signature, '^& bad ,* chars @!', function (err) {
        assert.equal(err.type, errorTypes.invalidSignatureError);
        assert.equal(err.message, 'payload contains illegal characters');
        done();
      });
    });
    it('returns a parsable signature and payload for merchant account approvals', function (done) {
      let notification = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.SubMerchantAccountApproved,
        'my_id'
      );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function (err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.SubMerchantAccountApproved);
        assert.equal(webhookNotification.merchantAccount.id, 'my_id');
        assert.ok(webhookNotification.timestamp != null);
        done();
      });
    });

    it('returns a parsable signature and payload for merchant account declines', function (done) {
      let notification = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.SubMerchantAccountDeclined,
        'my_id'
      );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function (err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.SubMerchantAccountDeclined);
        assert.equal(webhookNotification.merchantAccount.id, 'my_id');
        assert.equal(webhookNotification.errors.for('merchantAccount').on('base')[0].code, ValidationErrorCodes.MerchantAccount.ApplicantDetails.DeclinedOFAC);
        assert.equal(webhookNotification.message, 'Credit score is too low');
        assert.ok(webhookNotification.timestamp != null);
        done();
      });
    });

    it('returns a parsable signature and payload for disbursed transaction', function (done) {
      let notification = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.TransactionDisbursed,
        'my_id'
      );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function (err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.TransactionDisbursed);
        assert.equal(webhookNotification.transaction.id, 'my_id');
        assert.equal(webhookNotification.transaction.amount, '100');
        assert.ok(webhookNotification.transaction.disbursementDetails.disbursementDate != null);
        done();
      });
    });

    it('returns a parsable signature and payload for settled transaction', function (done) {
      let notification = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.TransactionSettled,
        'my_id'
      );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function (err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.TransactionSettled);
        assert.equal(webhookNotification.transaction.id, 'my_id');
        assert.equal(webhookNotification.transaction.amount, '100');
        assert.equal(webhookNotification.transaction.status, Transaction.Status.Settled);
        assert.equal(webhookNotification.transaction.usBankAccount.last4, '1234');
        assert.equal(webhookNotification.transaction.usBankAccount.accountHolderName, 'Dan Schulman');
        assert.equal(webhookNotification.transaction.usBankAccount.routingNumber, '123456789');
        assert.equal(webhookNotification.transaction.usBankAccount.accountType, 'checking');
        done();
      });
    });

    it('returns a parsable signature and payload for settlement declined transaction', function (done) {
      let notification = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.TransactionSettlementDeclined,
        'my_id'
      );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function (err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.TransactionSettlementDeclined);
        assert.equal(webhookNotification.transaction.id, 'my_id');
        assert.equal(webhookNotification.transaction.amount, '100');
        assert.equal(webhookNotification.transaction.status, Transaction.Status.SettlementDeclined);
        assert.equal(webhookNotification.transaction.usBankAccount.last4, '1234');
        assert.equal(webhookNotification.transaction.usBankAccount.accountHolderName, 'Dan Schulman');
        assert.equal(webhookNotification.transaction.usBankAccount.routingNumber, '123456789');
        assert.equal(webhookNotification.transaction.usBankAccount.accountType, 'checking');
        done();
      });
    });

    it('returns a parsable signature and payload for dispute opened', function (done) {
      let notification = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.DisputeOpened,
        'my_id'
      );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function (err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.DisputeOpened);
        assert.equal(Dispute.Status.Open, webhookNotification.dispute.status);
        assert.equal(Dispute.Kind.Chargeback, webhookNotification.dispute.kind);
        assert.equal('2014-03-28', webhookNotification.dispute.dateOpened);
        done();
      });
    });

    it('returns a parsable signature and payload for dispute lost', function (done) {
      let notification = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.DisputeLost,
        'my_id'
      );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function (err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.DisputeLost);
        assert.equal(Dispute.Status.Lost, webhookNotification.dispute.status);
        assert.equal(Dispute.Kind.Chargeback, webhookNotification.dispute.kind);
        assert.equal('2014-03-28', webhookNotification.dispute.dateOpened);
        done();
      });
    });

    it('returns a parsable signature and payload for dispute won', function (done) {
      let notification = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.DisputeWon,
        'my_id'
      );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function (err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.DisputeWon);
        assert.equal(Dispute.Status.Won, webhookNotification.dispute.status);
        assert.equal(Dispute.Kind.Chargeback, webhookNotification.dispute.kind);
        assert.equal('2014-03-28', webhookNotification.dispute.dateOpened);
        assert.equal('2014-09-01', webhookNotification.dispute.dateWon);
        done();
      });
    });

    it('returns a parsable signature and payload for a disbursed webhook', function (done) {
      let notification = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.Disbursement,
        'my_id'
      );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function (err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.Disbursement);
        assert.equal(webhookNotification.disbursement.id, 'my_id');
        assert.equal(webhookNotification.disbursement.amount, '100.00');
        assert.equal(webhookNotification.disbursement.transactionIds[0], 'afv56j');
        assert.equal(webhookNotification.disbursement.transactionIds[1], 'kj8hjk');
        assert.equal(webhookNotification.disbursement.success, true);
        assert.equal(webhookNotification.disbursement.retry, false);
        assert.equal(webhookNotification.disbursement.disbursementDate, '2014-02-10');
        assert.equal(webhookNotification.disbursement.merchantAccount.id, 'merchant_account_token');
        assert.equal(webhookNotification.disbursement.merchantAccount.currencyIsoCode, 'USD');
        assert.equal(webhookNotification.disbursement.merchantAccount.subMerchantAccount, false);
        assert.equal(webhookNotification.disbursement.merchantAccount.status, 'active');

        done();
      });
    });

    it('returns a parsable signature and payload for disbursement exception webhook', function (done) {
      let notification = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.DisbursementException,
        'my_id'
      );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function (err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.DisbursementException);
        assert.equal(webhookNotification.disbursement.id, 'my_id');
        assert.equal(webhookNotification.disbursement.amount, '100.00');
        assert.equal(webhookNotification.disbursement.transactionIds[0], 'afv56j');
        assert.equal(webhookNotification.disbursement.transactionIds[1], 'kj8hjk');
        assert.equal(webhookNotification.disbursement.success, false);
        assert.equal(webhookNotification.disbursement.retry, false);
        assert.equal(webhookNotification.disbursement.disbursementDate, '2014-02-10');
        assert.equal(webhookNotification.disbursement.exceptionMessage, 'bank_rejected');
        assert.equal(webhookNotification.disbursement.followUpAction, 'update_funding_information');
        assert.equal(webhookNotification.disbursement.merchantAccount.id, 'merchant_account_token');
        assert.equal(webhookNotification.disbursement.merchantAccount.currencyIsoCode, 'USD');
        assert.equal(webhookNotification.disbursement.merchantAccount.subMerchantAccount, false);
        assert.equal(webhookNotification.disbursement.merchantAccount.status, 'active');

        done();
      });
    });

    it('builds a sample notification for a partner merchant connected webhook', function (done) {
      let notification = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.PartnerMerchantConnected,
        'my_id'
      );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function (err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.PartnerMerchantConnected);
        assert.equal(webhookNotification.partnerMerchant.publicKey, 'public_key');
        assert.equal(webhookNotification.partnerMerchant.privateKey, 'private_key');
        assert.equal(webhookNotification.partnerMerchant.clientSideEncryptionKey, 'cse_key');
        assert.equal(webhookNotification.partnerMerchant.merchantPublicId, 'public_id');
        assert.equal(webhookNotification.partnerMerchant.partnerMerchantId, 'abc123');
        assert.ok(webhookNotification.timestamp != null);
        done();
      });
    });

    it('builds a sample notification for a partner merchant disconnected webhook', function (done) {
      let notification = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.PartnerMerchantDisconnected,
        'my_id'
      );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function (err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.PartnerMerchantDisconnected);
        assert.equal(webhookNotification.partnerMerchant.partnerMerchantId, 'abc123');
        assert.ok(webhookNotification.timestamp != null);
        done();
      });
    });

    it('builds a sample notification for a partner merchant declined webhook', function (done) {
      let notification = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.PartnerMerchantDeclined,
        'my_id'
      );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function (err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.PartnerMerchantDeclined);
        assert.equal(webhookNotification.partnerMerchant.partnerMerchantId, 'abc123');
        assert.ok(webhookNotification.timestamp != null);
        done();
      });
    });

    it('builds a sample notification for a connected merchant status transitioned webhook', (done) => {
      let notification = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.ConnectedMerchantStatusTransitioned,
        'my_id'
      );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function (err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.ConnectedMerchantStatusTransitioned);
        assert.equal(webhookNotification.connectedMerchantStatusTransitioned.merchantPublicId, 'my_id');
        assert.equal(webhookNotification.connectedMerchantStatusTransitioned.status, 'new_status');
        assert.equal(webhookNotification.connectedMerchantStatusTransitioned.oauthApplicationClientId, 'oauth_application_client_id');
        assert.ok(webhookNotification.timestamp != null);
        done();
      });
    });

    it('builds a sample notification for a connected merchant paypal status changed webhook', (done) => {
      let notification = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.ConnectedMerchantPayPalStatusChanged,
        'my_id'
      );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function (err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.ConnectedMerchantPayPalStatusChanged);
        assert.equal(webhookNotification.connectedMerchantPayPalStatusChanged.merchantPublicId, 'my_id');
        assert.equal(webhookNotification.connectedMerchantPayPalStatusChanged.action, 'link');
        assert.equal(webhookNotification.connectedMerchantPayPalStatusChanged.oauthApplicationClientId, 'oauth_application_client_id');
        assert.ok(webhookNotification.timestamp != null);
        done();
      });
    });

    it('builds a sample notification for a successfully charged subscription', function (done) {
      let notification = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.SubscriptionChargedSuccessfully,
        'my_id'
      );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function (err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.SubscriptionChargedSuccessfully);
        assert.equal(webhookNotification.subscription.id, 'my_id');
        assert.equal(webhookNotification.subscription.transactions.length, 1);

        let transaction = webhookNotification.subscription.transactions.pop();

        assert.equal(transaction.status, 'submitted_for_settlement');
        assert.equal(transaction.amount, 49.99);
        done();
      });
    });

    it('builds a sample notification for a check notifications', function (done) {
      let notification = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.Check,
        ''
      );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function (err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.Check);
        done();
      });
    });

    it('returns a parsable signature and payload for account updater daily report', function (done) {
      let notification = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.AccountUpdaterDailyReport,
        'my_id'
      );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function (err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.AccountUpdaterDailyReport);
        assert.equal('link-to-csv-report', webhookNotification.accountUpdaterDailyReport.reportUrl);
        assert.equal('2016-01-14', webhookNotification.accountUpdaterDailyReport.reportDate);
        done();
      });
    });

    it('returns a parsable signature and payload for iDEAL payment complete', function (done) {
      let notification = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.IdealPaymentComplete,
        'my_id'
      );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function (err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.IdealPaymentComplete);
        assert.equal('my_id', webhookNotification.idealPayment.id);
        assert.equal('COMPLETE', webhookNotification.idealPayment.status);
        assert.equal('ORDERABC', webhookNotification.idealPayment.orderId);
        assert.equal('1234567890', webhookNotification.idealPayment.idealTransactionId);
        done();
      });
    });

    it('returns a parsable signature and payload for iDEAL payment failed', function (done) {
      let notification = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.IdealPaymentFailed,
        'my_id'
      );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function (err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.IdealPaymentFailed);
        assert.equal('my_id', webhookNotification.idealPayment.id);
        assert.equal('FAILED', webhookNotification.idealPayment.status);
        assert.equal('ORDERABC', webhookNotification.idealPayment.orderId);
        assert.equal('1234567890', webhookNotification.idealPayment.idealTransactionId);
        done();
      });
    });

    it('returns a parsable signature and payload for Granted Payment Instrument Update', function (done) {
      let notification = specHelper.defaultGateway.webhookTesting.sampleNotification(
        WebhookNotification.Kind.GrantedPaymentInstrumentUpdate,
        'my_id'
      );
      let bt_signature = notification.bt_signature;
      let bt_payload = notification.bt_payload;

      specHelper.defaultGateway.webhookNotification.parse(bt_signature, bt_payload, function (err, webhookNotification) {
        assert.equal(webhookNotification.kind, WebhookNotification.Kind.GrantedPaymentInstrumentUpdate);

        let update = webhookNotification.subject.grantedPaymentInstrumentUpdate;

        assert.equal('vczo7jqrpwrsi2px', update.grantOwnerMerchantId);
        assert.equal('cf0i8wgarszuy6hc', update.grantRecipientMerchantId);
        assert.equal('ee257d98-de40-47e8-96b3-a6954ea7a9a4', update.paymentMethodNonce.nonce);
        assert.equal('abc123z', update.token);
        assert.equal('expiration-month', update.updatedFields[0]);
        assert.equal('expiration-year', update.updatedFields[1]);
        done();
      });
    });
  });
});
