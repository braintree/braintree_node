"use strict";
const {
  CreateCustomerSessionInput,
  CustomerSessionInput,
  MonetaryAmountInput,
  PayPalPurchaseUnitInput,
} = require("../../../../lib/braintree/graphql");

describe("CreateCustomerSessionInput", () => {
  it("should correctly generate map for GraphQL variables", () => {
    const customerSessionInput = CustomerSessionInput.builder().build();
    const purchaseUnitInput = PayPalPurchaseUnitInput.builder(
      new MonetaryAmountInput("10.00", "USD")
    ).build();
    const input = CreateCustomerSessionInput.builder()
      .merchantAccountId("merchant-account-id")
      .sessionId("session-id")
      .customer(customerSessionInput)
      .purchaseUnits([purchaseUnitInput])
      .domain("a-domain")
      .build();
    const map = input.toGraphQLVariables();

    assert.equal(map.merchantAccountId, "merchant-account-id");
    assert.equal(map.sessionId, "session-id");
    assert.deepStrictEqual(
      map.customer,
      customerSessionInput.toGraphQLVariables()
    );
    assert.deepStrictEqual(
      map.purchaseUnits[0],
      purchaseUnitInput.toGraphQLVariables()
    );
    assert.equal(map.domain, "a-domain");
  });
});
