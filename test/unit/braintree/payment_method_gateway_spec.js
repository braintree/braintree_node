"use strict";

let sinon = require("sinon");
let PaymentMethodGateway =
  require("../../../lib/braintree/payment_method_gateway").PaymentMethodGateway;
let PaymentMethodParser =
  require("../../../lib/braintree/payment_method_parser").PaymentMethodParser;
let errorTypes = require("../../../lib/braintree/error_types").errorTypes;

describe("PaymentMethodGateway", function () {
  describe("find", () =>
    it("handles unknown payment methods", function (done) {
      let response = {
        unknownPaymentMethod: {
          token: 1234,
          default: true,
          key: "value",
        },
      };

      let paymentMethod = PaymentMethodParser.parsePaymentMethod(response);

      assert.equal(paymentMethod.token, 1234);
      assert.isTrue(paymentMethod.default);

      done();
    }));

  describe("delete", function () {
    let fakeGateway = {
      config: {
        baseMerchantPath() {
          return "";
        },
      },
      http: {
        delete(url) {
          return Promise.reject(url);
        },
      },
    };

    it("accepts revokeAllGrants option with value true", function (done) {
      let paymentMethodGateway = new PaymentMethodGateway(fakeGateway);
      let expectedURL =
        "/payment_methods/any/some_token?revoke_all_grants=true";
      let deleteOptions = { revokeAllGrants: "true" };
      let assertRequestUrl = (url) => assert.equal(expectedURL, url); // eslint-disable-line func-style

      paymentMethodGateway.delete(
        "some_token",
        deleteOptions,
        assertRequestUrl
      );
      done();
    });

    it("accepts revokeAllGrants option with value false", function (done) {
      let paymentMethodGateway = new PaymentMethodGateway(fakeGateway);
      let expectedURL =
        "/payment_methods/any/some_token?revoke_all_grants=false";
      let deleteOptions = { revokeAllGrants: "false" };
      let assertRequestUrl = (url) => assert.equal(expectedURL, url); // eslint-disable-line func-style

      paymentMethodGateway.delete(
        "some_token",
        deleteOptions,
        assertRequestUrl
      );
      done();
    });

    it("accepts just the token, revokeAllGrants is optional", function (done) {
      let paymentMethodGateway = new PaymentMethodGateway(fakeGateway);
      let expectedURL = "/payment_methods/any/some_token";
      let assertRequestUrl = (url) => assert.equal(expectedURL, url); // eslint-disable-line func-style

      paymentMethodGateway.delete("some_token", assertRequestUrl);
      done();
    });

    it("calls callback with error if keys are invalid", function (done) {
      let paymentMethodGateway = new PaymentMethodGateway(fakeGateway);
      let deleteOptions = { invalid_key: "true" }; // eslint-disable-line camelcase

      return paymentMethodGateway.delete(
        "some_token",
        deleteOptions,
        function (err) {
          assert.instanceOf(err, Error);
          assert.equal(err.type, errorTypes.invalidKeysError);
          assert.equal(err.message, "These keys are invalid: invalid_key");
          done();
        }
      );
    });
  });

  describe("accountInformationInquiry", function () {
    let fakeGateway = {
      config: {
        baseMerchantPath() {
          return "";
        },
      },
      http: {
        post(url, params) {
          return Promise.resolve({
            paymentMethod: {
              options: {
                accountInformationInquiry:
                  params.paymentMethod.options.accountInformationInquiry,
              },
            },
          });
        },
      },
    };

    it("handles accountInformationInquiry in payment method options", function (done) {
      let paymentGateway = new PaymentMethodGateway(fakeGateway);
      let paymentParams = {
        options: {
          accountInformationInquiry: "send_data",
        },
      };

      paymentGateway.create(paymentParams, (err, params) => {
        assert.isNull(err);
        assert.exists(params);
        assert.deepEqual(
          params.paymentMethod.options.accountInformationInquiry,
          "send_data"
        );
        done();
      });
    });
  });

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

    let httpStubs, gateway;

    beforeEach(() => {
      httpStubs = {
        get: sinon.stub(),
        post: sinon.stub(),
        put: sinon.stub(),
        delete: sinon.stub(),
      };
      gateway = new PaymentMethodGateway({
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

    describe("find", () => {
      traversalIds.forEach((badId) => {
        it(`rejects token ${JSON.stringify(
          badId
        )} without calling http`, () => {
          return assertNotFoundAndNoHttp(gateway.find(badId), httpStubs.get);
        });
      });
    });

    describe("update", () => {
      traversalIds.forEach((badId) => {
        it(`rejects token ${JSON.stringify(
          badId
        )} without calling http`, () => {
          return assertNotFoundAndNoHttp(
            gateway.update(badId, {}),
            httpStubs.put
          );
        });
      });
    });

    describe("delete", () => {
      traversalIds.forEach((badId) => {
        it(`rejects token ${JSON.stringify(
          badId
        )} without calling http`, () => {
          return assertNotFoundAndNoHttp(
            gateway.delete(badId),
            httpStubs.delete
          );
        });
      });
    });
  });
});
