"use strict";

let sinon = require("sinon");
let TestingGateway =
  require("../../../lib/braintree/testing_gateway").TestingGateway;
let Environment = require("../../../lib/braintree/environment").Environment;

describe("TestingGateway", () => {
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
      gateway = new TestingGateway({
        config: {
          baseMerchantPath: () => "/merchants/m",
          environment: Environment.Sandbox,
        },
        http: httpStubs,
      });
    });

    function assertNotFoundAndNoHttp(promise, stub) {
      return promise.then(assert.fail).catch((e) => {
        assert.equal("notFoundError", e.type);
        assert.isFalse(stub.called);
      });
    }

    const methods = [
      "settle",
      "settlementPending",
      "settlementConfirm",
      "settlementDecline",
    ];

    methods.forEach((method) => {
      describe(method, () => {
        traversalIds.forEach((badId) => {
          it(`rejects transactionId ${JSON.stringify(
            badId
          )} without calling http`, () => {
            return assertNotFoundAndNoHttp(
              gateway[method](badId),
              httpStubs.put
            );
          });
        });
      });
    });
  });
});
