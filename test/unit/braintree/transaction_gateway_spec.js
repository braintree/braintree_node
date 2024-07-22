"use strict";

let TransactionGateway =
  require("../../../lib/braintree/transaction_gateway").TransactionGateway;

describe("TransactionGateway", () =>
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

    it("accepts skip_advanced_fraud_checking options", function (done) {
      let transactionGateway = new TransactionGateway(fakeGateway);
      let transactionParams = {
        amount: "5.00",
        creditCard: {
          number: "5105105105105100",
          expirationDate: "05/12",
        },
        options: {
          skipAdvancedFraudChecking: true,
        },
      };

      transactionGateway.sale(transactionParams, (err, params) => {
        assert.notExists(err);
        assert.isTrue(params.transaction.options.skipAdvancedFraudChecking);
        done();
      });
    });

    it("does not include skip_advanced_fraud_checking in params if its not specified", function (done) {
      let transactionGateway = new TransactionGateway(fakeGateway);
      let transactionParams = {
        amount: "5.00",
        creditCard: {
          number: "5105105105105100",
          expirationDate: "05/12",
        },
        options: {
          submitForSettlement: true,
        },
      };

      transactionGateway.sale(transactionParams, (err, params) => {
        assert.notExists(err);
        assert.notExists(params.transaction.options.skipAdvancedFraudChecking);
        done();
      });
    });
  }));

describe("TransactionGateway", () =>
  describe("submitForPartialSettlement", function () {
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

    it("submitForPartialSettlement with finalCapture flag", function (done) {
      let transactionGateway = new TransactionGateway(fakeGateway);
      let options = {
        finalCapture: true,
      };

      transactionGateway.submitForPartialSettlement(
        "test",
        "5.00",
        options,
        (err, params) => {
          assert.notExists(err);
          assert.isTrue(params.transaction.finalCapture);
          done();
        }
      );
    });
  }));
