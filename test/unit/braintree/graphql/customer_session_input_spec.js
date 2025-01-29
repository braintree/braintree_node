"use strict";

const {
  CustomerSessionInput,
  PhoneInput,
} = require("../../../../lib/braintree/graphql");

describe("CustomerSessionInput", () => {
  it("should correctly generate map for GraphQL variables", () => {
    const phoneInput = PhoneInput.builder().build();
    const input = CustomerSessionInput.builder()
      .deviceFingerprintId("device-fingerprint-id")
      .email("nobody@nowehwere.com")
      .phone(phoneInput)
      .paypalAppInstalled(true)
      .venmoAppInstalled(false)
      .userAgent("Mozilla")
      .build();

    const map = input.toGraphQLVariables();

    assert.equal(map.deviceFingerprintId, "device-fingerprint-id");
    assert.equal(map.email, "nobody@nowehwere.com");
    assert.deepStrictEqual(map.phone, phoneInput.toGraphQLVariables());
    assert.equal(map.paypalAppInstalled, true);
    assert.equal(map.venmoAppInstalled, false);
    assert.equal(map.userAgent, "Mozilla");
  });
});
