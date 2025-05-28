"use strict";

const {
  MonetaryAmountInput,
  PayPalPayeeInput,
  PayPalPurchaseUnitInput,
} = require("../../../../lib/braintree/graphql");

describe("PayPalPurchaseUnitInput", () => {
  it("should correctly generate map for GraphQL variables", () => {
    const amount = new MonetaryAmountInput("10.00", "USD");
    const payee = PayPalPayeeInput.builder()
      .emailAddress("test@example.com")
      .clientId("merchant-public-id")
      .build();
    const purchaseUnit = PayPalPurchaseUnitInput.builder(amount)
      .payee(payee)
      .build();
    const graphQLVariables = purchaseUnit.toGraphQLVariables();

    assert.equal(graphQLVariables.amount.value, "10.00");
    assert.equal(graphQLVariables.amount.currencyCode, "USD");
    assert.equal(graphQLVariables.payee.emailAddress, "test@example.com");
    assert.equal(graphQLVariables.payee.clientId, "merchant-public-id");
  });
});
