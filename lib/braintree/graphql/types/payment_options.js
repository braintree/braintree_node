"use strict";

/**
 * @deprecated (Use PaymentRecommendation instead) Represents the payment method and priority associated with a PayPal customer session.
 */
// NEXT_MAJOR_VERSION remove this class
class PaymentOptions {
  constructor(paymentOption, recommendedPriority) {
    this.paymentOption = paymentOption;
    this.recommendedPriority = recommendedPriority;
  }
}

module.exports = PaymentOptions;
