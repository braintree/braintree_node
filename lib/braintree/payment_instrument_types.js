"use strict";

let PaymentInstrumentTypes = {
  // NEXT_MAJOR_VERSION rename Android Pay to Google Pay
  AndroidPayCard: "android_pay_card",
  ApplePayCard: "apple_pay_card",
  CreditCard: "credit_card",
  EuropeBankAccount: "europe_bank_account",
  LocalPayment: "local_payment",
  PayPalAccount: "paypal_account",
  PayPalHere: "paypal_here",
  UsBankAccount: "us_bank_account",
  VenmoAccount: "venmo_account",
  VisaCheckoutCard: "visa_checkout_card",
};

module.exports = { PaymentInstrumentTypes: PaymentInstrumentTypes };
