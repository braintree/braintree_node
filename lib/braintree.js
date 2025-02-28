"use strict";

let version = require("../package.json").version;
let Environment = require("./braintree/environment").Environment;
let BraintreeGateway =
  require("./braintree/braintree_gateway").BraintreeGateway;
let GraphQL = require("./braintree/graphql");
let errorTypes = require("./braintree/error_types").errorTypes;
let exceptions = require("./braintree/exceptions");

let Transaction = require("./braintree/transaction").Transaction;

let CreditCard = require("./braintree/credit_card").CreditCard;
let Dispute = require("./braintree/dispute").Dispute;
let PayPalAccount = require("./braintree/paypal_account").PayPalAccount;
// NEXT_MAJOR_VERSION rename Android Pay to Google Pay
let AndroidPayCard = require("./braintree/android_pay_card").AndroidPayCard;
let ApplePayCard = require("./braintree/apple_pay_card").ApplePayCard;
let VenmoAccount = require("./braintree/venmo_account").VenmoAccount;
let VisaCheckoutCard =
  require("./braintree/visa_checkout_card").VisaCheckoutCard;
// NEXT_MAJOR_VERSION remove SamsungPayCard
let SamsungPayCard = require("./braintree/samsung_pay_card").SamsungPayCard;

let CreditCardVerification =
  require("./braintree/credit_card_verification").CreditCardVerification;
let Plan = require("./braintree/plan").Plan;
let Subscription = require("./braintree/subscription").Subscription;
let MerchantAccount = require("./braintree/merchant_account").MerchantAccount;
let PaymentInstrumentTypes =
  require("./braintree/payment_instrument_types").PaymentInstrumentTypes;
let WebhookNotification =
  require("./braintree/webhook_notification").WebhookNotification;
let TestingGateway = require("./braintree/testing_gateway").TestingGateway;
let UsBankAccountVerification =
  require("./braintree/us_bank_account_verification").UsBankAccountVerification;
let ValidationErrorCodes =
  require("./braintree/validation_error_codes").ValidationErrorCodes;

let CreditCardDefaults =
  require("./braintree/test_values/credit_card_defaults").CreditCardDefaults;
let CreditCardNumbers =
  require("./braintree/test_values/credit_card_numbers").CreditCardNumbers;
let MerchantAccountTest =
  require("./braintree/test_values/merchant_account").MerchantAccountTest;
let Nonces = require("./braintree/test_values/nonces").Nonces;
let TransactionAmounts =
  require("./braintree/test_values/transaction_amounts").TransactionAmounts;

let Test = {
  CreditCardDefaults: CreditCardDefaults,
  CreditCardNumbers: CreditCardNumbers,
  MerchantAccountTest: MerchantAccountTest,
  Nonces: Nonces,
  TransactionAmounts: TransactionAmounts,
};

module.exports = {
  BraintreeGateway: BraintreeGateway,
  GraphQL: GraphQL,
  version: version,
  Environment: Environment,
  errorTypes: errorTypes,
  exceptions: exceptions,

  Transaction: Transaction,

  CreditCard: CreditCard,
  Dispute: Dispute,
  PayPalAccount: PayPalAccount,
  AndroidPayCard: AndroidPayCard,
  ApplePayCard: ApplePayCard,
  VenmoAccount: VenmoAccount,
  VisaCheckoutCard: VisaCheckoutCard,
  SamsungPayCard: SamsungPayCard,

  CreditCardVerification: CreditCardVerification,
  Plan: Plan,
  Subscription: Subscription,
  MerchantAccount: MerchantAccount,
  PaymentInstrumentTypes: PaymentInstrumentTypes,
  WebhookNotification: WebhookNotification,
  TestingGateway: TestingGateway,
  UsBankAccountVerification: UsBankAccountVerification,
  ValidationErrorCodes: ValidationErrorCodes,

  Test: Test,
};
