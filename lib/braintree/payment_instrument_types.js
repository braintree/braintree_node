'use strict';

let PaymentInstrumentTypes = {
  AmexExpressCheckoutCard: 'amex_express_checkout_card',
  AndroidPayCard: 'android_pay_card',
  ApplePayCard: 'apple_pay_card',
  CoinbaseAccount: 'coinbase_account',
  CreditCard: 'credit_card',
  EuropeBankAccount: 'europe_bank_account',
  LocalPayment: 'local_payment',
  MasterpassCard: 'masterpass_card',
  PayPalAccount: 'paypal_account',
  PayPalHere: 'paypal_here',
  UsBankAccount: 'us_bank_account',
  VenmoAccount: 'venmo_account',
  VisaCheckoutCard: 'visa_checkout_card'
};

module.exports = {PaymentInstrumentTypes: PaymentInstrumentTypes};
