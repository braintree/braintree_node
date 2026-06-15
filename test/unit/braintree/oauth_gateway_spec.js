"use strict";

let sinon = require("sinon");
let OAuthGateway = require("../../../lib/braintree/oauth_gateway").OAuthGateway;

describe("OAuthGateway", () => {
  let oauthGateway, fakeGateway;

  beforeEach(() => {
    fakeGateway = {
      config: {
        clientId: "test_client_id",
        baseUrl: () => "https://api.example.com",
      },
      http: {
        post: sinon.stub().resolves({
          credentials: { accessToken: "test_token" },
        }),
      },
    };

    oauthGateway = new OAuthGateway(fakeGateway);
  });

  describe("createTokenFromCode", () => {
    it("posts to oauth access_tokens endpoint", function () {
      let attributes = {
        code: "auth_code",
        redirectUri: "https://example.com/callback",
      };

      oauthGateway.createTokenFromCode(attributes);

      assert.isTrue(fakeGateway.http.post.called);
      assert.equal(
        fakeGateway.http.post.firstCall.args[0],
        "/oauth/access_tokens"
      );
    });

    it("sets grantType to authorization_code", function () {
      let attributes = { code: "auth_code" };

      oauthGateway.createTokenFromCode(attributes);

      assert.equal(attributes.grantType, "authorization_code");
    });

    it("uses responseHandler for response transformation", function () {
      let attributes = { code: "auth_code" };

      fakeGateway.http.post.resolves({
        credentials: { accessToken: "token123" },
      });

      return oauthGateway.createTokenFromCode(attributes).then((response) => {
        assert.exists(response);
      });
    });
  });

  describe("createTokenFromRefreshToken", () => {
    it("posts to oauth access_tokens endpoint", function () {
      let attributes = { refreshToken: "refresh_token" };

      oauthGateway.createTokenFromRefreshToken(attributes);

      assert.isTrue(fakeGateway.http.post.called);
      assert.equal(
        fakeGateway.http.post.firstCall.args[0],
        "/oauth/access_tokens"
      );
    });

    it("sets grantType to refresh_token", function () {
      let attributes = { refreshToken: "refresh_token" };

      oauthGateway.createTokenFromRefreshToken(attributes);

      assert.equal(attributes.grantType, "refresh_token");
    });

    it("uses responseHandler for response transformation", function () {
      let attributes = { refreshToken: "refresh_token" };

      fakeGateway.http.post.resolves({
        credentials: { accessToken: "new_token" },
      });

      return oauthGateway
        .createTokenFromRefreshToken(attributes)
        .then((response) => {
          assert.exists(response);
        });
    });
  });

  describe("revokeAccessToken", () => {
    it("posts to oauth revoke_access_token endpoint", function () {
      oauthGateway.revokeAccessToken("test_token");

      assert.isTrue(fakeGateway.http.post.called);
      assert.equal(
        fakeGateway.http.post.firstCall.args[0],
        "/oauth/revoke_access_token"
      );
    });

    it("sends token in request body", function () {
      oauthGateway.revokeAccessToken("test_token");

      let requestBody = fakeGateway.http.post.firstCall.args[1];

      assert.deepEqual(requestBody, { token: "test_token" });
    });
  });

  describe("connectUrl", () => {
    it("builds connect url with clientId", function () {
      let url = oauthGateway.connectUrl({});

      assert.include(url, "client_id=test_client_id");
      assert.include(url, "/oauth/connect?");
    });

    it("includes base url", function () {
      let url = oauthGateway.connectUrl({});

      assert.include(url, "https://api.example.com");
    });

    it("includes redirect_uri parameter", function () {
      let url = oauthGateway.connectUrl({
        redirectUri: "https://example.com/callback",
      });

      assert.include(url, "redirect_uri=");
    });

    it("includes scopes parameter", function () {
      let url = oauthGateway.connectUrl({
        scopes: "read_write",
      });

      assert.include(url, "scopes=");
    });

    it("converts camelCase to snake_case", function () {
      let url = oauthGateway.connectUrl({
        redirectUri: "https://example.com",
      });

      assert.include(url, "redirect_uri=");
      assert.notInclude(url, "redirectUri=");
    });
  });

  describe("buildQuery", () => {
    it("builds query string from simple params", function () {
      let params = {
        clientId: "test_client_id",
        scopes: "read_write",
      };

      let query = oauthGateway.buildQuery(params);

      assert.include(query, "client_id=test_client_id");
      assert.include(query, "scopes=read_write");
    });

    it("handles user sub-parameters", function () {
      let params = {
        user: {
          firstName: "John",
          lastName: "Doe",
        },
      };

      let query = oauthGateway.buildQuery(params);

      assert.include(query, "user%5Bfirst_name%5D=John");
      assert.include(query, "user%5Blast_name%5D=Doe");
    });

    it("handles business sub-parameters", function () {
      let params = {
        business: {
          companyName: "Acme Corp",
        },
      };

      let query = oauthGateway.buildQuery(params);

      assert.include(query, "business%5Bcompany_name%5D=Acme%20Corp");
    });

    it("handles payment_methods array parameter", function () {
      let params = {
        paymentMethods: ["credit_card", "paypal"],
      };

      let query = oauthGateway.buildQuery(params);

      assert.include(query, "payment_methods%5B%5D=credit_card");
      assert.include(query, "payment_methods%5B%5D=paypal");
    });

    it("encodes special characters", function () {
      let params = {
        redirectUri: "https://example.com/callback?foo=bar",
      };

      let query = oauthGateway.buildQuery(params);

      assert.notInclude(query, "?");
      assert.notInclude(query, "&");
    });
  });

  describe("buildSubQuery", () => {
    it("builds sub-query array from nested params", function () {
      let subParams = {
        firstName: "John",
        lastName: "Doe",
      };

      let result = oauthGateway.buildSubQuery("user", subParams);

      assert.equal(result.length, 2);
      assert.deepEqual(result[0], ["user[firstName]", "John"]);
      assert.deepEqual(result[1], ["user[lastName]", "Doe"]);
    });

    it("returns empty array for empty params", function () {
      let result = oauthGateway.buildSubQuery("user", {});

      assert.isArray(result);
      assert.isEmpty(result);
    });
  });

  describe("buildSubArrayQuery", () => {
    it("builds array query from values", function () {
      let values = ["credit_card", "paypal"];

      let result = oauthGateway.buildSubArrayQuery("payment_methods", values);

      assert.equal(result.length, 2);
      assert.deepEqual(result[0], ["payment_methods[]", "credit_card"]);
      assert.deepEqual(result[1], ["payment_methods[]", "paypal"]);
    });

    it("returns empty array for null values", function () {
      let result = oauthGateway.buildSubArrayQuery("payment_methods", null);

      assert.isArray(result);
      assert.isEmpty(result);
    });

    it("returns empty array for empty values", function () {
      let result = oauthGateway.buildSubArrayQuery("payment_methods", []);

      assert.isArray(result);
      assert.isEmpty(result);
    });
  });

  describe("_encodeValue", () => {
    it("encodes special characters", function () {
      let result = oauthGateway._encodeValue("https://example.com");

      assert.include(result, "%3A");
      assert.include(result, "%2F");
    });

    it("encodes spaces as %20", function () {
      let result = oauthGateway._encodeValue("hello world");

      assert.include(result, "%20");
    });

    it("escapes single quotes", function () {
      let result = oauthGateway._encodeValue("it's");

      assert.notInclude(result, "'");
    });

    it("escapes asterisks as %2A", function () {
      let result = oauthGateway._encodeValue("test*value");

      assert.include(result, "%2A");
    });

    it("escapes parentheses", function () {
      let result = oauthGateway._encodeValue("test(value)");

      assert.notInclude(result, "(");
      assert.notInclude(result, ")");
    });
  });

  describe("responseHandler", () => {
    it("returns a response handler function", function () {
      let handler = oauthGateway.responseHandler();

      assert.isFunction(handler);
    });

    it("uses OAuthCredentials for response transformation", function () {
      oauthGateway.responseHandler();

      fakeGateway.http.post.resolves({
        credentials: { accessToken: "token123" },
      });

      return oauthGateway
        .createTokenFromCode({ code: "auth_code" })
        .then((response) => {
          assert.exists(response);
        });
    });
  });
});
