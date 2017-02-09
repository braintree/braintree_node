'use strict';

let AttributeSetter = require('./attribute_setter').AttributeSetter;
let MerchantAccount = require('./merchant_account').MerchantAccount;
let Transaction = require('./transaction').Transaction;
let Disbursement = require('./disbursement').Disbursement;
let Dispute = require('./dispute').Dispute;
let PartnerMerchant = require('./partner_merchant').PartnerMerchant;
let Subscription = require('./subscription').Subscription;
let AccountUpdaterDailyReport = require('./account_updater_daily_report').AccountUpdaterDailyReport;
let ValidationErrorsCollection = require('./validation_errors_collection').ValidationErrorsCollection;

class WebhookNotification extends AttributeSetter {
  static initClass() {
    this.Kind = {
      AccountUpdaterDailyReport: 'account_updater_daily_report',
      Check: 'check',
      Disbursement: 'disbursement',
      DisbursementException: 'disbursement_exception',
      DisputeOpened: 'dispute_opened',
      DisputeLost: 'dispute_lost',
      DisputeWon: 'dispute_won',
      PartnerMerchantConnected: 'partner_merchant_connected',
      PartnerMerchantDisconnected: 'partner_merchant_disconnected',
      PartnerMerchantDeclined: 'partner_merchant_declined',
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
  }

  constructor(attributes) {
    super(attributes);

    let wrapperNode;

    if (attributes.subject.apiErrorResponse != null) {
      wrapperNode = attributes.subject.apiErrorResponse;
    } else {
      wrapperNode = attributes.subject;
    }

    if (wrapperNode.subscription != null) {
      this.subscription = new Subscription(wrapperNode.subscription);
    }

    if (wrapperNode.merchantAccount != null) {
      this.merchantAccount = new MerchantAccount(wrapperNode.merchantAccount);
    }

    if (wrapperNode.disbursement != null) {
      this.disbursement = new Disbursement(wrapperNode.disbursement);
    }

    if (wrapperNode.transaction != null) {
      this.transaction = new Transaction(wrapperNode.transaction);
    }

    if (wrapperNode.partnerMerchant != null) {
      this.partnerMerchant = new PartnerMerchant(wrapperNode.partnerMerchant);
    }

    if (wrapperNode.dispute != null) {
      this.dispute = new Dispute(wrapperNode.dispute);
    }

    if (wrapperNode.accountUpdaterDailyReport != null) {
      this.accountUpdaterDailyReport = new AccountUpdaterDailyReport(wrapperNode.accountUpdaterDailyReport);
    }

    if (wrapperNode.errors != null) {
      this.errors = new ValidationErrorsCollection(wrapperNode.errors);
      this.message = wrapperNode.message;
    }
  }
}
WebhookNotification.initClass();

module.exports = {WebhookNotification: WebhookNotification};
