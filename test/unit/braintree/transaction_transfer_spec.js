"use strict";

const { assert } = require("chai");
let TransactionGateway =
  require("../../../lib/braintree/transaction_gateway").TransactionGateway;

describe("TransactionGateway - Transfer Block", () => {
  describe("sale", function () {
    let fakeGateway = {
      config: {
        baseMerchantPath() {
          return "";
        },
      },
      http: {
        post(url, params) {
          return Promise.resolve(params);
        },
      },
    };

    let transactionGateway = new TransactionGateway(fakeGateway);

    let transactionParams = {
      type: "sale",
      amount: "100.00",
      transfer: {
        type: "wallet_transfer",
      },
    };

    it("params should contain wallet transfer type in transaction", function (done) {
      transactionGateway.sale(transactionParams, (err, params) => {
        assert.notExists(err);
        assert.deepEqual(params.transaction.transfer, {
          type: "wallet_transfer",
        });
        done();
      });
    });
  });
});
