"use strict";

const { PayPalPayeeInput } = require("../../../../lib/braintree/graphql");

describe("PayPalPayeeInput", () => {
  it("should correctly generate map for GraphQL variables", () => {
    const payee = PayPalPayeeInput.builder()
      .emailAddress("test@example.com")
      .clientId("merchant-public-id")
      .build();
    const graphQLVariables = payee.toGraphQLVariables();

    assert.equal(graphQLVariables.emailAddress, "test@example.com");
    assert.equal(graphQLVariables.clientId, "merchant-public-id");
  });
});
