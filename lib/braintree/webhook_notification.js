'use strict';

let AttributeSetter = require('./attribute_setter').AttributeSetter;
let MerchantAccount = require('./merchant_account').MerchantAccount;
let Transaction = require('./transaction').Transaction;
let Disbursement = require('./disbursement').Disbursement;
let Dispute = require('./dispute').Dispute;
let ConnectedMerchantStatusTransitioned = require('./connected_merchant_status_transitioned').ConnectedMerchantStatusTransitioned;
let ConnectedMerchantPayPalStatusChanged = require('./connected_merchant_paypal_status_changed').ConnectedMerchantPayPalStatusChanged;
let PartnerMerchant = require('./partner_merchant').PartnerMerchant;
let OAuthAccessRevocation = require('./oauth_access_revocation').OAuthAccessRevocation;
let Subscription = require('./subscription').Subscription;
let AccountUpdaterDailyReport = require('./account_updater_daily_report').AccountUpdaterDailyReport;
// NEXT_MAJOR_VERSION Remove this class as legacy Ideal has been removed/disabled in the Braintree Gateway
// DEPRECATED If you're looking to accept iDEAL as a payment method contact accounts@braintreepayments.com for a solution.
let IdealPayment = require('./ideal_payment').IdealPayment;
let ValidationErrorsCollection = require('./validation_errors_collection').ValidationErrorsCollection;
let GrantedPaymentInstrumentUpdate = require('./granted_payment_instrument_update').GrantedPaymentInstrumentUpdate;
let RevokedPaymentMethodMetadata = require('./revoked_payment_method_metadata').RevokedPaymentMethodMetadata;
let LocalPaymentCompleted = require('./local_payment_completed').LocalPaymentCompleted;

const Kind = {
  AccountUpdaterDailyReport: 'account_updater_daily_report',
  Check: 'check',
  ConnectedMerchantPayPalStatusChanged: 'connected_merchant_paypal_status_changed',
  ConnectedMerchantStatusTransitioned: 'connected_merchant_status_transitioned',
  Disbursement: 'disbursement',
  DisbursementException: 'disbursement_exception',
  DisputeOpened: 'dispute_opened',
  DisputeLost: 'dispute_lost',
  DisputeWon: 'dispute_won',
  DisputeAccepted: 'dispute_accepted',
  DisputeDisputed: 'dispute_disputed',
  DisputeExpired: 'dispute_expired',
  GrantorUpdatedGrantedPaymentMethod: 'grantor_updated_granted_payment_method',
  // NEXT_MAJOR_VERSION remove GrantedPaymentInstrumentUpdate. Kind is not sent by Braintree Gateway.
  // Kind will either be GrantorUpdatedGrantedPaymentMethod or RecipientUpdatedGrantedPaymentMethod.
  GrantedPaymentInstrumentUpdate: 'granted_payment_instrument_update',
  GrantedPaymentMethodRevoked: 'granted_payment_method_revoked',
  // NEXT_MAJOR_VERSION Remove this class as legacy Ideal has been removed/disabled in the Braintree Gateway
  // DEPRECATED If you're looking to accept iDEAL as a payment method contact accounts@braintreepayments.com for a solution.
  IdealPaymentComplete: 'ideal_payment_complete',
  // NEXT_MAJOR_VERSION Remove this class as legacy Ideal has been removed/disabled in the Braintree Gateway
  // DEPRECATED If you're looking to accept iDEAL as a payment method contact accounts@braintreepayments.com for a solution.
  IdealPaymentFailed: 'ideal_payment_failed',
  LocalPaymentCompleted: 'local_payment_completed',
  PartnerMerchantConnected: 'partner_merchant_connected',
  PartnerMerchantDisconnected: 'partner_merchant_disconnected',
  PartnerMerchantDeclined: 'partner_merchant_declined',
  PaymentMethodRevokedByCustomer: 'payment_method_revoked_by_customer',
  OAuthAccessRevoked: 'oauth_access_revoked',
  RecipientUpdatedGrantedPaymentMethod: 'recipient_updated_granted_payment_method',
  SubscriptionCanceled: 'subscription_canceled',
  SubscriptionChargedSuccessfully: 'subscription_charged_successfully',
  SubscriptionChargedUnsuccessfully: 'subscription_charged_unsuccessfully',
  SubscriptionExpired: 'subscription_expired',
  SubscriptionTrialEnded: 'subscription_trial_ended',
  SubscriptionWentActive: 'subscription_went_active',
  SubscriptionWentPastDue: 'subscription_went_past_due',
  SubMerchantAccountApproved: 'sub_merchant_account_approved',
  SubMerchantAccountDeclined: 'sub_merchant_account_declined',
  TransactionDisbursed: 'transaction_disbursed',
  TransactionSettled: 'transaction_settled',
  TransactionSettlementDeclined: 'transaction_settlement_declined'
};

class WebhookNotification extends AttributeSetter {
  static initClass() {
    this.Kind = Kind;
  }

  constructor(attributes, gateway) {
    super(attributes, gateway);

    let wrapperNode;

    if (attributes.subject.apiErrorResponse != null) {
      wrapperNode = attributes.subject.apiErrorResponse;
    } else {
      wrapperNode = attributes.subject;
    }

    if (wrapperNode.subscription != null) {
      this.subscription = new Subscription(wrapperNode.subscription, gateway);
    }

    if (wrapperNode.merchantAccount != null) {
      this.merchantAccount = new MerchantAccount(wrapperNode.merchantAccount);
    }

    if (wrapperNode.disbursement != null) {
      this.disbursement = new Disbursement(wrapperNode.disbursement);
    }

    if (wrapperNode.transaction != null) {
      this.transaction = new Transaction(wrapperNode.transaction, gateway);
    }

    if (wrapperNode.partnerMerchant != null) {
      this.partnerMerchant = new PartnerMerchant(wrapperNode.partnerMerchant);
    }

    if (wrapperNode.oauthApplicationRevocation != null) {
      this.oauthAccessRevocation = new OAuthAccessRevocation(wrapperNode.oauthApplicationRevocation);
    }

    if (wrapperNode.connectedMerchantStatusTransitioned != null) {
      this.connectedMerchantStatusTransitioned = new ConnectedMerchantStatusTransitioned(wrapperNode.connectedMerchantStatusTransitioned);
    }

    if (wrapperNode.connectedMerchantPaypalStatusChanged != null) {
      this.connectedMerchantPayPalStatusChanged = new ConnectedMerchantPayPalStatusChanged(wrapperNode.connectedMerchantPaypalStatusChanged);
    }

    if (wrapperNode.dispute != null) {
      this.dispute = new Dispute(wrapperNode.dispute);
    }

    if (wrapperNode.accountUpdaterDailyReport != null) {
      this.accountUpdaterDailyReport = new AccountUpdaterDailyReport(wrapperNode.accountUpdaterDailyReport);
    }

    // NEXT_MAJOR_VERSION Remove this class as legacy Ideal has been removed/disabled in the Braintree Gateway
    // DEPRECATED If you're looking to accept iDEAL as a payment method contact accounts@braintreepayments.com for a solution.
    if (wrapperNode.idealPayment != null) {
      this.idealPayment = new IdealPayment(wrapperNode.idealPayment);
    }

    if (wrapperNode.grantedPaymentInstrumentUpdate != null) {
      // NEXT_MAJOR_VERSION remove GrantedPaymentInstrumentUpdate
      this.grantedPaymentInstrumentUpdate = new GrantedPaymentInstrumentUpdate(wrapperNode.grantedPaymentInstrumentUpdate);
      this.grantedPaymetnInstrumentUpdate = this.grantedPaymentInstrumentUpdate;
    }

    if ([Kind.GrantedPaymentMethodRevoked, Kind.PaymentMethodRevokedByCustomer].indexOf(attributes.kind) !== -1) {
      this.revokedPaymentMethodMetadata = new RevokedPaymentMethodMetadata(wrapperNode);
    }

    if (wrapperNode.localPayment != null) {
      this.localPaymentCompleted = new LocalPaymentCompleted(wrapperNode.localPayment, gateway);
    }

    if (wrapperNode.errors != null) {
      this.errors = new ValidationErrorsCollection(wrapperNode.errors);
      this.message = wrapperNode.message;
    }
  }
}
WebhookNotification.initClass();

module.exports = {WebhookNotification: WebhookNotification};
