"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;
let ApplePayCard = require("./apple_pay_card").ApplePayCard;
let AndroidPayCard = require("./android_pay_card").AndroidPayCard;
let CreditCard = require("./credit_card").CreditCard;
let PayPalAccount = require("./paypal_account").PayPalAccount;
let VenmoAccount = require("./venmo_account").VenmoAccount;
let UsBankAccount = require("./us_bank_account").UsBankAccount;

class Customer extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
    this.paymentMethods = [];

    if (attributes.creditCards) {
      this.creditCards = attributes.creditCards.map(
        (cardAttributes) => new CreditCard(cardAttributes)
      );
      this._addPaymentMethods(this.creditCards);
    }

    if (attributes.applePayCards) {
      this.applePayCards = attributes.applePayCards.map(
        (cardAttributes) => new ApplePayCard(cardAttributes)
      );
      this._addPaymentMethods(this.applePayCards);
    }

    // NEXT_MAJOR_VERSION rename Android Pay to Google Pay
    if (attributes.androidPayCards) {
      this.androidPayCards = attributes.androidPayCards.map(
        (cardAttributes) => new AndroidPayCard(cardAttributes)
      );
      this._addPaymentMethods(this.androidPayCards);
    }

    if (attributes.paypalAccounts) {
      this.paypalAccounts = attributes.paypalAccounts.map(
        (paypalAccountAttributes) => new PayPalAccount(paypalAccountAttributes)
      );
      this._addPaymentMethods(this.paypalAccounts);
    }

    if (attributes.venmoAccounts) {
      this.venmoAccounts = attributes.venmoAccounts.map(
        (venmoAccountAttributes) => new VenmoAccount(venmoAccountAttributes)
      );
      this._addPaymentMethods(this.venmoAccounts);
    }

    if (attributes.usBankAccounts) {
      this.usBankAccounts = attributes.usBankAccounts.map(
        (usBankAccountAttributes) => new UsBankAccount(usBankAccountAttributes)
      );
      this._addPaymentMethods(this.usBankAccounts);
    }
  }

  _addPaymentMethods(paymentMethods) {
    return paymentMethods.map((paymentMethod) =>
      this.paymentMethods.push(paymentMethod)
    );
  }
}

module.exports = { Customer: Customer };
