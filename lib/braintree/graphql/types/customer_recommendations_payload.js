"use strict";

/**
 * @experimental
 * Represents the customer recommendations information associated with a PayPal customer session.
 */
class CustomerRecommendationsPayload {
  constructor(isInPayPalNetwork, recommendations) {
    this.isInPayPalNetwork = isInPayPalNetwork;
    this.recommendations = recommendations;
  }
}

module.exports = CustomerRecommendationsPayload;
