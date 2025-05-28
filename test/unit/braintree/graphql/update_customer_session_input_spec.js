"use strict";

const {
  UpdateCustomerSessionInput,
  CustomerSessionInput,
  MonetaryAmountInput,
  PayPalPurchaseUnitInput,
} = require("../../../../lib/braintree/graphql");

describe("UpdateCustomerSessionInput", () => {
  it("should correctly generate map for GraphQL variables", () => {
    const customerSessionInput = CustomerSessionInput.builder().build();
    const purchaseUnitInput = PayPalPurchaseUnitInput.builder(
      new MonetaryAmountInput("10.00", "USD")
    ).build();
    const input = UpdateCustomerSessionInput.builder("session-id")
      .merchantAccountId("merchant-account-id")
      .customer(customerSessionInput)
      .purchaseUnits([purchaseUnitInput])
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
  });
});
