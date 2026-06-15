"use strict";
/* eslint-disable camelcase */

let CreditCardVerification =
  require("../../../lib/braintree/credit_card_verification").CreditCardVerification;

describe("CreditCardVerification", () =>
  describe("constructor", () => {
    it("sets paymentAccountReference in creditCard when present", function () {
      let verification = new CreditCardVerification({
        creditCard: {
          paymentAccountReference: "V0010013019339005665779448477",
        },
      });

      assert.equal(
        "V0010013019339005665779448477",
        verification.creditCard.paymentAccountReference
      );
    });

    it("sets mastercardTransactionLinkId when present", function () {
      let verification = new CreditCardVerification({
        mastercardTransactionLinkId: "ZairABg6CIFekPMsnK0cJ2",
      });

      assert.equal(
        "ZairABg6CIFekPMsnK0cJ2",
        verification.mastercardTransactionLinkId
      );
    });
  }));
