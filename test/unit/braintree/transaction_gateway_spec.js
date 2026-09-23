"use strict";

let sinon = require("sinon");
let TransactionGateway =
  require("../../../lib/braintree/transaction_gateway").TransactionGateway;
let ThreeDSecurePassThruNetwork =
  require("../../../lib/braintree/three_d_secure_pass_thru_network").ThreeDSecurePassThruNetwork;

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

    it("accepts surchargeAmount", function (done) {
      let transactionGateway = new TransactionGateway(fakeGateway);
      let transactionParams = {
        amount: "5.00",
        creditCard: {
          number: "4111111111111111",
          expirationDate: "05/28",
        },
        surchargeAmount: "1.00",
      };

      transactionGateway.sale(transactionParams, (err, params) => {
        assert.equal("1.00", params.transaction.surchargeAmount);
        done();
      });
    });

    it("accepts threeDSecurePassThru network", function (done) {
      let transactionGateway = new TransactionGateway(fakeGateway);
      let transactionParams = {
        amount: "5.00",
        creditCard: {
          number: "4111111111111111",
          expirationDate: "05/28",
        },
        threeDSecurePassThru: {
          eciFlag: "05",
          cavv: "some_cavv",
          xid: "some_xid",
          threeDSecureVersion: "2.2.0",
          authenticationResponse: "Y",
          directoryResponse: "Y",
          cavvAlgorithm: "2",
          dsTransactionId: "some_ds_transaction_id",
          network: ThreeDSecurePassThruNetwork.Visa,
        },
      };

      transactionGateway.sale(transactionParams, (err, params) => {
        assert.notExists(err);
        assert.equal("Visa", params.transaction.threeDSecurePassThru.network);
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

describe("TransactionGateway", () =>
  describe("refund", function () {
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

    it("accepts surchargeAmount in refunds", function (done) {
      let transactionGateway = new TransactionGateway(fakeGateway);
      let refundOptions = {
        surchargeAmount: "1.00",
      };

      transactionGateway.refund("fake_txn_id", refundOptions, (err, params) => {
        assert.notExists(err);
        assert.equal("1.00", params.transaction.surchargeAmount);
        done();
      });
    });
  }));

describe("TransactionGateway", () => {
  describe("path traversal", () => {
    const traversalIds = [
      "../../victim_customer/addresses/victim_address",
      "foo/bar",
      "foo\\bar",
      "..%2f..%2fvictim",
      "..",
      ".",
      "%2e%2e",
      "",
      "   ",
      null,
      123,
      {},
    ];

    let httpStubs, transactionGateway;

    beforeEach(() => {
      httpStubs = {
        get: sinon.stub(),
        post: sinon.stub(),
        put: sinon.stub(),
        delete: sinon.stub(),
      };
      transactionGateway = new TransactionGateway({
        config: { baseMerchantPath: () => "/merchants/m" },
        http: httpStubs,
      });
    });

    function assertNotFoundAndNoHttp(promise, stub) {
      return promise.then(assert.fail).catch((e) => {
        assert.equal("notFoundError", e.type);
        assert.isFalse(stub.called);
      });
    }

    const cases = [
      {
        method: "adjustAuthorization",
        args: ["5.00"],
        stub: () => httpStubs.put,
      },
      { method: "cancelRelease", args: [], stub: () => httpStubs.put },
      { method: "cloneTransaction", args: [{}], stub: () => httpStubs.post },
      { method: "find", args: [], stub: () => httpStubs.get },
      { method: "refund", args: [{}], stub: () => httpStubs.post },
      {
        method: "submitForSettlement",
        args: ["5.00", {}],
        stub: () => httpStubs.put,
      },
      { method: "updateDetails", args: [{}], stub: () => httpStubs.put },
      { method: "packageTracking", args: [{}], stub: () => httpStubs.post },
      {
        method: "submitForPartialSettlement",
        args: ["5.00", {}],
        stub: () => httpStubs.post,
      },
      { method: "void", args: [{}], stub: () => httpStubs.put },
    ];

    cases.forEach(({ method, args, stub }) => {
      describe(method, () => {
        traversalIds.forEach((badId) => {
          it(`rejects transactionId ${JSON.stringify(
            badId
          )} without calling http`, () => {
            return assertNotFoundAndNoHttp(
              transactionGateway[method](badId, ...args),
              stub()
            );
          });
        });
      });
    });
  });
});
