"use strict";
/* eslint-disable camelcase */

let AndroidPayCard =
  require("../../../lib/braintree/android_pay_card").AndroidPayCard;

describe("AndroidPayCard", () =>
  describe("constructor", () => {
    it("sets paymentAccountReference when present", function () {
      let android_pay_card = new AndroidPayCard({
        paymentAccountReference: "V0010013019339005665779448477",
      });

      assert.equal(
        "V0010013019339005665779448477",
        android_pay_card.paymentAccountReference
      );
    });
  }));
