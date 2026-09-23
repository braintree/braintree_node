"use strict";

let sinon = require("sinon");
let CreditCardVerificationGateway =
  require("../../../lib/braintree/credit_card_verification_gateway").CreditCardVerificationGateway;
let errorTypes = require("../../../lib/braintree/error_types").errorTypes;
let ThreeDSecurePassThruNetwork =
  require("../../../lib/braintree/three_d_secure_pass_thru_network").ThreeDSecurePassThruNetwork;

describe("CreditCardVerificationGateway", () =>
  describe("create", function () {
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

    it("throws error if not a valid input", function (done) {
      let verificationGateway = new CreditCardVerificationGateway(fakeGateway);
      let verificationParams = {
        invalidParam: "invalidValue",
      };

      verificationGateway.create(verificationParams, (err, params) => {
        assert.notExists(params);
        assert.isNotNull(err);

        assert.equal(err.type, errorTypes.invalidKeysError);
        assert.equal(err.message, "These keys are invalid: invalidParam");
        done();
      });
    });

    it("processes accountInformationInquiry in options", function (done) {
      let gateway = new CreditCardVerificationGateway(
        specHelper.defaultGateway
      );
      let verificationParams = {
        options: {
          accountInformationInquiry: "send_data",
        },
      };

      gateway.create = (params, callback) => {
        if (params.options.accountInformationInquiry === "send_data") {
          callback(null, {
            options: {
              accountInformationInquiry:
                params.options.accountInformationInquiry,
            },
          });
        } else {
          callback(new Error("Server Error"), null);
        }
      };

      gateway.create(verificationParams, (err, result) => {
        assert.isNull(err);
        assert.exists(result);
        assert.deepEqual(result.options.accountInformationInquiry, "send_data");
        done();
      });
    });

    it("accepts threeDSecurePassThru network", function (done) {
      let verificationGateway = new CreditCardVerificationGateway(fakeGateway);
      let verificationParams = {
        creditCard: {
          number: "4111111111111111",
          expirationDate: "05/2029",
        },
        threeDSecurePassThru: {
          eciFlag: "05",
          cavv: "some_cavv",
          xid: "some_xid",
          threeDSecureVersion: "2.2.0",
          authenticationResponse: "Y",
          directoryResponse: "Y",
          cavvAlgorithm: "2",
          dsTransactionId: "some_ds_id",
          network: ThreeDSecurePassThruNetwork.Visa,
        },
      };

      verificationGateway.create(verificationParams, (err, params) => {
        assert.notExists(err);
        assert.exists(params);
        assert.equal(params.verification.threeDSecurePassThru.network, "Visa");
        done();
      });
    });
  }));

describe("CreditCardVerificationGateway - path traversal", () => {
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
    gateway = new CreditCardVerificationGateway({
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
      it(`rejects creditCardVerificationId ${JSON.stringify(
        badId
      )} without calling http`, () => {
        return assertNotFoundAndNoHttp(gateway.find(badId), httpStubs.get);
      });
    });
  });
});
