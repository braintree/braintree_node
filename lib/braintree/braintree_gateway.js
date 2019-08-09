'use strict';

let Http = require('./http').Http;
let Config = require('./config').Config;
let GraphQLClient = require('./graphql_client').GraphQLClient;
let AddOnGateway = require('./add_on_gateway').AddOnGateway;
let AddressGateway = require('./address_gateway').AddressGateway;
let ClientTokenGateway = require('./client_token_gateway').ClientTokenGateway;
let CreditCardGateway = require('./credit_card_gateway').CreditCardGateway;
let CreditCardVerificationGateway = require('./credit_card_verification_gateway').CreditCardVerificationGateway;
let CustomerGateway = require('./customer_gateway').CustomerGateway;
let DisbursementGateway = require('./disbursement_gateway').DisbursementGateway;
let DiscountGateway = require('./discount_gateway').DiscountGateway;
let DisputeGateway = require('./dispute_gateway').DisputeGateway;
let DocumentUploadGateway = require('./document_upload_gateway').DocumentUploadGateway;
let MerchantAccountGateway = require('./merchant_account_gateway').MerchantAccountGateway;
let MerchantGateway = require('./merchant_gateway').MerchantGateway;
let OAuthGateway = require('./oauth_gateway').OAuthGateway;
let PaymentMethodGateway = require('./payment_method_gateway').PaymentMethodGateway;
let PaymentMethodNonceGateway = require('./payment_method_nonce_gateway').PaymentMethodNonceGateway;
let PayPalAccountGateway = require('./paypal_account_gateway').PayPalAccountGateway;
let PlanGateway = require('./plan_gateway').PlanGateway;
let SettlementBatchSummaryGateway = require('./settlement_batch_summary_gateway').SettlementBatchSummaryGateway;
let SubscriptionGateway = require('./subscription_gateway').SubscriptionGateway;
let TestingGateway = require('./testing_gateway').TestingGateway;
let TransactionGateway = require('./transaction_gateway').TransactionGateway;
let TransactionLineItemGateway = require('./transaction_line_item_gateway').TransactionLineItemGateway;
let TransparentRedirectGateway = require('./transparent_redirect_gateway').TransparentRedirectGateway;
let UsBankAccountGateway = require('./us_bank_account_gateway').UsBankAccountGateway;
let UsBankAccountVerificationGateway = require('./us_bank_account_verification_gateway').UsBankAccountVerificationGateway;
// NEXT_MAJOR_VERSION Remove this class as legacy Ideal has been removed/disabled in the Braintree Gateway
// DEPRECATED If you're looking to accept iDEAL as a payment method contact accounts@braintreepayments.com for a solution.
let IdealPaymentGateway = require('./ideal_payment_gateway').IdealPaymentGateway;
let WebhookNotificationGateway = require('./webhook_notification_gateway').WebhookNotificationGateway;
let WebhookTestingGateway = require('./webhook_testing_gateway').WebhookTestingGateway;

class BraintreeGateway {
  constructor(config) {
    if (this.config instanceof Config) {
      this.config = config;
    } else {
      this.config = new Config(config);
    }
    this.graphQLClient = new GraphQLClient(this.config);
    this.http = new Http(this.config);
    this.addOn = new AddOnGateway(this);
    this.address = new AddressGateway(this);
    this.clientToken = new ClientTokenGateway(this);
    this.creditCard = new CreditCardGateway(this);
    this.creditCardVerification = new CreditCardVerificationGateway(this);
    this.customer = new CustomerGateway(this);
    this.disbursement = new DisbursementGateway(this);
    this.discount = new DiscountGateway(this);
    this.dispute = new DisputeGateway(this);
    this.documentUpload = new DocumentUploadGateway(this);
    this.merchantAccount = new MerchantAccountGateway(this);
    this.merchant = new MerchantGateway(this);
    this.oauth = new OAuthGateway(this);
    this.paymentMethod = new PaymentMethodGateway(this);
    this.paymentMethodNonce = new PaymentMethodNonceGateway(this);
    this.paypalAccount = new PayPalAccountGateway(this);
    this.plan = new PlanGateway(this);
    this.settlementBatchSummary = new SettlementBatchSummaryGateway(this);
    this.subscription = new SubscriptionGateway(this);
    this.testing = new TestingGateway(this);
    this.transaction = new TransactionGateway(this);
    this.transactionLineItem = new TransactionLineItemGateway(this);
    this.transparentRedirect = new TransparentRedirectGateway(this);
    this.usBankAccount = new UsBankAccountGateway(this);
    this.usBankAccountVerification = new UsBankAccountVerificationGateway(this);
    // NEXT_MAJOR_VERSION Remove this class as legacy Ideal has been removed/disabled in the Braintree Gateway
    // DEPRECATED If you're looking to accept iDEAL as a payment method contact accounts@braintreepayments.com for a solution.
    this.idealPayment = new IdealPaymentGateway(this);
    this.webhookNotification = new WebhookNotificationGateway(this);
    this.webhookTesting = new WebhookTestingGateway(this);
  }
}

module.exports = {BraintreeGateway: BraintreeGateway};
