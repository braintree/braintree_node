"use strict";

let {
  PayPalPaymentResourceGateway,
} = require("../../../lib/braintree/paypal_payment_resource_gateway");
let Gateway = require("../../../lib/braintree/gateway").Gateway;
let Util = require("../../../lib/braintree/util").Util;
let PaymentMethodNonce =
  require("../../../lib/braintree/payment_method_nonce").PaymentMethodNonce;
let { expect } = require("chai");
let sinon = require("sinon");

describe("PayPalPaymentResourceGateway", () => {
  let gateway, paypalPaymentResourceGateway, config;

  beforeEach(() => {
    config = {
      baseMerchantPath: () => "/merchants/integration_merchant_id",
    };
    gateway = {
      config: config,
      http: {
        put: sinon.stub(),
      },
    };
    paypalPaymentResourceGateway = new PayPalPaymentResourceGateway(gateway);
  });

  describe("constructor", () => {
    it("should create a new instance of PayPalPaymentResourceGateway", () => {
      expect(paypalPaymentResourceGateway).to.be.an.instanceOf(
        PayPalPaymentResourceGateway
      );
      expect(paypalPaymentResourceGateway).to.be.an.instanceOf(Gateway);
    });

    it("should set the gateway and config properties", () => {
      expect(paypalPaymentResourceGateway.gateway).to.equal(gateway);
      expect(paypalPaymentResourceGateway.config).to.equal(config);
    });
  });

  describe("update", () => {
    it("should reject with error if invalid keys are provided", async () => {
      const attributes = { invalidKey: "value" };
      const expectedError = {
        type: "invalid_keys",
        message: "Invalid keys: invalidKey",
      };

      sinon.stub(Util, "verifyKeys").returns(expectedError);

      try {
        await paypalPaymentResourceGateway.update(attributes);
        expect.fail("Expected update to reject");
      } catch (error) {
        expect(error).to.deep.equal(expectedError);
      }

      Util.verifyKeys.restore();
    });

    it("should send a PUT request with the correct data", async () => {
      const attributes = {
        amount: "10.00",
        currencyIsoCode: "USD",
        paymentMethodNonce: "fake-valid-nonce",
      };

      /* eslint-disable camelcase */
      const response = {
        payment_method_nonce: {
          nonce: "a-nonce",
        },
      };

      gateway.http.put.resolves(response);

      const result = await paypalPaymentResourceGateway.update(attributes);

      expect(gateway.http.put.calledOnce).to.equal(true);
      expect(gateway.http.put.firstCall.args[0]).to.equal(
        `${config.baseMerchantPath()}/paypal/payment_resource`
      );
      expect(gateway.http.put.firstCall.args[1]).to.deep.equal({
        paypalPaymentResource: attributes,
      });

      expect(result.payment_method_nonce).to.be.an.instanceOf(
        PaymentMethodNonce
      );
      expect(result.payment_method_nonce.nonce).to.equal("a-nonce");
    });

    it("should handle errors from the http request", async () => {
      const attributes = {
        amount: "10.00",
        currencyIsoCode: "USD",
        paymentMethodNonce: "fake-valid-nonce",
      };
      const expectedError = new Error("Request failed");

      gateway.http.put.rejects(expectedError);

      try {
        await paypalPaymentResourceGateway.update(attributes);
        expect.fail("Expected update to reject");
      } catch (error) {
        expect(error).to.equal(expectedError);
      }
    });
  });

  describe("responseHandler", () => {
    it("should return a response handler", () => {
      const handler = paypalPaymentResourceGateway.responseHandler();

      expect(handler).to.be.a("function");
    });

    it("should call createResponseHandler with the correct arguments", () => {
      const createResponseHandlerStub = sinon
        .stub(paypalPaymentResourceGateway, "createResponseHandler")
        .returns(() => {});

      paypalPaymentResourceGateway.responseHandler();
      expect(
        createResponseHandlerStub.calledWith(
          "payment_method_nonce",
          PaymentMethodNonce
        )
      ).to.equal(true);
      createResponseHandlerStub.restore();
    });
  });

  describe("_updateSignature", () => {
    it("should return the correct signature", () => {
      const signature = paypalPaymentResourceGateway._updateSignature();

      expect(signature).to.deep.equal({
        valid: [
          "amount",
          "amountBreakdown[discount]",
          "amountBreakdown[handling]",
          "amountBreakdown[insurance]",
          "amountBreakdown[itemTotal]",
          "amountBreakdown[shipping]",
          "amountBreakdown[shippingDiscount]",
          "amountBreakdown[taxTotal]",
          "currencyIsoCode",
          "customField",
          "description",
          "lineItems[commodityCode]",
          "lineItems[description]",
          "lineItems[discountAmount]",
          "lineItems[imageUrl]",
          "lineItems[itemType]",
          "lineItems[kind]",
          "lineItems[name]",
          "lineItems[productCode]",
          "lineItems[quantity]",
          "lineItems[taxAmount]",
          "lineItems[totalAmount]",
          "lineItems[unitAmount]",
          "lineItems[unitOfMeasure]",
          "lineItems[unitTaxAmount]",
          "lineItems[upcCode]",
          "lineItems[upcType]",
          "lineItems[url]",
          "orderId",
          "payeeEmail",
          "paymentMethodNonce",
          "shipping[company]",
          "shipping[countryCodeAlpha2]",
          "shipping[countryCodeAlpha3]",
          "shipping[countryCodeNumeric]",
          "shipping[countryName]",
          "shipping[extendedAddress]",
          "shipping[firstName]",
          "shipping[internationalPhone][countryCode]",
          "shipping[internationalPhone][nationalNumber]",
          "shipping[lastName]",
          "shipping[locality]",
          "shipping[phoneNumber]",
          "shipping[postalCode]",
          "shipping[region]",
          "shipping[streetAddress]",
          "shippingOptions[amount]",
          "shippingOptions[id]",
          "shippingOptions[label]",
          "shippingOptions[selected]",
          "shippingOptions[type]",
        ],
      });
    });
  });
});
