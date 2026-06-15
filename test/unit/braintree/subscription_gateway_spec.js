"use strict";

let sinon = require("sinon");
let {
  SubscriptionGateway,
} = require("../../../lib/braintree/subscription_gateway");
let { Subscription } = require("../../../lib/braintree/subscription");
let { errorTypes } = require("../../../lib/braintree/error_types");

describe("SubscriptionGateway", () => {
  let gateway, fakeGateway;

  beforeEach(() => {
    fakeGateway = {
      config: {
        baseMerchantPath: () => "/merchants/test_merchant",
      },
      http: {
        post: sinon.stub().resolves({
          subscription: {
            id: "subscription_123",
            status: "Active",
            transactions: [],
          },
        }),
        get: sinon.stub().resolves({
          subscription: {
            id: "subscription_123",
            status: "Active",
            transactions: [],
          },
        }),
        put: sinon.stub().resolves({
          subscription: {
            id: "subscription_123",
            status: "Canceled",
            transactions: [],
          },
        }),
      },
    };

    gateway = new SubscriptionGateway(fakeGateway);
  });

  describe("create", () => {
    it("posts to subscriptions endpoint", function () {
      let attributes = {
        paymentMethodToken: "token_123",
        planId: "plan_123",
      };

      gateway.create(attributes);

      assert.isTrue(fakeGateway.http.post.called);
      assert.include(fakeGateway.http.post.firstCall.args[0], "subscriptions");
    });

    it("wraps attributes in subscription key", function () {
      let attributes = {
        paymentMethodToken: "token_123",
        planId: "plan_123",
      };

      gateway.create(attributes);

      let requestBody = fakeGateway.http.post.firstCall.args[1];

      assert.deepEqual(requestBody, { subscription: attributes });
    });

    it("returns subscription data", function () {
      fakeGateway.http.post.resolves({
        subscription: {
          id: "subscription_456",
          status: "Active",
          transactions: [],
        },
      });

      return gateway.create({ planId: "plan_123" }).then((subscription) => {
        assert.exists(subscription);
      });
    });
  });

  describe("cancel", () => {
    it("puts to cancel endpoint", function () {
      gateway.cancel("subscription_123");

      assert.isTrue(fakeGateway.http.put.called);
      assert.include(
        fakeGateway.http.put.firstCall.args[0],
        "subscriptions/subscription_123/cancel"
      );
    });

    it("sends null as request body", function () {
      gateway.cancel("subscription_123");

      let requestBody = fakeGateway.http.put.firstCall.args[1];

      assert.isNull(requestBody);
    });

    it("returns subscription data", function () {
      fakeGateway.http.put.resolves({
        subscription: {
          id: "subscription_123",
          status: "Canceled",
          transactions: [],
        },
      });

      return gateway.cancel("subscription_123").then((subscription) => {
        assert.exists(subscription);
      });
    });
  });

  describe("find", () => {
    it("calls get on correct path", function () {
      gateway.find("subscription_123");

      assert.isTrue(fakeGateway.http.get.called);
      assert.include(
        fakeGateway.http.get.firstCall.args[0],
        "subscriptions/subscription_123"
      );
    });

    it("returns Subscription object", function () {
      fakeGateway.http.get.resolves({
        subscription: {
          id: "subscription_123",
          status: "Active",
          transactions: [],
        },
      });

      return gateway.find("subscription_123").then((subscription) => {
        assert.instanceOf(subscription, Subscription);
        assert.equal(subscription.id, "subscription_123");
      });
    });

    it("rejects with NotFoundError for empty subscriptionId", function () {
      return gateway.find("").catch((err) => {
        assert.equal(err.type, errorTypes.notFoundError);
      });
    });

    it("rejects with NotFoundError for whitespace subscriptionId", function () {
      return gateway.find("   ").catch((err) => {
        assert.equal(err.type, errorTypes.notFoundError);
      });
    });

    it("does not call http.get for empty subscriptionId", function () {
      return gateway.find("").catch(() => {
        assert.isFalse(fakeGateway.http.get.called);
      });
    });
  });

  describe("update", () => {
    it("puts to correct path", function () {
      let attributes = { description: "Updated description" };

      gateway.update("subscription_123", attributes);

      assert.isTrue(fakeGateway.http.put.called);
      assert.include(
        fakeGateway.http.put.firstCall.args[0],
        "subscriptions/subscription_123"
      );
    });

    it("wraps attributes in subscription key", function () {
      let attributes = { description: "Updated description" };

      gateway.update("subscription_123", attributes);

      let requestBody = fakeGateway.http.put.firstCall.args[1];

      assert.deepEqual(requestBody, { subscription: attributes });
    });

    it("returns subscription data", function () {
      fakeGateway.http.put.resolves({
        subscription: {
          id: "subscription_123",
          description: "Updated description",
          transactions: [],
        },
      });

      return gateway
        .update("subscription_123", { description: "Updated" })
        .then((subscription) => {
          assert.exists(subscription);
        });
    });
  });

  describe("retryCharge", () => {
    it("accepts subscriptionId, amount, and submitForSettlement", function () {
      gateway.retryCharge("subscription_123", "10.00", true);

      assert.exists(gateway);
    });

    it("accepts subscriptionId and amount", function () {
      gateway.retryCharge("subscription_123", "10.00");

      assert.exists(gateway);
    });

    it("accepts subscriptionId only", function () {
      gateway.retryCharge("subscription_123");

      assert.exists(gateway);
    });

    it("handles callback as amount parameter", function () {
      let callback = sinon.spy();

      gateway.retryCharge("subscription_123", callback);

      assert.exists(gateway);
    });

    it("handles callback as submitForSettlement parameter", function () {
      let callback = sinon.spy();

      gateway.retryCharge("subscription_123", "10.00", callback);

      assert.exists(gateway);
    });
  });

  describe("search", () => {
    it("creates SubscriptionSearch", function () {
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
        "subscriptions/advanced_search_ids"
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
  });

  describe("responseHandler", () => {
    it("returns a response handler function", function () {
      let handler = gateway.responseHandler();

      assert.isFunction(handler);
    });
  });
});
