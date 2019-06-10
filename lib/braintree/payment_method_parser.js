'use strict';

let ApplePayCard = require('./apple_pay_card').ApplePayCard;
let AndroidPayCard = require('./android_pay_card').AndroidPayCard;
let CreditCard = require('./credit_card').CreditCard;
let PayPalAccount = require('./paypal_account').PayPalAccount;
let CoinbaseAccount = require('./coinbase_account').CoinbaseAccount;
let UnknownPaymentMethod = require('./unknown_payment_method').UnknownPaymentMethod;
let PaymentMethodNonce = require('./payment_method_nonce').PaymentMethodNonce;
let UsBankAccount = require('./us_bank_account').UsBankAccount;
let VenmoAccount = require('./venmo_account').VenmoAccount;
let VisaCheckoutCard = require('./visa_checkout_card').VisaCheckoutCard;
let MasterpassCard = require('./masterpass_card').MasterpassCard;
let SamsungPayCard = require('./samsung_pay_card').SamsungPayCard;

class PaymentMethodParser {
  static parsePaymentMethod(response) {
    if (response.creditCard) {
      return new CreditCard(response.creditCard);
    } else if (response.paypalAccount) {
      return new PayPalAccount(response.paypalAccount);
    } else if (response.applePayCard) {
      return new ApplePayCard(response.applePayCard);
    } else if (response.androidPayCard) {
      return new AndroidPayCard(response.androidPayCard);
    } else if (response.coinbaseAccount) {
      return new CoinbaseAccount(response.coinbaseAccount);
    } else if (response.paymentMethodNonce) {
      return new PaymentMethodNonce(response.paymentMethodNonce);
    } else if (response.usBankAccount) {
      return new UsBankAccount(response.usBankAccount);
    } else if (response.venmoAccount) {
      return new VenmoAccount(response.venmoAccount);
    } else if (response.visaCheckoutCard) {
      return new VisaCheckoutCard(response.visaCheckoutCard);
    } else if (response.masterpassCard) {
      return new MasterpassCard(response.masterpassCard);
    } else if (response.samsungPayCard) {
      return new SamsungPayCard(response.samsungPayCard);
    }

    return new UnknownPaymentMethod(response);
  }
}

module.exports = {PaymentMethodParser: PaymentMethodParser};
