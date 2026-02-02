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

    it("sets achType and requestedAchType when present", () => {
      let transaction = new Transaction({
        id: "abcdef",
        achType: "standard",
        requestedAchType: "standard",
      });

      assert.equal("standard", transaction.achType);
      assert.equal("standard", transaction.requestedAchType);
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

    it("sets partiallyAuthorized to true when processorResponseCode is 1004", function () {
      let transaction = new Transaction({
        acceptPartialAuthorization: true,
        processorResponseCode: "1004",
      });

      assert.equal(true, transaction.acceptPartialAuthorization);
      assert.equal(1004, transaction.processorResponseCode);
      assert.equal(true, transaction.partiallyAuthorized);
    });
  });
});
