'use strict';

let AccountUpdaterDailyReport = require('./account_updater_daily_report').AccountUpdaterDailyReport;
let AttributeSetter = require('./attribute_setter').AttributeSetter;
let ConnectedMerchantPayPalStatusChanged = require('./connected_merchant_paypal_status_changed').ConnectedMerchantPayPalStatusChanged;
let ConnectedMerchantStatusTransitioned = require('./connected_merchant_status_transitioned').ConnectedMerchantStatusTransitioned;
let Disbursement = require('./disbursement').Disbursement;
let Dispute = require('./dispute').Dispute;
let GrantedPaymentInstrumentUpdate = require('./granted_payment_instrument_update').GrantedPaymentInstrumentUpdate;
let LocalPaymentCompleted = require('./local_payment_completed').LocalPaymentCompleted;
let LocalPaymentReversed = require('./local_payment_reversed').LocalPaymentReversed;
let MerchantAccount = require('./merchant_account').MerchantAccount;
let OAuthAccessRevocation = require('./oauth_access_revocation').OAuthAccessRevocation;
let PartnerMerchant = require('./partner_merchant').PartnerMerchant;
let RevokedPaymentMethodMetadata = require('./revoked_payment_method_metadata').RevokedPaymentMethodMetadata;
let Subscription = require('./subscription').Subscription;
let Transaction = require('./transaction').Transaction;
let ValidationErrorsCollection = require('./validation_errors_collection').ValidationErrorsCollection;

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
  GrantedPaymentInstrumentUpdate: 'granted_payment_instrument_update',
  GrantedPaymentMethodRevoked: 'granted_payment_method_revoked',
  LocalPaymentCompleted: 'local_payment_completed',
  LocalPaymentReversed: 'local_payment_reversed',
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

    if (wrapperNode.grantedPaymentInstrumentUpdate != null && [Kind.GrantorUpdatedGrantedPaymentMethod, Kind.RecipientUpdatedGrantedPaymentMethod].indexOf(attributes.kind) !== -1) {
      this.grantedPaymentInstrumentUpdate = new GrantedPaymentInstrumentUpdate(wrapperNode.grantedPaymentInstrumentUpdate);
    }

    if ([Kind.GrantedPaymentMethodRevoked, Kind.PaymentMethodRevokedByCustomer].indexOf(attributes.kind) !== -1) {
      this.revokedPaymentMethodMetadata = new RevokedPaymentMethodMetadata(wrapperNode);
    }

    if (wrapperNode.localPayment != null && Kind.LocalPaymentCompleted === attributes.kind) {
      this.localPaymentCompleted = new LocalPaymentCompleted(wrapperNode.localPayment, gateway);
    }

    if (wrapperNode.localPaymentReversed != null && Kind.LocalPaymentReversed === attributes.kind) {
      this.localPaymentReversed = new LocalPaymentReversed(wrapperNode.localPaymentReversed, gateway);
    }

    if (wrapperNode.errors != null) {
      this.errors = new ValidationErrorsCollection(wrapperNode.errors);
      this.message = wrapperNode.message;
    }
  }
}
WebhookNotification.initClass();

module.exports = {WebhookNotification: WebhookNotification};
