"use strict";

let Transaction = require("../../../lib/braintree/transaction").Transaction;

describe("Transaction", () => {
  describe("constructor", () => {
    it("allows attributes", () => {
      let transaction = new Transaction({
        id: "abcdef",
        status: "settled",
        amount: "1.00",
        merchantAccountId: "test-merchant-account",
        achReturnCode: "RJCT",
        achRejectReason: "reason text",
      });

      assert.equal("abcdef", transaction.id);
      assert.equal("settled", transaction.status);
      assert.equal("1.00", transaction.amount);
      assert.equal("test-merchant-account", transaction.merchantAccountId);
      assert.equal("RJCT", transaction.achReturnCode);
      assert.equal("reason text", transaction.achRejectReason);
    });

    it("sets paymentAccountReference in applePayDetails when present", function () {
      let transaction = new Transaction({
        applePayDetails: {
          paymentAccountReference: "V0010013019339005665779448477",
        },
      });

      assert.equal(
        "V0010013019339005665779448477",
        transaction.applePayDetails.paymentAccountReference
      );
    });

    it("sets paymentAccountReference in androidPayDetails when present", function () {
      let transaction = new Transaction({
        androidPayDetails: {
          paymentAccountReference: "V0010013019339005665779448477",
        },
      });

      assert.equal(
        "V0010013019339005665779448477",
        transaction.androidPayDetails.paymentAccountReference
      );
    });

    it("sets paymentAccountReference in creditCard when present", function () {
      let transaction = new Transaction({
        creditCard: {
          paymentAccountReference: "V0010013019339005665779448477",
        },
      });

      assert.equal(
        "V0010013019339005665779448477",
        transaction.creditCard.paymentAccountReference
      );
    });
  });
});
