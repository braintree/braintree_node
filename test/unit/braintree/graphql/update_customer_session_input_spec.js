"use strict";

const {
  UpdateCustomerSessionInput,
  CustomerSessionInput,
} = require("../../../../lib/braintree/graphql");

describe("UpdateCustomerSessionInput", () => {
  it("should correctly generate map for GraphQL variables", () => {
    const customerSessionInput = CustomerSessionInput.builder().build();
    const input = UpdateCustomerSessionInput.builder("session-id")
      .merchantAccountId("merchant-account-id")
      .customer(customerSessionInput)
      .build();

    const map = input.toGraphQLVariables();

    assert.equal(map.merchantAccountId, "merchant-account-id");
    assert.equal(map.sessionId, "session-id");
    assert.deepStrictEqual(
      map.customer,
      customerSessionInput.toGraphQLVariables()
    );
  });
});
