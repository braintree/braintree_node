"use strict";

const { MonetaryAmountInput } = require("../../../../lib/braintree/graphql");

describe("MonetaryAmountInput", () => {
  it("should correctly generate map for GraphQL variables", () => {
    const amount = new MonetaryAmountInput("10.00", "USD");
    const graphQLVariables = amount.toGraphQLVariables();

    assert.equal(graphQLVariables.value, "10.00");
    assert.equal(graphQLVariables.currencyCode, "USD");
  });
});
