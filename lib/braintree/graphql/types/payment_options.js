"use strict";

/**
 * Represents the payment method and priority associated with a PayPal customer session.
 */
class PaymentOptions {
  constructor(paymentOption, recommendedPriority) {
    this.paymentOption = paymentOption;
    this.recommendedPriority = recommendedPriority;
  }
}

module.exports = PaymentOptions;
