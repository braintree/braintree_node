"use strict";

const { PhoneInput } = require("../../../../lib/braintree/graphql");

describe("PhoneInput", () => {
  it("should correctly generate map for GraphQL variables", () => {
    const phoneInput = PhoneInput.builder()
      .countryPhoneCode("1")
      .phoneNumber("5555555555")
      .extensionNumber("5555")
      .build();

    const graphQLVariables = phoneInput.toGraphQLVariables();

    assert.equal(graphQLVariables.countryPhoneCode, "1");
    assert.equal(graphQLVariables.phoneNumber, "5555555555");
    assert.equal(graphQLVariables.extensionNumber, "5555");
  });
});
