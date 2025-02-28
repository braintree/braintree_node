"use strict";

const {
  TransactionLineItem,
} = require("../../../lib/braintree/transaction_line_item");
let Nonces = require("../../../lib/braintree/test_values/nonces").Nonces;
let ValidationErrorCodes =
  require("../../../lib/braintree/validation_error_codes").ValidationErrorCodes;

describe("PayPalPaymentResourceGateway", function () {
  describe("update", function () {
    it("can update a payment resource", function (done) {
      let requestParams = {
        amount: "55.00",
        amountBreakdown: {
          discount: "15.00",
          handling: "0.00",
          insurance: "5.00",
          itemTotal: "45.00",
          shipping: "10.00",
          shippingDiscount: "0.00",
          taxTotal: "10.00",
        },
        currencyIsoCode: "USD",
        customField: "0437",
        description: "This is a test",
        lineItems: [
          {
            description: "Shoes",
            imageUrl: "https://example.com/products/23434/pic.png",
            kind: TransactionLineItem.Kind.Debit,
            name: "Name #1",
            productCode: "23434",
            quantity: "1",
            totalAmount: "45.00",
            unitAmount: "45.00",
            unitTaxAmount: "10.00",
            url: "https://example.com/products/23434",
          },
        ],
        orderId: "order-123456789",
        payeeEmail: "bt_buyer_us@paypal.com",
        paymentMethodNonce: Nonces.PayPalOneTimePayment,
        shipping: {
          firstName: "John",
          lastName: "Doe",
          streetAddress: "123 Division Street",
          extendedAddress: "Apt. #1",
          locality: "Chicago",
          region: "IL",
          postalCode: "60618",
          countryName: "United States",
          countryCodeAlpha2: "US",
          countryCodeAlpha3: "USA",
          countryCodeNumeric: "484",
          internationalPhone: {
            countryCode: "1",
            nationalNumber: "4081111111",
          },
        },
        shippingOptions: [
          {
            amount: "10.00",
            id: "option1",
            label: "fast",
            selected: true,
            type: "SHIPPING",
          },
        ],
      };

      specHelper.defaultGateway.paypalPaymentResource.update(
        requestParams,
        function (err, response) {
          let paymentMethodNonce = response.paymentMethodNonce;

          assert.isNull(err);
          assert.isTrue(response.success);
          assert.isNotNull(paymentMethodNonce.nonce);
          assert.isString(paymentMethodNonce.type);

          done();
        }
      );
    });
    it("returns valid error response", function (done) {
      let requestParams = {
        amount: "55.00",
        currencyIsoCode: "USD",
        customField: "0437",
        description: "This is a test",
        orderId: "order-123456789",
        payeeEmail: "bt_buyer_us@paypal",
        paymentMethodNonce: Nonces.PayPalOneTimePayment,
        shippingOptions: [
          {
            amount: "10.00",
            id: "option1",
            label: "fast",
            selected: true,
            type: "SHIPPING",
          },
        ],
      };

      specHelper.defaultGateway.paypalPaymentResource.update(
        requestParams,
        function (err, response) {
          assert.isFalse(response.success);
          assert.equal(
            response.errors.for("paypalPaymentResource").on("payeeEmail")[0]
              .code,
            ValidationErrorCodes.PayPalPaymentResource.InvalidEmail
          );

          done();
        }
      );
    });
  });
});
