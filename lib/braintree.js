'use strict';

let version = require('../package.json').version;
let Config = require('./braintree/config').Config;
let Environment = require('./braintree/environment').Environment;
let BraintreeGateway = require('./braintree/braintree_gateway').BraintreeGateway;
let errorTypes = require('./braintree/error_types').errorTypes;

let Transaction = require('./braintree/transaction').Transaction;

let CreditCard = require('./braintree/credit_card').CreditCard;
let PayPalAccount = require('./braintree/paypal_account').PayPalAccount;
let AndroidPayCard = require('./braintree/android_pay_card').AndroidPayCard;
let ApplePayCard = require('./braintree/apple_pay_card').ApplePayCard;
let VenmoAccount = require('./braintree/venmo_account').VenmoAccount;
let CoinbaseAccount = require('./braintree/coinbase_account').CoinbaseAccount;
let AmexExpressCheckoutCard = require('./braintree/amex_express_checkout_card').AmexExpressCheckoutCard;

let CreditCardVerification = require('./braintree/credit_card_verification').CreditCardVerification;
let Subscription = require('./braintree/subscription').Subscription;
let MerchantAccount = require('./braintree/merchant_account').MerchantAccount;
let PaymentInstrumentTypes = require('./braintree/payment_instrument_types').PaymentInstrumentTypes;
let WebhookNotification = require('./braintree/webhook_notification').WebhookNotification;
let TestingGateway = require('./braintree/testing_gateway').TestingGateway;
let ValidationErrorCodes = require('./braintree/validation_error_codes').ValidationErrorCodes;

let CreditCardDefaults = require('./braintree/test/credit_card_defaults').CreditCardDefaults;
let CreditCardNumbers = require('./braintree/test/credit_card_numbers').CreditCardNumbers;
let MerchantAccountTest = require('./braintree/test/merchant_account').MerchantAccountTest;
let Nonces = require('./braintree/test/nonces').Nonces;
let TransactionAmounts = require('./braintree/test/transaction_amounts').TransactionAmounts;

let connect = config => new BraintreeGateway(new Config(config)); // eslint-disable-line func-style
let Test = {
  CreditCardDefaults: CreditCardDefaults,
  CreditCardNumbers: CreditCardNumbers,
  MerchantAccountTest: MerchantAccountTest,
  Nonces: Nonces,
  TransactionAmounts: TransactionAmounts
};

module.exports = {
  connect: connect,
  version: version,
  Environment: Environment,
  errorTypes: errorTypes,

  Transaction: Transaction,

  CreditCard: CreditCard,
  PayPalAccount: PayPalAccount,
  AndroidPayCard: AndroidPayCard,
  ApplePayCard: ApplePayCard,
  VenmoAccount: VenmoAccount,
  CoinbaseAccount: CoinbaseAccount,
  AmexExpressCheckoutCard: AmexExpressCheckoutCard,

  CreditCardVerification: CreditCardVerification,
  Subscription: Subscription,
  MerchantAccount: MerchantAccount,
  PaymentInstrumentTypes: PaymentInstrumentTypes,
  WebhookNotification: WebhookNotification,
  TestingGateway: TestingGateway,
  ValidationErrorCodes: ValidationErrorCodes,

  Test: Test
};
