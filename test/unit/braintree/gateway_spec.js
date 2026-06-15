"use strict";

let sinon = require("sinon");
let { Gateway } = require("../../../lib/braintree/gateway");
let { ErrorResponse } = require("../../../lib/braintree/error_response");
let { SearchResponse } = require("../../../lib/braintree/search_response");

class TestKlass {
  constructor(attributes) {
    this.attributes = attributes;
  }
}

describe("Gateway", () => {
  let gateway, fakeGateway;

  beforeEach(() => {
    fakeGateway = {
      http: {
        post: sinon.stub(),
      },
    };

    gateway = new Gateway();
    gateway.gateway = fakeGateway;
    gateway.config = {
      baseMerchantPath: () => "/merchants/test_merchant",
    };
  });

  describe("createResponseHandler", () => {
    it("returns a function", function () {
      let handler = gateway.createResponseHandler("test", TestKlass);

      assert.isFunction(handler);
    });

    it("returns error response for apiErrorResponse", function () {
      let handler = gateway.createResponseHandler("test", TestKlass);

      let response = {
        apiErrorResponse: {
          message: "Test error",
        },
      };

      return handler(response).then((result) => {
        assert.instanceOf(result, ErrorResponse);
        assert.isFalse(result.success);
      });
    });

    it("marks response as success when no error", function () {
      let handler = gateway.createResponseHandler(null, TestKlass);

      let response = {
        data: "test",
      };

      return handler(response).then((result) => {
        assert.isTrue(result.success);
      });
    });

    it("returns response when attributeKlassMap is null", function () {
      let handler = gateway.createResponseHandler(null, TestKlass);

      let response = {
        data: "test",
      };

      return handler(response).then((result) => {
        assert.deepEqual(result, { data: "test", success: true });
      });
    });

    it("instantiates class when attribute name matches string", function () {
      let handler = gateway.createResponseHandler("testAttr", TestKlass);

      let response = {
        testAttr: { id: "123" },
      };

      return handler(response).then((result) => {
        assert.instanceOf(result.testAttr, TestKlass);
        assert.equal(result.testAttr.attributes.id, "123");
      });
    });

    it("does not instantiate class when Klass is null", function () {
      let handler = gateway.createResponseHandler("testAttr", null);

      let response = {
        testAttr: { id: "123" },
      };

      return handler(response).then((result) => {
        assert.deepEqual(result.testAttr, { id: "123" });
      });
    });

    it("handles attribute name not present in response", function () {
      let handler = gateway.createResponseHandler("missingAttr", TestKlass);

      let response = {
        testAttr: { id: "123" },
      };

      return handler(response).then((result) => {
        assert.notExists(result.missingAttr);
      });
    });

    it("instantiates class from object map", function () {
      let handler = gateway.createResponseHandler(
        { attr1: TestKlass },
        TestKlass
      );

      let response = {
        attr1: { id: "123" },
      };

      return handler(response).then((result) => {
        assert.instanceOf(result.attr1, TestKlass);
      });
    });

    it("uses correct class from attribute map", function () {
      class TestKlass2 {
        constructor(attributes) {
          this.type = "class2";
          this.attributes = attributes;
        }
      }

      let handler = gateway.createResponseHandler(
        { attr1: TestKlass, attr2: TestKlass2 },
        null
      );

      let response = {
        attr1: { id: "123" },
      };

      return handler(response).then((result) => {
        assert.instanceOf(result.attr1, TestKlass);
        assert.notExists(result.attr2);
      });
    });

    it("returns response when no matching attribute in map", function () {
      let handler = gateway.createResponseHandler(
        { attr1: TestKlass, attr2: TestKlass },
        null
      );

      let response = {
        attr3: { id: "123" },
      };

      return handler(response).then((result) => {
        assert.exists(result);
      });
    });

    it("passes gateway to instantiated class", function () {
      class GatewayCheckKlass {
        constructor(attributes, gw) {
          this.gateway = gw;
        }
      }

      let handler = gateway.createResponseHandler(
        "testAttr",
        GatewayCheckKlass
      );

      let response = {
        testAttr: { id: "123" },
      };

      return handler(response).then((result) => {
        assert.equal(result.testAttr.gateway, fakeGateway);
      });
    });
  });

  describe("createSearchResponse", () => {
    it("posts to search endpoint", function () {
      fakeGateway.http.post.resolves({
        searchResults: {
          ids: ["id1", "id2"],
          pageSize: 10,
        },
      });

      let search = {
        toHash: () => ({ status: "Active" }),
      };

      gateway.createSearchResponse("/search", search, () => {}, null);

      assert.isTrue(fakeGateway.http.post.called);
      assert.equal(fakeGateway.http.post.firstCall.args[0], "/search");
    });

    it("wraps search in search key", function () {
      fakeGateway.http.post.resolves({
        searchResults: {
          ids: ["id1"],
          pageSize: 10,
        },
      });

      let search = {
        toHash: () => ({ status: "Active" }),
      };

      gateway.createSearchResponse("/search", search, () => {}, null);

      let requestBody = fakeGateway.http.post.firstCall.args[1];

      assert.deepEqual(requestBody, { search: { status: "Active" } });
    });

    it("returns SearchResponse stream when no callback", function () {
      fakeGateway.http.post.callsFake((url, body, callback) => {
        callback(null, {
          searchResults: {
            ids: ["id1"],
            pageSize: 10,
          },
        });
      });

      let search = {
        toHash: () => ({}),
      };

      let result = gateway.createSearchResponse(
        "/search",
        search,
        () => {},
        null
      );

      assert.exists(result);
    });

    it("calls callback with SearchResponse when callback provided", function () {
      fakeGateway.http.post.resolves({
        searchResults: {
          ids: ["id1"],
          pageSize: 10,
        },
      });

      let search = {
        toHash: () => ({}),
      };

      let callback = sinon.spy();

      gateway.createSearchResponse("/search", search, () => {}, callback);

      assert.isTrue(fakeGateway.http.post.called);
    });

    it("sets fatal error on stream for apiErrorResponse", function () {
      fakeGateway.http.post.callsFake((url, body, callback) => {
        callback(null, {
          apiErrorResponse: {
            message: "Error",
          },
        });
      });

      let search = {
        toHash: () => ({}),
      };

      gateway.createSearchResponse("/search", search, () => {}, null);

      assert.isTrue(fakeGateway.http.post.called);
    });

    it("sets fatal error on stream for unexpected response", function () {
      fakeGateway.http.post.callsFake((url, body, callback) => {
        callback(null, {});
      });

      let search = {
        toHash: () => ({}),
      };

      gateway.createSearchResponse("/search", search, () => {}, null);

      assert.isTrue(fakeGateway.http.post.called);
    });

    it("sets fatal error on stream for http error", function () {
      let error = new Error("HTTP Error");

      fakeGateway.http.post.callsFake((url, body, callback) => {
        callback(error, null);
      });

      let search = {
        toHash: () => ({}),
      };

      gateway.createSearchResponse("/search", search, () => {}, null);

      assert.isTrue(fakeGateway.http.post.called);
    });
  });

  describe("searchResponseHandler", () => {
    it("returns a function", function () {
      let handler = gateway.searchResponseHandler(
        () => {},
        () => {}
      );

      assert.isFunction(handler);
    });

    it("calls callback with error when http error", function () {
      let callback = sinon.spy();
      let handler = gateway.searchResponseHandler(() => {}, callback);

      let error = new Error("HTTP Error");

      handler(error, null);

      assert.isTrue(callback.called);
      assert.equal(callback.firstCall.args[0], error);
    });

    it("calls callback with SearchResponse for searchResults", function () {
      let callback = sinon.spy();
      let handler = gateway.searchResponseHandler(() => {}, callback);

      let response = {
        searchResults: {
          ids: ["id1"],
          pageSize: 10,
        },
      };

      handler(null, response);

      assert.isTrue(callback.called);
      assert.isNull(callback.firstCall.args[0]);
      assert.instanceOf(callback.firstCall.args[1], SearchResponse);
    });

    it("calls callback with ErrorResponse for apiErrorResponse", function () {
      let callback = sinon.spy();
      let handler = gateway.searchResponseHandler(() => {}, callback);

      let response = {
        apiErrorResponse: {
          message: "Error",
        },
      };

      handler(null, response);

      assert.isTrue(callback.called);
      assert.isNull(callback.firstCall.args[0]);
      assert.instanceOf(callback.firstCall.args[1], ErrorResponse);
    });

    it("calls callback with UnexpectedError for unknown response", function () {
      let callback = sinon.spy();
      let handler = gateway.searchResponseHandler(() => {}, callback);

      let response = {};

      handler(null, response);

      assert.isTrue(callback.called);
      assert.exists(callback.firstCall.args[0]);
    });
  });

  describe("pagingFunctionGenerator", () => {
    it("returns a function", function () {
      let search = {
        ids: () => ({
          in: sinon.stub(),
        }),
      };

      let pagingFn = gateway.pagingFunctionGenerator(
        search,
        "/url",
        TestKlass,
        "results",
        (response) => response.results
      );

      assert.isFunction(pagingFn);
    });

    it("posts to correct endpoint with ids", function () {
      fakeGateway.http.post.callsFake((url, body, callback) => {
        callback(null, { results: [{ id: "123" }] });
      });

      let search = {
        ids: () => ({
          in: sinon.stub(),
        }),
        toHash: () => ({}),
      };

      let pagingFn = gateway.pagingFunctionGenerator(
        search,
        "/results",
        TestKlass,
        "results",
        (response) => response.results
      );

      let callback = sinon.spy();

      pagingFn(["id1", "id2"], callback);

      assert.isTrue(fakeGateway.http.post.called);
      assert.include(fakeGateway.http.post.firstCall.args[0], "/results");
    });

    it("wraps results with SubjectType class", function () {
      fakeGateway.http.post.callsFake((url, body, callback) => {
        callback(null, { results: { id: "123" } });
      });

      let search = {
        ids: () => ({
          in: sinon.stub(),
        }),
        toHash: () => ({}),
      };

      let callback = sinon.spy();

      let pagingFn = gateway.pagingFunctionGenerator(
        search,
        "/url",
        TestKlass,
        "results",
        (response) => response.results
      );

      pagingFn(["id1"], callback);

      assert.isTrue(callback.called);
      assert.instanceOf(callback.firstCall.args[1], TestKlass);
    });

    it("handles array results", function () {
      fakeGateway.http.post.callsFake((url, body, callback) => {
        callback(null, { results: [{ id: "1" }, { id: "2" }] });
      });

      let search = {
        ids: () => ({
          in: sinon.stub(),
        }),
        toHash: () => ({}),
      };

      let callback = sinon.spy();

      let pagingFn = gateway.pagingFunctionGenerator(
        search,
        "/url",
        TestKlass,
        "results",
        (response) => response.results
      );

      pagingFn(["id1"], callback);

      assert.equal(callback.callCount, 2);
    });

    it("calls callback with error on http error", function () {
      fakeGateway.http.post.callsFake((url, body, callback) => {
        let error = new Error("HTTP Error");

        callback(error, null);
      });

      let search = {
        ids: () => ({
          in: sinon.stub(),
        }),
        toHash: () => ({}),
      };

      let callback = sinon.spy();

      let pagingFn = gateway.pagingFunctionGenerator(
        search,
        "/url",
        TestKlass,
        "results",
        (response) => response.results
      );

      pagingFn(["id1"], callback);

      assert.isTrue(callback.called);
      assert.exists(callback.firstCall.args[0]);
    });

    it("calls callback with UnexpectedError for missing key", function () {
      fakeGateway.http.post.callsFake((url, body, callback) => {
        callback(null, {});
      });

      let search = {
        ids: () => ({
          in: sinon.stub(),
        }),
        toHash: () => ({}),
      };

      let callback = sinon.spy();

      let pagingFn = gateway.pagingFunctionGenerator(
        search,
        "/url",
        TestKlass,
        "results",
        (response) => response.results
      );

      pagingFn(["id1"], callback);

      assert.isTrue(callback.called);
      assert.exists(callback.firstCall.args[0]);
    });

    it("calls search.ids().in() with ids array", function () {
      fakeGateway.http.post.callsFake((url, body, callback) => {
        callback(null, { results: [] });
      });

      let idsStub = sinon.stub().returns({ in: sinon.stub() });

      let search = {
        ids: idsStub,
        toHash: () => ({}),
      };

      let pagingFn = gateway.pagingFunctionGenerator(
        search,
        "/url",
        TestKlass,
        "results",
        (response) => response.results
      );

      pagingFn(["id1", "id2"], () => {});

      assert.isTrue(idsStub.called);
    });
  });
});
