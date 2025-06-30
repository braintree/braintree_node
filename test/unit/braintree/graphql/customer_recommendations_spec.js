"use strict";

const {
  CustomerRecommendations,
  RecommendedPaymentOption,
  PaymentRecommendation,
} = require("../../../../lib/braintree/graphql");

describe("CustomerRecommendations", () => {
  it("should correctly set payment recommendations", () => {
    const paymentRecommendations = new PaymentRecommendation(
      RecommendedPaymentOption.PAYPAL,
      1
    );
    const customerRecommendations = new CustomerRecommendations([
      paymentRecommendations,
    ]);

    assert.equal(
      customerRecommendations.paymentRecommendations[0].paymentOption,
      RecommendedPaymentOption.PAYPAL
    );
    assert.equal(
      customerRecommendations.paymentRecommendations[0].recommendedPriority,
      1
    );
    assert.equal(
      customerRecommendations.paymentOptions[0].paymentOption,
      RecommendedPaymentOption.PAYPAL
    );
    assert.equal(
      customerRecommendations.paymentOptions[0].recommendedPriority,
      1
    );
  });
});
