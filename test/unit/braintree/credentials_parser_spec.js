"use strict";

let {
  CredentialsParser,
} = require("../../../lib/braintree/credentials_parser");
let { Environment } = require("../../../lib/braintree/environment");

describe("CredentialsParser", () => {
  let parser;

  beforeEach(() => {
    parser = new CredentialsParser();
  });

  describe("parseClientCredentials", () => {
    it("accepts valid development credentials", function () {
      let clientId = "client_id$development$abc123";
      let clientSecret = "client_secret$development$xyz789";

      let environment = parser.parseClientCredentials(clientId, clientSecret);

      assert.equal(environment, Environment.Development);
    });

    it("accepts valid integration credentials", function () {
      let clientId = "client_id$integration$abc123";
      let clientSecret = "client_secret$integration$xyz789";

      let environment = parser.parseClientCredentials(clientId, clientSecret);

      assert.equal(environment, Environment.Development);
    });

    it("accepts valid sandbox credentials", function () {
      let clientId = "client_id$sandbox$abc123";
      let clientSecret = "client_secret$sandbox$xyz789";

      let environment = parser.parseClientCredentials(clientId, clientSecret);

      assert.equal(environment, Environment.Sandbox);
    });

    it("accepts valid qa credentials", function () {
      let clientId = "client_id$qa$abc123";
      let clientSecret = "client_secret$qa$xyz789";

      let environment = parser.parseClientCredentials(clientId, clientSecret);

      assert.equal(environment, Environment.Qa);
    });

    it("accepts valid production credentials", function () {
      let clientId = "client_id$production$abc123";
      let clientSecret = "client_secret$production$xyz789";

      let environment = parser.parseClientCredentials(clientId, clientSecret);

      assert.equal(environment, Environment.Production);
    });

    it("stores clientId on instance", function () {
      let clientId = "client_id$development$abc123";
      let clientSecret = "client_secret$development$xyz789";

      parser.parseClientCredentials(clientId, clientSecret);

      assert.equal(parser.clientId, clientId);
    });

    it("stores clientSecret on instance", function () {
      let clientId = "client_id$development$abc123";
      let clientSecret = "client_secret$development$xyz789";

      parser.parseClientCredentials(clientId, clientSecret);

      assert.equal(parser.clientSecret, clientSecret);
    });

    it("stores environment on instance", function () {
      let clientId = "client_id$sandbox$abc123";
      let clientSecret = "client_secret$sandbox$xyz789";

      parser.parseClientCredentials(clientId, clientSecret);

      assert.equal(parser.environment, Environment.Sandbox);
    });

    it("throws error for missing clientId", function () {
      assert.throws(() => {
        parser.parseClientCredentials(null, "client_secret$development$xyz");
      }, /Missing clientId/);
    });

    it("throws error for empty clientId", function () {
      assert.throws(() => {
        parser.parseClientCredentials("", "client_secret$development$xyz");
      }, /Missing clientId/);
    });

    it("throws error for missing clientSecret", function () {
      assert.throws(() => {
        parser.parseClientCredentials("client_id$development$abc", null);
      }, /Missing clientSecret/);
    });

    it("throws error for empty clientSecret", function () {
      assert.throws(() => {
        parser.parseClientCredentials("client_id$development$abc", "");
      }, /Missing clientSecret/);
    });

    it("throws error for clientId not starting with client_id", function () {
      assert.throws(() => {
        parser.parseClientCredentials(
          "invalid$development$abc",
          "client_secret$development$xyz"
        );
      }, /Value passed for clientId is not a client id/);
    });

    it("throws error for clientSecret not starting with client_secret", function () {
      assert.throws(() => {
        parser.parseClientCredentials(
          "client_id$development$abc",
          "invalid$development$xyz"
        );
      }, /Value passed for clientSecret is not a client secret/);
    });

    it("throws error for mismatched environments", function () {
      assert.throws(() => {
        parser.parseClientCredentials(
          "client_id$development$abc",
          "client_secret$sandbox$xyz"
        );
      }, /Mismatched credential environments/);
    });

    it("throws error with development clientId and production clientSecret", function () {
      assert.throws(() => {
        parser.parseClientCredentials(
          "client_id$development$abc",
          "client_secret$production$xyz"
        );
      }, /Mismatched credential environments/);
    });

    it("throws error for unknown environment", function () {
      assert.throws(() => {
        parser.parseClientCredentials(
          "client_id$unknown$abc",
          "client_secret$unknown$xyz"
        );
      }, /Unknown environment/);
    });
  });

  describe("parseAccessToken", () => {
    it("accepts valid development access token", function () {
      let accessToken = "access_token$development$merchant_id$token_data";

      let environment = parser.parseAccessToken(accessToken);

      assert.equal(environment, Environment.Development);
    });

    it("accepts valid integration access token", function () {
      let accessToken = "access_token$integration$merchant_id$token_data";

      let environment = parser.parseAccessToken(accessToken);

      assert.equal(environment, Environment.Development);
    });

    it("accepts valid sandbox access token", function () {
      let accessToken = "access_token$sandbox$merchant_id$token_data";

      let environment = parser.parseAccessToken(accessToken);

      assert.equal(environment, Environment.Sandbox);
    });

    it("accepts valid qa access token", function () {
      let accessToken = "access_token$qa$merchant_id$token_data";

      let environment = parser.parseAccessToken(accessToken);

      assert.equal(environment, Environment.Qa);
    });

    it("accepts valid production access token", function () {
      let accessToken = "access_token$production$merchant_id$token_data";

      let environment = parser.parseAccessToken(accessToken);

      assert.equal(environment, Environment.Production);
    });

    it("stores accessToken on instance", function () {
      let accessToken = "access_token$development$merchant_id$token_data";

      parser.parseAccessToken(accessToken);

      assert.equal(parser.accessToken, accessToken);
    });

    it("stores environment on instance", function () {
      let accessToken = "access_token$sandbox$merchant_id$token_data";

      parser.parseAccessToken(accessToken);

      assert.equal(parser.environment, Environment.Sandbox);
    });

    it("extracts merchantId from access token", function () {
      let accessToken = "access_token$development$test_merchant_123$token_data";

      parser.parseAccessToken(accessToken);

      assert.equal(parser.merchantId, "test_merchant_123");
    });

    it("throws error for missing access token", function () {
      assert.throws(() => {
        parser.parseAccessToken(null);
      }, /Missing access token/);
    });

    it("throws error for empty access token", function () {
      assert.throws(() => {
        parser.parseAccessToken("");
      }, /Missing access token/);
    });

    it("throws error for access token not starting with access_token", function () {
      assert.throws(() => {
        parser.parseAccessToken("invalid$development$merchant_id$data");
      }, /Value passed for accessToken is not a valid access token/);
    });

    it("throws error for unknown environment in access token", function () {
      assert.throws(() => {
        parser.parseAccessToken("access_token$unknown$merchant_id$data");
      }, /Unknown environment/);
    });

    it("returns environment for valid token", function () {
      let environment = parser.parseAccessToken(
        "access_token$production$merchant_id$data"
      );

      assert.equal(environment, Environment.Production);
    });
  });

  describe("parseEnvironment", () => {
    it("returns Development for development credential", function () {
      let environment = parser.parseEnvironment("any$development$more");

      assert.equal(environment, Environment.Development);
    });

    it("returns Development for integration credential", function () {
      let environment = parser.parseEnvironment("any$integration$more");

      assert.equal(environment, Environment.Development);
    });

    it("returns Sandbox for sandbox credential", function () {
      let environment = parser.parseEnvironment("any$sandbox$more");

      assert.equal(environment, Environment.Sandbox);
    });

    it("returns Qa for qa credential", function () {
      let environment = parser.parseEnvironment("any$qa$more");

      assert.equal(environment, Environment.Qa);
    });

    it("returns Production for production credential", function () {
      let environment = parser.parseEnvironment("any$production$more");

      assert.equal(environment, Environment.Production);
    });

    it("throws error for unknown environment", function () {
      assert.throws(() => {
        parser.parseEnvironment("any$unknown$more");
      }, /Unknown environment: unknown/);
    });

    it("throws error for invalid environment", function () {
      assert.throws(() => {
        parser.parseEnvironment("any$invalid$more");
      }, /Unknown environment: invalid/);
    });

    it("throws error for empty environment", function () {
      assert.throws(() => {
        parser.parseEnvironment("any$$more");
      }, /Unknown environment/);
    });
  });
});
