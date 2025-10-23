"use strict";
/* eslint-disable camelcase */

let ApplePayCard =
  require("../../../lib/braintree/apple_pay_card").ApplePayCard;

describe("ApplePayCard", () => {
  describe("constructor", () =>
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
    }));

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
