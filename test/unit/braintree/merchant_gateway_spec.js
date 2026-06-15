"use strict";

let MerchantGateway =
  require("../../../lib/braintree/merchant_gateway").MerchantGateway;
let { Merchant } = require("../../../lib/braintree/merchant");
let { OAuthCredentials } = require("../../../lib/braintree/oauth_credentials");

describe("MerchantGateway", () => {
  describe("responseHandler", () => {
    let fakeGateway;

    beforeEach(() => {
      fakeGateway = {
        config: {
          baseMerchantPath() {
            return "";
          },
        },
      };
    });

    it("transforms successful response with merchant and credentials", function () {
      let mockMerchantData = {
        id: "merchant_id",
        email: "merchant@example.com",
      };
      let mockCredentialsData = {
        accessToken: "access_token_123",
        tokenType: "Bearer",
      };

      let mockResponse = {
        success: true,
        response: {
          merchant: mockMerchantData,
          credentials: mockCredentialsData,
        },
      };

      let merchantGateway = new MerchantGateway(fakeGateway);

      merchantGateway.createResponseHandler = function () {
        return () => Promise.resolve(mockResponse);
      };

      let responseHandler = merchantGateway.responseHandler();

      return responseHandler({}).then((result) => {
        assert.isTrue(result.success);
        assert.instanceOf(result.merchant, Merchant);
        assert.instanceOf(result.credentials, OAuthCredentials);
        assert.isUndefined(result.response);
        assert.equal(result.merchant.id, "merchant_id");
        assert.equal(result.merchant.email, "merchant@example.com");
        assert.equal(result.credentials.accessToken, "access_token_123");
      });
    });

    it("returns response as-is when success is false", function () {
      let mockResponse = {
        success: false,
        errors: [{ attribute: "email", code: "email.required" }],
      };

      let merchantGateway = new MerchantGateway(fakeGateway);

      merchantGateway.createResponseHandler = function () {
        return () => Promise.resolve(mockResponse);
      };

      let responseHandler = merchantGateway.responseHandler();

      return responseHandler({}).then((result) => {
        assert.isFalse(result.success);
        assert.isArray(result.errors);
        assert.equal(result.errors[0].code, "email.required");
      });
    });

    it("deletes response.response after extracting merchant and credentials", function () {
      let mockResponse = {
        success: true,
        response: {
          merchant: { id: "merchant_id" },
          credentials: { accessToken: "token" },
          someOtherData: "should be deleted",
        },
      };

      let merchantGateway = new MerchantGateway(fakeGateway);

      merchantGateway.createResponseHandler = function () {
        return () => Promise.resolve(mockResponse);
      };

      let responseHandler = merchantGateway.responseHandler();

      return responseHandler({}).then((result) => {
        assert.instanceOf(result.merchant, Merchant);
        assert.instanceOf(result.credentials, OAuthCredentials);
        assert.isUndefined(result.response);
        assert.isUndefined(result.someOtherData);
      });
    });
  });
});
