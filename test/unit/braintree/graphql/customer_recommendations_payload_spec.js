"use strict";

const {
  CustomerRecommendations,
  CustomerRecommendationsPayload,
  RecommendedPaymentOption,
  PaymentOptions,
} = require("../../../../lib/braintree/graphql");

describe("CustomerRecommendationsPayload", () => {
  it("should correctly return isInPayPalNetwork and recommendations", () => {
    const paymentOptions = new PaymentOptions(
      RecommendedPaymentOption.PAYPAL,
      1
    );
    const customerRecommendations = new CustomerRecommendations([
      paymentOptions,
    ]);
    const payload = new CustomerRecommendationsPayload(
      true,
      customerRecommendations
    );

    assert.equal(payload.isInPayPalNetwork, true);
    assert.deepStrictEqual(payload.recommendations, customerRecommendations);
  });
});
