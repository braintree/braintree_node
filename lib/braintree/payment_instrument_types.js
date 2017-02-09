'use strict';

let PaymentInstrumentTypes = {
  PayPalAccount: 'paypal_account',
  EuropeBankAccount: 'europe_bank_account',
  UsBankAccount: 'us_bank_account',
  CreditCard: 'credit_card',
  CoinbaseAccount: 'coinbase_account',
  ApplePayCard: 'apple_pay_card',
  AndroidPayCard: 'android_pay_card',
  AmexExpressCheckoutCard: 'amex_express_checkout_card',
  VenmoAccount: 'venmo_account'
};

module.exports = {PaymentInstrumentTypes: PaymentInstrumentTypes};
