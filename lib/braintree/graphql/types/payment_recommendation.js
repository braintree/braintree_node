"use strict";

/**
 * @experimental
 * Represents the payment method and priority associated with a PayPal customer session.
 */
class PaymentRecommendation {
  constructor(paymentOption, recommendedPriority) {
    this.paymentOption = paymentOption;
    this.recommendedPriority = recommendedPriority;
  }
}

module.exports = PaymentRecommendation;
