"use strict";

let sinon = require("sinon");
let SepaDirectDebitAccountGateway =
  require("../../../lib/braintree/sepa_direct_debit_account_gateway").SepaDirectDebitAccountGateway;

describe("SepaDirectDebitAccountGateway", () => {
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
      gateway = new SepaDirectDebitAccountGateway({
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
