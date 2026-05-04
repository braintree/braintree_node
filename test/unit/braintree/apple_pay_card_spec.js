"use strict";
/* eslint-disable camelcase */

let ApplePayCard =
  require("../../../lib/braintree/apple_pay_card").ApplePayCard;

describe("ApplePayCard", () => {
  describe("constructor", () => {
    it("sets the correct mpan parameters", function () {
      let apple_pay_card = new ApplePayCard({
        isDeviceToken: false,
        merchantTokenIdentifier: "a-merchant-token-identifier",
      });

      assert.equal(false, apple_pay_card.isDeviceToken);
      assert.equal(
        "a-merchant-token-identifier",
        apple_pay_card.merchantTokenIdentifier
      );
    });

    it("initializes verification with the newest verification", function () {
      let verification1 = { id: "123", created_at: 123 };
      let verification2 = { id: "987", created_at: 987 };
      let verification3 = { id: "456", created_at: 456 };
      let apple_pay_card = new ApplePayCard({
        verifications: [verification1, verification2, verification3],
      });

      assert.equal(verification2.id, apple_pay_card.verification.id);
    });

    it("handles empty verifications array", function () {
      let apple_pay_card = new ApplePayCard({
        verifications: [],
      });

      assert.isUndefined(apple_pay_card.verification);
    });

    it("handles missing verifications", function () {
      let apple_pay_card = new ApplePayCard({
        isDeviceToken: true,
      });

      assert.isUndefined(apple_pay_card.verification);
    });
  });

  describe("paymentAccountReference", () => {
    it("sets paymentAccountReference when present", function () {
      let apple_pay_card = new ApplePayCard({
        paymentAccountReference: "V0010013019339005665779448477",
      });

      assert.equal(
        "V0010013019339005665779448477",
        apple_pay_card.paymentAccountReference
      );
    });
  });
});
