"use strict";
const {
  CreateCustomerSessionInput,
  CustomerSessionInput,
} = require("../../../../lib/braintree/graphql");

describe("CreateCustomerSessionInput", () => {
  it("should correctly generate map for GraphQL variables", () => {
    const customerSessionInput = CustomerSessionInput.builder().build();
    const input = CreateCustomerSessionInput.builder()
      .merchantAccountId("merchant-account-id")
      .sessionId("session-id")
      .customer(customerSessionInput)
      .domain("a-domain")
      .build();

    const map = input.toGraphQLVariables();

    assert.equal(map.merchantAccountId, "merchant-account-id");
    assert.equal(map.sessionId, "session-id");

    assert.deepStrictEqual(
      map.customer,
      customerSessionInput.toGraphQLVariables()
    );

    assert.equal(map.domain, "a-domain");
  });
});
