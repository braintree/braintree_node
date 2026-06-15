"use strict";

let sinon = require("sinon");
let UsBankAccountVerificationGateway =
  require("../../../lib/braintree/us_bank_account_verification_gateway").UsBankAccountVerificationGateway;
let {
  UsBankAccountVerification,
} = require("../../../lib/braintree/us_bank_account_verification");
let { errorTypes } = require("../../../lib/braintree/error_types");

describe("UsBankAccountVerificationGateway", () => {
  let gateway, fakeGateway;

  beforeEach(() => {
    fakeGateway = {
      config: {
        baseMerchantPath: () => "/merchants/test_merchant",
      },
      http: {
        get: sinon.stub().resolves({
          usBankAccountVerification: {
            id: "verification_id",
            status: "verified",
          },
        }),
        put: sinon.stub().resolves({
          usBankAccountVerification: {
            id: "verification_id",
            status: "verified",
          },
        }),
        post: sinon.stub().resolves({
          usBankAccountVerifications: {
            usBankAccountVerification: {
              id: "verification_id",
              status: "verified",
            },
          },
        }),
      },
    };

    gateway = new UsBankAccountVerificationGateway(fakeGateway);
  });

  describe("find", () => {
    it("calls get on correct path", function () {
      gateway.find("test_verification_id");

      assert.isTrue(fakeGateway.http.get.called);
      assert.include(
        fakeGateway.http.get.firstCall.args[0],
        "us_bank_account_verifications/test_verification_id"
      );
    });

    it("returns UsBankAccountVerification object", function () {
      fakeGateway.http.get.resolves({
        usBankAccountVerification: {
          id: "verification_id",
          status: "verified",
        },
      });

      return gateway.find("test_verification_id").then((verification) => {
        assert.instanceOf(verification, UsBankAccountVerification);
        assert.equal(verification.id, "verification_id");
      });
    });

    it("rejects with NotFoundError for empty id", function () {
      return gateway.find("").catch((err) => {
        assert.equal(err.type, errorTypes.notFoundError);
      });
    });

    it("rejects with NotFoundError for whitespace id", function () {
      return gateway.find("   ").catch((err) => {
        assert.equal(err.type, errorTypes.notFoundError);
      });
    });
  });

  describe("confirmMicroTransferAmounts", () => {
    it("puts to correct path", function () {
      let depositAmounts = ["0.01", "0.02"];

      gateway.confirmMicroTransferAmounts(
        "test_verification_id",
        depositAmounts
      );

      assert.isTrue(fakeGateway.http.put.called);
      assert.include(
        fakeGateway.http.put.firstCall.args[0],
        "us_bank_account_verifications/test_verification_id/confirm_micro_transfer_amounts"
      );
    });

    it("sends deposit amounts in request body", function () {
      let depositAmounts = ["0.01", "0.02"];

      gateway.confirmMicroTransferAmounts(
        "test_verification_id",
        depositAmounts
      );

      let requestBody = fakeGateway.http.put.firstCall.args[1];

      assert.deepEqual(requestBody, {
        usBankAccountVerification: {
          depositAmounts: depositAmounts,
        },
      });
    });

    it("returns promise when called without callback", function () {
      let result = gateway.confirmMicroTransferAmounts("test_verification_id", [
        "0.01",
        "0.02",
      ]);

      assert.isFunction(result.then);
    });

    it("accepts callback parameter without error", function () {
      let callback = sinon.spy();

      gateway.confirmMicroTransferAmounts(
        "test_verification_id",
        ["0.01", "0.02"],
        callback
      );

      assert.isTrue(fakeGateway.http.put.called);
    });
  });

  describe("search", () => {
    it("creates UsBankAccountVerificationSearch", function () {
      let searchFn = sinon.spy();

      gateway.search(searchFn);

      assert.isTrue(searchFn.called);
    });

    it("calls createSearchResponse with correct path", function () {
      let createSearchResponseSpy = sinon.spy(gateway, "createSearchResponse");

      function searchFn(search) {
        return search;
      }

      gateway.search(searchFn);

      assert.isTrue(createSearchResponseSpy.called);
      assert.include(
        createSearchResponseSpy.firstCall.args[0],
        "us_bank_account_verifications/advanced_search_ids"
      );

      createSearchResponseSpy.restore();
    });

    it("passes search to createSearchResponse", function () {
      let createSearchResponseSpy = sinon.spy(gateway, "createSearchResponse");

      function searchFn(search) {
        return search;
      }

      gateway.search(searchFn);

      let searchParam = createSearchResponseSpy.firstCall.args[1];

      assert.exists(searchParam);

      createSearchResponseSpy.restore();
    });

    it("passes paging function to createSearchResponse", function () {
      let createSearchResponseSpy = sinon.spy(gateway, "createSearchResponse");

      function searchFn(search) {
        return search;
      }

      gateway.search(searchFn);

      let pagingFn = createSearchResponseSpy.firstCall.args[2];

      assert.isFunction(pagingFn);

      createSearchResponseSpy.restore();
    });

    it("passes callback to createSearchResponse", function () {
      let createSearchResponseSpy = sinon.spy(gateway, "createSearchResponse");

      function searchFn(search) {
        return search;
      }

      let callback = sinon.spy();

      gateway.search(searchFn, callback);

      let callbackParam = createSearchResponseSpy.firstCall.args[3];

      assert.equal(callbackParam, callback);

      createSearchResponseSpy.restore();
    });
  });

  describe("pagingFunctionGenerator", () => {
    it("returns a function", function () {
      let mockSearch = {
        toHash: sinon.stub().returns({}),
      };

      let pagingFn = gateway.pagingFunctionGenerator(mockSearch);

      assert.isFunction(pagingFn);
    });

    it("posts to correct endpoint", function () {
      let mockSearch = {
        toHash: sinon.stub().returns({ status: "verified" }),
      };

      let pagingFn = gateway.pagingFunctionGenerator(mockSearch);
      let callback = sinon.spy();

      pagingFn(["id1", "id2"], callback);

      assert.isTrue(fakeGateway.http.post.called);
      assert.include(
        fakeGateway.http.post.firstCall.args[0],
        "us_bank_account_verifications/advanced_search"
      );
    });

    it("includes ids in search criteria", function () {
      let mockSearch = {
        toHash: sinon.stub().returns({ status: "verified" }),
      };

      let pagingFn = gateway.pagingFunctionGenerator(mockSearch);
      let callback = sinon.spy();

      pagingFn(["id1", "id2"], callback);

      let requestBody = fakeGateway.http.post.firstCall.args[1];

      assert.deepEqual(requestBody.search.ids, ["id1", "id2"]);
    });

    it("includes original search criteria", function () {
      let mockSearch = {
        toHash: sinon.stub().returns({ status: "verified" }),
      };

      let pagingFn = gateway.pagingFunctionGenerator(mockSearch);
      let callback = sinon.spy();

      pagingFn(["id1", "id2"], callback);

      let requestBody = fakeGateway.http.post.firstCall.args[1];

      assert.equal(requestBody.search.status, "verified");
    });

    it("posts to correct endpoint with search criteria", function () {
      let mockSearch = {
        toHash: sinon.stub().returns({ status: "verified" }),
      };

      let pagingFn = gateway.pagingFunctionGenerator(mockSearch);

      let callback = sinon.spy();

      pagingFn(["id1", "id2"], callback);

      assert.isTrue(fakeGateway.http.post.called);

      let requestBody = fakeGateway.http.post.firstCall.args[1];

      assert.deepEqual(requestBody.search.ids, ["id1", "id2"]);
      assert.equal(requestBody.search.status, "verified");
    });

    it("creates paging function that returns a function", function () {
      let mockSearch = {
        toHash: sinon.stub().returns({}),
      };

      let pagingFn = gateway.pagingFunctionGenerator(mockSearch);

      assert.isFunction(pagingFn);
    });

    it("paging function calls http.post", function () {
      let mockSearch = {
        toHash: sinon.stub().returns({}),
      };

      let pagingFn = gateway.pagingFunctionGenerator(mockSearch);

      pagingFn(["id1"], sinon.spy());

      assert.isTrue(fakeGateway.http.post.called);
    });
  });

  describe("responseHandler", () => {
    it("returns a response handler function", function () {
      let handler = gateway.responseHandler();

      assert.isFunction(handler);
    });
  });
});
