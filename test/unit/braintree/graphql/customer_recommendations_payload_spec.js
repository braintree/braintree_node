"use strict";

const {
  CustomerRecommendations,
  CustomerRecommendationsPayload,
  RecommendedPaymentOption,
  PaymentRecommendation,
} = require("../../../../lib/braintree/graphql");

describe("CustomerRecommendationsPayload", () => {
  it("should correctly return sessionId, isInPayPalNetwork and recommendations", () => {
    const paymentRecommendations = new PaymentRecommendation(
      RecommendedPaymentOption.PAYPAL,
      1
    );
    const customerRecommendations = new CustomerRecommendations([
      paymentRecommendations,
    ]);
    const payload = new CustomerRecommendationsPayload(
      "session-id",
      true,
      customerRecommendations
    );

    assert.equal(payload.sessionId, "session-id");
    assert.equal(payload.isInPayPalNetwork, true);
    assert.deepStrictEqual(payload.recommendations, customerRecommendations);
  });
});
