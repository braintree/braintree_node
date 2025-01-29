"use strict";

/**
 * A union of all possible customer recommendations associated with a PayPal customer session.
 */
class CustomerRecommendations {
  constructor(paymentOptions) {
    this.paymentOptions = paymentOptions;
  }
}

module.exports = CustomerRecommendations;
