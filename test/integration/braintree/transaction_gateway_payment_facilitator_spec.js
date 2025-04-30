"use strict";

const { assert } = require("chai");

let braintree = specHelper.braintree;
let Environment = require("../../../lib/braintree/environment").Environment;

describe("TransactionGateway", function () {
  describe("sale", function () {
    it("should create a transaction with sub-merchant and payment facilitator", function (done) {
      let transactionParams = {
        type: "sale",
        amount: "100.00",
        merchantAccountId: "card_processor_brl_payfac",
        creditCard: {
          number: "4111111111111111",
          expirationDate: "06/2026",
          cvv: "123",
        },
        descriptor: {
          name: "companynme12*product12",
          phone: "1232344444",
          url: "example.com",
        },
        billing: {
          firstName: "Bob James",
          countryCodeAlpha2: "CA",
          extendedAddress: "",
          locality: "Trois-Rivires",
          region: "QC",
          postalCode: "G8Y 156",
          streetAddress: "2346 Boul Lane",
        },
        paymentFacilitator: {
          paymentFacilitatorId: "98765432109",
          subMerchant: {
            referenceNumber: "123456789012345",
            taxId: "99112233445577",
            legalName: "Fooda",
            address: {
              streetAddress: "10880 Ibitinga",
              locality: "Araraquara",
              region: "SP",
              countryCodeAlpha2: "BR",
              postalCode: "13525000",
              internationalPhone: {
                countryCode: "55",
                nationalNumber: "9876543210",
              },
            },
          },
        },
        options: {
          storeInVaultOnSuccess: true,
        },
      };

      specHelper.defaultGateway.transaction.sale(
        transactionParams,
        function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, "authorized");
          done();
        }
      );
    });

    it("should not create a transaction with sub-merchant and payment facilitator for non-brazil merchants", function (done) {
      let transactionParams = {
        type: "sale",
        amount: "100.00",
        creditCard: {
          number: "4111111111111111",
          expirationDate: "06/2026",
          cvv: "123",
        },
        descriptor: {
          name: "companynme12*product12",
          phone: "1232344444",
          url: "example.com",
        },
        billing: {
          firstName: "Bob James",
          countryCodeAlpha2: "CA",
          extendedAddress: "",
          locality: "Trois-Rivires",
          region: "QC",
          postalCode: "G8Y 156",
          streetAddress: "2346 Boul Lane",
        },
        paymentFacilitator: {
          paymentFacilitatorId: "98765432109",
          subMerchant: {
            referenceNumber: "123456789012345",
            taxId: "99112233445577",
            legalName: "Fooda",
            address: {
              streetAddress: "10880 Ibitinga",
              locality: "Araraquara",
              region: "SP",
              countryCodeAlpha2: "BR",
              postalCode: "13525000",
              internationalPhone: {
                countryCode: "55",
                nationalNumber: "9876543210",
              },
            },
          },
        },
        options: {
          storeInVaultOnSuccess: true,
        },
      };

      let ezpGateway = new braintree.BraintreeGateway({
        merchantId: "pp_credit_ezp_merchant",
        publicKey: "pp_credit_ezp_merchant_public_key",
        privateKey: "pp_credit_ezp_merchant_private_key",
        environment: Environment.Development,
      });

      ezpGateway.transaction.sale(transactionParams, function (err, response) {
        assert.isNull(err);
        assert.isFalse(response.success);

        assert.equal(
          response.errors.for("transaction").validationErrors
            .paymentFacilitator[0].code,
          "97405"
        );
        done();
      });
    });
  });
});
