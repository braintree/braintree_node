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

    it("accepts credit card network_tokenization_attributes", function (done) {
      let transactionGateway = new TransactionGateway(fakeGateway);
      let transactionParams = {
        amount: "5.00",
        creditCard: {
          number: "4111111111111111",
          expirationDate: "06/09",
          networkTokenizationAttributes: {
            cryptogram: "8F34DFB312DC79C24FD5320622F3E11682D79E6B0C0FD881",
            ecommerceIndicator: "05",
            tokenRequestorId: "123456",
          },
        },
      };

      transactionGateway.sale(transactionParams, (err, params) => {
        assert.notExists(err);
        assert.equal(
          "8F34DFB312DC79C24FD5320622F3E11682D79E6B0C0FD881",
          params.transaction.creditCard.networkTokenizationAttributes.cryptogram
        );
        assert.equal(
          "05",
          params.transaction.creditCard.networkTokenizationAttributes
            .ecommerceIndicator
        );
        assert.equal(
          "123456",
          params.transaction.creditCard.networkTokenizationAttributes
            .tokenRequestorId
        );
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

    it("accepts processingMerchantCategoryCode", function (done) {
      let transactionGateway = new TransactionGateway(fakeGateway);
      let transactionParams = {
        amount: "5.00",
        creditCard: {
          number: "4111111111111111",
          expirationDate: "05/28",
        },
        processingMerchantCategoryCode: "5411",
      };

      transactionGateway.sale(transactionParams, (err, params) => {
        assert.notExists(err);
        assert.equal("5411", params.transaction.processingMerchantCategoryCode);
        done();
      });
    });

    it("accepts us_bank_account ach_type option", function (done) {
      let transactionGateway = new TransactionGateway(fakeGateway);
      let transactionParams = {
        amount: "5.00",
        paymentMethodNonce: "fake-us-bank-account-nonce",
        options: {
          usBankAccount: {
            achType: "standard",
          },
        },
      };

      transactionGateway.sale(transactionParams, (err, params) => {
        assert.notExists(err);
        assert.equal(
          "standard",
          params.transaction.options.usBankAccount.achType
        );
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
