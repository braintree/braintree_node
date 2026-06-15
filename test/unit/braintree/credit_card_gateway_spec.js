"use strict";

let CreditCardGateway =
  require("../../../lib/braintree/credit_card_gateway").CreditCardGateway;

describe(
  "CreditCardGateway",
  () =>
    describe("dateFormat", () =>
      it("works with a month boundary", function () {
        let gateway = new CreditCardGateway(specHelper.defaultGateway);
        let date = new Date("2016-10-1");

        assert.equal(gateway.dateFormat(date), "102016");
      })),

  describe("accountInformation", () =>
    it("processes accountInformationInquiry in creditCard options", function (done) {
      let gateway = new CreditCardGateway(specHelper.defaultGateway);
      let creditCardParams = {
        options: {
          accountInformationInquiry: "send_data",
        },
      };

      gateway.create = (params, callback) => {
        callback(null, {
          creditCard: {
            options: {
              accountInformationInquiry:
                params.options.accountInformationInquiry,
            },
          },
        });
      };

      gateway.create(creditCardParams, (err, result) => {
        assert.isNull(err);
        assert.exists(result);
        assert.deepEqual(
          result.creditCard.options.accountInformationInquiry,
          "send_data"
        );
        done();
      });
    }))
);

let sinon = require("sinon");
let { CreditCard } = require("../../../lib/braintree/credit_card");
let { errorTypes } = require("../../../lib/braintree/error_types");

describe("CreditCardGateway - Additional Coverage", () => {
  let creditCardGateway, fakeGateway;

  beforeEach(() => {
    fakeGateway = {
      config: {
        baseMerchantPath: () => "/merchants/test_merchant",
      },
      http: {
        post: sinon.stub().resolves({
          creditCard: { token: "test_token" },
        }),
        delete: sinon.stub().resolves({}),
        get: sinon.stub().resolves({
          creditCard: { token: "test_token" },
        }),
        put: sinon.stub().resolves({
          creditCard: { token: "test_token" },
        }),
      },
    };

    creditCardGateway = new CreditCardGateway(fakeGateway);
  });

  describe("create", () => {
    it("posts to payment_methods endpoint", function () {
      let attributes = { number: "4111111111111111" };

      creditCardGateway.create(attributes);

      assert.isTrue(fakeGateway.http.post.called);
      assert.include(
        fakeGateway.http.post.firstCall.args[0],
        "payment_methods"
      );
    });

    it("wraps attributes in creditCard key", function () {
      let attributes = { number: "4111111111111111" };

      creditCardGateway.create(attributes);

      let requestBody = fakeGateway.http.post.firstCall.args[1];

      assert.deepEqual(requestBody, { creditCard: attributes });
    });

    it("checks for deprecated attributes", function () {
      let consoleWarnSpy = sinon.spy(console, "warn");
      let attributes = { deviceSessionId: "test_session_id" };

      creditCardGateway.create(attributes);

      assert.isTrue(consoleWarnSpy.called);
      assert.include(consoleWarnSpy.firstCall.args[0], "[DEPRECATED]");

      consoleWarnSpy.restore();
    });
  });

  describe("delete", () => {
    it("calls delete on correct path", function () {
      creditCardGateway.delete("test_token");

      assert.isTrue(fakeGateway.http.delete.called);
      assert.include(
        fakeGateway.http.delete.firstCall.args[0],
        "payment_methods/credit_card/test_token"
      );
    });
  });

  describe("find", () => {
    it("calls get on correct path", function () {
      creditCardGateway.find("test_token");

      assert.isTrue(fakeGateway.http.get.called);
      assert.include(
        fakeGateway.http.get.firstCall.args[0],
        "payment_methods/credit_card/test_token"
      );
    });

    it("returns CreditCard object", function () {
      fakeGateway.http.get.resolves({
        creditCard: { token: "test_token", cardType: "Visa" },
      });

      return creditCardGateway.find("test_token").then((creditCard) => {
        assert.instanceOf(creditCard, CreditCard);
      });
    });

    it("rejects with NotFoundError for empty token", function () {
      return creditCardGateway.find("").catch((err) => {
        assert.equal(err.type, errorTypes.notFoundError);
      });
    });

    it("rejects with NotFoundError for whitespace token", function () {
      return creditCardGateway.find("   ").catch((err) => {
        assert.equal(err.type, errorTypes.notFoundError);
      });
    });
  });

  describe("fromNonce", () => {
    it("calls get on correct path", function () {
      creditCardGateway.fromNonce("test_nonce");

      assert.isTrue(fakeGateway.http.get.called);
      assert.include(
        fakeGateway.http.get.firstCall.args[0],
        "payment_methods/from_nonce/test_nonce"
      );
    });

    it("returns CreditCard object", function () {
      fakeGateway.http.get.resolves({
        creditCard: { token: "test_token" },
      });

      return creditCardGateway.fromNonce("test_nonce").then((creditCard) => {
        assert.instanceOf(creditCard, CreditCard);
      });
    });

    it("rejects with NotFoundError for empty nonce", function () {
      return creditCardGateway.fromNonce("").catch((err) => {
        assert.equal(err.type, errorTypes.notFoundError);
      });
    });

    it("customizes error message on nonce lookup failure", function () {
      let error = new Error("Original error");

      fakeGateway.http.get.rejects(error);

      return creditCardGateway.fromNonce("test_nonce").catch((err) => {
        assert.include(err.message, "locked, consumed or not found");
        assert.include(err.message, "test_nonce");
      });
    });
  });

  describe("update", () => {
    it("puts to correct path", function () {
      let attributes = { expirationDate: "10/25" };

      creditCardGateway.update("test_token", attributes);

      assert.isTrue(fakeGateway.http.put.called);
      assert.include(
        fakeGateway.http.put.firstCall.args[0],
        "payment_methods/credit_card/test_token"
      );
    });

    it("wraps attributes in creditCard key", function () {
      let attributes = { expirationDate: "10/25" };

      creditCardGateway.update("test_token", attributes);

      let requestBody = fakeGateway.http.put.firstCall.args[1];

      assert.deepEqual(requestBody, { creditCard: attributes });
    });

    it("checks for deprecated attributes", function () {
      let consoleWarnSpy = sinon.spy(console, "warn");
      let attributes = { fraudMerchantId: "test_merchant_id" };

      creditCardGateway.update("test_token", attributes);

      assert.isTrue(consoleWarnSpy.called);

      consoleWarnSpy.restore();
    });
  });

  describe("_checkForDeprecatedAttributes", () => {
    it("warns for deviceSessionId", function () {
      let consoleWarnSpy = sinon.spy(console, "warn");

      creditCardGateway._checkForDeprecatedAttributes({
        deviceSessionId: "session_id",
      });

      assert.isTrue(consoleWarnSpy.called);
      assert.include(consoleWarnSpy.firstCall.args[0], "deviceSessionId");

      consoleWarnSpy.restore();
    });

    it("warns for fraudMerchantId", function () {
      let consoleWarnSpy = sinon.spy(console, "warn");

      creditCardGateway._checkForDeprecatedAttributes({
        fraudMerchantId: "merchant_id",
      });

      assert.isTrue(consoleWarnSpy.called);
      assert.include(consoleWarnSpy.firstCall.args[0], "fraudMerchantId");

      consoleWarnSpy.restore();
    });

    it("warns for venmoSdkPaymentMethodCode", function () {
      let consoleWarnSpy = sinon.spy(console, "warn");

      creditCardGateway._checkForDeprecatedAttributes({
        venmoSdkPaymentMethodCode: "code",
      });

      assert.isTrue(consoleWarnSpy.called);
      assert.include(consoleWarnSpy.firstCall.args[0], "Venmo SDK");

      consoleWarnSpy.restore();
    });

    it("warns for venmoSdkSession in options", function () {
      let consoleWarnSpy = sinon.spy(console, "warn");

      creditCardGateway._checkForDeprecatedAttributes({
        options: {
          venmoSdkSession: "session",
        },
      });

      assert.isTrue(consoleWarnSpy.called);
      assert.include(consoleWarnSpy.firstCall.args[0], "Venmo SDK");

      consoleWarnSpy.restore();
    });

    it("does not warn for valid attributes", function () {
      let consoleWarnSpy = sinon.spy(console, "warn");

      creditCardGateway._checkForDeprecatedAttributes({
        number: "4111111111111111",
      });

      assert.isFalse(consoleWarnSpy.called);

      consoleWarnSpy.restore();
    });
  });

  describe("dateFormat", () => {
    it("pads month with leading zero", function () {
      let date = new Date("2016-01-15");

      assert.equal(creditCardGateway.dateFormat(date), "012016");
    });

    it("does not pad months 10 and above", function () {
      let date = new Date("2016-10-15");

      assert.equal(creditCardGateway.dateFormat(date), "102016");
    });

    it("handles December", function () {
      let date = new Date("2016-12-15");

      assert.equal(creditCardGateway.dateFormat(date), "122016");
    });
  });

  describe("responseHandler", () => {
    it("returns a response handler function", function () {
      let handler = creditCardGateway.responseHandler();

      assert.isFunction(handler);
    });
  });
});
