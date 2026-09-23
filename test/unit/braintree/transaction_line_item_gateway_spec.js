"use strict";

let sinon = require("sinon");
let TransactionLineItemGateway =
  require("../../../lib/braintree/transaction_line_item_gateway").TransactionLineItemGateway;

describe("TransactionLineItemGateway", () => {
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
      gateway = new TransactionLineItemGateway({
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

    describe("findAll", () => {
      traversalIds.forEach((badId) => {
        it(`rejects transactionId ${JSON.stringify(
          badId
        )} without calling http`, () => {
          return assertNotFoundAndNoHttp(gateway.findAll(badId), httpStubs.get);
        });
      });
    });
  });
});
