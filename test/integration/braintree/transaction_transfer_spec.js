"use strict";

const { assert } = require("chai");

describe("TransactionGateway", function () {
  describe("should create a transaction with AFT merchant and valid transfer type", function () {
    let transactionParams = {
      type: "sale",
      amount: "100.00",
      merchantAccountId: "aft_first_data_wallet_transfer",
      creditCard: {
        number: "4111111111111111",
        expirationDate: "06/2026",
        cvv: "123",
      },
      transfer: {
        type: "wallet_transfer",
      },
    };

    it("should create a transaction with wallet transfer", function (done) {
      specHelper.defaultGateway.transaction.sale(
        transactionParams,
        function (err, response) {
          assert.isTrue(response.success);
          assert.isTrue(response.transaction.accountFundingTransaction);
          assert.equal(response.transaction.status, "authorized");
          done();
        }
      );
    });
  });

  describe("should not create a transaction for invalid transfer type", function () {
    let transactionParams = {
      type: "sale",
      amount: "100.00",
      merchantAccountId: "aft_first_data_wallet_transfer",
      creditCard: {
        number: "4111111111111111",
        expirationDate: "06/2026",
        cvv: "123",
      },
      transfer: {
        type: "invalid_transfer",
      },
    };

    it("should not create a transaction with invalid transfer type", function (done) {
      specHelper.defaultGateway.transaction.sale(
        transactionParams,
        function (err, response) {
          assert.isNull(err);
          assert.isFalse(response.success);
          done();
        }
      );
    });
  });
});
