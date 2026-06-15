"use strict";

let sinon = require("sinon");
let Http = require("../../../lib/braintree/http").Http;
let { errorTypes } = require("../../../lib/braintree/error_types");

describe("Http", () => {
  let http, fakeConfig;

  beforeEach(() => {
    fakeConfig = {
      environment: {
        ssl: true,
        server: "api.example.com",
        port: 443,
      },
      apiVersion: "2018-09-25",
      timeout: 60000,
      publicKey: "public_key",
      privateKey: "private_key",
    };

    http = new Http(fakeConfig);
  });

  describe("checkHttpStatus", () => {
    it("returns null for status 200", function () {
      let result = http.checkHttpStatus(200);

      assert.isNull(result);
    });

    it("returns null for status 201", function () {
      let result = http.checkHttpStatus(201);

      assert.isNull(result);
    });

    it("returns null for status 422", function () {
      let result = http.checkHttpStatus(422);

      assert.isNull(result);
    });

    it("returns AuthenticationError for status 401", function () {
      let result = http.checkHttpStatus(401);

      assert.equal(result.type, errorTypes.authenticationError);
    });

    it("returns AuthorizationError for status 403", function () {
      let result = http.checkHttpStatus(403);

      assert.equal(result.type, errorTypes.authorizationError);
    });

    it("returns NotFoundError for status 404", function () {
      let result = http.checkHttpStatus(404);

      assert.equal(result.type, errorTypes.notFoundError);
    });

    it("returns RequestTimeoutError for status 408", function () {
      let result = http.checkHttpStatus(408);

      assert.equal(result.type, errorTypes.requestTimeoutError);
    });

    it("returns UpgradeRequired for status 426", function () {
      let result = http.checkHttpStatus(426);

      assert.equal(result.type, errorTypes.upgradeRequired);
    });

    it("returns TooManyRequestsError for status 429", function () {
      let result = http.checkHttpStatus(429);

      assert.equal(result.type, errorTypes.tooManyRequestsError);
    });

    it("returns ServerError for status 500", function () {
      let result = http.checkHttpStatus(500);

      assert.equal(result.type, errorTypes.serverError);
    });

    it("returns ServiceUnavailableError for status 503", function () {
      let result = http.checkHttpStatus(503);

      assert.equal(result.type, errorTypes.serviceUnavailableError);
    });

    it("returns GatewayTimeoutError for status 504", function () {
      let result = http.checkHttpStatus(504);

      assert.equal(result.type, errorTypes.gatewayTimeoutError);
    });

    it("returns UnexpectedError for unknown status code", function () {
      let result = http.checkHttpStatus(418);

      assert.equal(result.type, errorTypes.unexpectedError);
      assert.match(result.message, /Unexpected HTTP response/);
    });

    it("returns UnexpectedError for string status code", function () {
      let result = http.checkHttpStatus("418");

      assert.equal(result.type, errorTypes.unexpectedError);
    });
  });

  describe("HTTP methods", () => {
    let httpRequestStub;

    beforeEach(() => {
      httpRequestStub = sinon.stub(http, "httpRequest");
    });

    afterEach(() => {
      httpRequestStub.restore();
    });

    it("delete calls httpRequest with DELETE method", function () {
      httpRequestStub.resolves({ success: true });

      http.delete("/path");

      assert.isTrue(httpRequestStub.calledWith("DELETE", "/path", null));
    });

    it("get calls httpRequest with GET method", function () {
      httpRequestStub.resolves({ success: true });

      http.get("/path");

      assert.isTrue(httpRequestStub.calledWith("GET", "/path", null));
    });

    it("post calls httpRequest with POST method and body", function () {
      let body = { key: "value" };

      httpRequestStub.resolves({ success: true });

      http.post("/path", body);

      assert.isTrue(httpRequestStub.calledWith("POST", "/path", body));
    });

    it("put calls httpRequest with PUT method and body", function () {
      let body = { key: "value" };

      httpRequestStub.resolves({ success: true });

      http.put("/path", body);

      assert.isTrue(httpRequestStub.calledWith("PUT", "/path", body));
    });

    it("postMultipart calls httpRequest with file parameter", function () {
      let body = { key: "value" };
      let file = { path: "/tmp/file.pdf" };

      httpRequestStub.resolves({ success: true });

      http.postMultipart("/path", body, file);

      assert.isTrue(httpRequestStub.calledWith("POST", "/path", body, file));
    });
  });

  describe("_filetype", () => {
    it("returns image/jpeg for .jpeg files", function () {
      let result = http._filetype("document.jpeg");

      assert.equal(result, "image/jpeg");
    });

    it("returns image/jpeg for .jpg files", function () {
      let result = http._filetype("document.jpg");

      assert.equal(result, "image/jpeg");
    });

    it("returns image/png for .png files", function () {
      let result = http._filetype("document.png");

      assert.equal(result, "image/png");
    });

    it("returns application/pdf for .pdf files", function () {
      let result = http._filetype("document.pdf");

      assert.equal(result, "application/pdf");
    });

    it("returns application/octet-stream for unknown types", function () {
      let result = http._filetype("document.txt");

      assert.equal(result, "application/octet-stream");
    });
  });

  describe("authorizationHeader", () => {
    it("returns Bearer token for accessToken", function () {
      http.config.accessToken = "access_token_123";

      let result = http.authorizationHeader();

      assert.equal(result, "Bearer access_token_123");
    });

    it("returns Basic auth for clientId and clientSecret", function () {
      http.config.clientId = "client_id";
      http.config.clientSecret = "client_secret";
      delete http.config.accessToken;

      let result = http.authorizationHeader();

      assert.match(result, /^Basic /);
    });

    it("returns Basic auth for publicKey and privateKey", function () {
      delete http.config.accessToken;
      delete http.config.clientId;

      let result = http.authorizationHeader();

      assert.match(result, /^Basic /);
    });
  });

  describe("_headers", () => {
    it("returns headers object with required fields", function () {
      let result = http._headers();

      assert.exists(result.Authorization);
      assert.equal(result["X-ApiVersion"], "2018-09-25");
      assert.equal(result.Accept, "application/xml");
      assert.equal(result["Content-Type"], "application/json");
      assert.match(result["User-Agent"], /Braintree Node/);
      assert.equal(result["Accept-Encoding"], "gzip");
    });
  });

  describe("_partHeader", () => {
    it("creates form part header without filename", function () {
      let result = http._partHeader("field_name", null, "boundary123");

      assert.match(result, /--boundary123/);
      assert.match(result, /Content-Disposition: form-data; name="field_name"/);
      assert.notMatch(result, /filename/);
    });

    it("creates file part header with filename", function () {
      let result = http._partHeader("file_field", "test.pdf", "boundary123");

      assert.match(result, /--boundary123/);
      assert.match(result, /Content-Disposition: form-data; name="file_field"/);
      assert.match(result, /filename="test.pdf"/);
      assert.match(result, /Content-Type: application\/pdf/);
    });
  });

  describe("_formPart", () => {
    it("creates form part with key and value", function () {
      let result = http._formPart("key", "value", "boundary123");

      assert.instanceOf(result, Buffer);

      let resultString = result.toString();

      assert.match(resultString, /form-data; name="key"/);
      assert.match(resultString, /value/);
    });
  });
});
