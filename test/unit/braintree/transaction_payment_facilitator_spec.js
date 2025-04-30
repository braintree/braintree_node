"use strict";

let TransactionGateway =
  require("../../../lib/braintree/transaction_gateway").TransactionGateway;

describe("TransactionGateway - Payment Facilitator", () =>
  describe("sale", function () {
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

    it("accepts payment_facilitator options", function (done) {
      let transactionGateway = new TransactionGateway(fakeGateway);

      let transactionParams = {
        type: "sale",
        amount: "100.00",
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
      };

      transactionGateway.sale(transactionParams, (err, params) => {
        assert.notExists(err);
        assert.deepEqual(params.transaction.paymentFacilitator, {
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
        });
        done();
      });
    });
  }));
