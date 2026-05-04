"use strict";

let CustomerGateway =
  require("../../../lib/braintree/customer_gateway").CustomerGateway;
let errorTypes = require("../../../lib/braintree/error_types").errorTypes;

describe("CustomerGateway", () => {
  let fakeGateway = {
    config: {
      baseMerchantPath() {
        return "";
      },
    },
    http: {
      post(url, params) {
        return Promise.resolve(params);
      },
    },
  };

  describe("sale", function () {
    it("throws error if not a valid input", function (done) {
      let customerGateway = new CustomerGateway(fakeGateway);
      let customerParams = {
        invalidParam: "invalidValue",
      };

      customerGateway.create(customerParams, (err, params) => {
        assert.notExists(params);
        assert.isNotNull(err);

        assert.equal(err.type, errorTypes.invalidKeysError);
        assert.equal(err.message, "These keys are invalid: invalidParam");
        done();
      });
    });
  });

  describe("applePayCard", function () {
    it("accepts valid applePayCard parameters", function (done) {
      let customerGateway = new CustomerGateway(fakeGateway);
      let customerParams = {
        firstName: "John",
        lastName: "Doe",
        applePayCard: {
          number: "4111111111111111",
          expirationMonth: "12",
          expirationYear: "2025",
          cryptogram: "test-cryptogram",
          eciIndicator: "05",
          cardholderName: "John Doe",
          networkTransactionId: "test-network-id",
          billingAddress: {
            firstName: "John",
            lastName: "Doe",
            streetAddress: "123 Main St",
            locality: "Chicago",
            region: "IL",
            postalCode: "60622",
            countryName: "United States",
          },
          options: {
            verifyCard: true,
            verificationAmount: "1.00",
            verificationMerchantAccountId: "merchant-123",
            verificationAccountType: "credit",
          },
        },
      };

      customerGateway.create(customerParams, (err, params) => {
        assert.notExists(err);
        assert.exists(params);
        assert.equal(params.customer.applePayCard.number, "4111111111111111");
        assert.equal(
          params.customer.applePayCard.cryptogram,
          "test-cryptogram"
        );
        assert.equal(
          params.customer.applePayCard.billingAddress.streetAddress,
          "123 Main St"
        );
        assert.equal(
          params.customer.applePayCard.billingAddress.postalCode,
          "60622"
        );
        assert.equal(params.customer.applePayCard.options.verifyCard, true);
        assert.equal(
          params.customer.applePayCard.options.verificationAmount,
          "1.00"
        );
        done();
      });
    });
  });
});
