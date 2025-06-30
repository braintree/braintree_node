"use strict";

/**
 * @experimental
 * Represents the customer recommendations information associated with a PayPal customer session.
 */
class CustomerRecommendationsPayload {
  constructor(sessionId, isInPayPalNetwork, recommendations) {
    this.sessionId = sessionId;
    this.isInPayPalNetwork = isInPayPalNetwork;
    this.recommendations = recommendations;
  }
}

module.exports = CustomerRecommendationsPayload;
