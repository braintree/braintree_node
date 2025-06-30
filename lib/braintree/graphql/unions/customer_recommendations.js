"use strict";

const { PaymentOptions } = require("../types");

/**
 * @experimental
 * A union of all possible customer recommendations associated with a PayPal customer session.
 */
class CustomerRecommendations {
  constructor(paymentRecommendations) {
    this.paymentRecommendations = paymentRecommendations;
    this.paymentOptions = paymentRecommendations.map((recommendation) => {
      return new PaymentOptions(
        recommendation.paymentOption,
        recommendation.recommendedPriority
      );
    });
  }
}

module.exports = CustomerRecommendations;
