"use strict";

const sinon = require("sinon");
let AddressGateway =
  require("../../../lib/braintree/address_gateway").AddressGateway;

describe("AddressGateway", function () {
  let addressGateway, httpStubs;

  beforeEach(() => {
    httpStubs = {
      get: sinon.stub(),
      post: sinon.stub(),
      put: sinon.stub(),
      delete: sinon.stub(),
    };
    addressGateway = new AddressGateway({
      config: { baseMerchantPath: () => "/merchants/m" },
      http: httpStubs,
    });
  });

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

  function assertNotFoundAndNoHttp(promise, stub) {
    return promise.then(assert.fail).catch((e) => {
      assert.equal("notFoundError", e.type);
      assert.isFalse(stub.called);
    });
  }

  describe("find", () => {
    traversalIds.forEach((badId) => {
      it(`rejects id ${JSON.stringify(badId)} without calling http`, () => {
        return assertNotFoundAndNoHttp(
          addressGateway.find("customer_id", badId),
          httpStubs.get
        );
      });

      it(`rejects customerId ${JSON.stringify(
        badId
      )} without calling http`, () => {
        return assertNotFoundAndNoHttp(
          addressGateway.find(badId, "address_id"),
          httpStubs.get
        );
      });
    });

    it("calls http.get with the expected path for legitimate ids", () => {
      httpStubs.get.resolves({ address: {} });

      return addressGateway.find("cust_1", "addr_1").then(() => {
        assert.isTrue(httpStubs.get.calledOnce);
        assert.equal(
          httpStubs.get.firstCall.args[0],
          "/merchants/m/customers/cust_1/addresses/addr_1"
        );
      });
    });
  });

  describe("update", () => {
    traversalIds.forEach((badId) => {
      it(`rejects id ${JSON.stringify(badId)} without calling http`, () => {
        return assertNotFoundAndNoHttp(
          addressGateway.update("customer_id", badId, {}),
          httpStubs.put
        );
      });

      it(`rejects customerId ${JSON.stringify(
        badId
      )} without calling http`, () => {
        return assertNotFoundAndNoHttp(
          addressGateway.update(badId, "address_id", {}),
          httpStubs.put
        );
      });
    });
  });

  describe("delete", () => {
    traversalIds.forEach((badId) => {
      it(`rejects id ${JSON.stringify(badId)} without calling http`, () => {
        return assertNotFoundAndNoHttp(
          addressGateway.delete("customer_id", badId),
          httpStubs.delete
        );
      });

      it(`rejects customerId ${JSON.stringify(
        badId
      )} without calling http`, () => {
        return assertNotFoundAndNoHttp(
          addressGateway.delete(badId, "address_id"),
          httpStubs.delete
        );
      });
    });
  });

  describe("create", () => {
    traversalIds.forEach((badId) => {
      it(`rejects customerId ${JSON.stringify(
        badId
      )} without calling http`, () => {
        return assertNotFoundAndNoHttp(
          addressGateway.create({ customerId: badId, streetAddress: "x" }),
          httpStubs.post
        );
      });
    });
  });
});
