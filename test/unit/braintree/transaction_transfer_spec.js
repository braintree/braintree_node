"use strict";

const { assert } = require("chai");

let TransactionGateway =
  require("../../../lib/braintree/transaction_gateway").TransactionGateway;

describe("TransactionGateway - Transfer Block", () => {
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

    let transactionGateway = new TransactionGateway(fakeGateway);

    let transactionParams = {
      type: "sale",
      amount: "100.00",
      transfer: {
        type: "wallet_transfer",
      },
    };

    it("params should contain wallet transfer type in transaction", function (done) {
      transactionGateway.sale(transactionParams, (err, params) => {
        assert.notExists(err);
        assert.deepEqual(params.transaction.transfer, {
          type: "wallet_transfer",
        });
        done();
      });
    });
  });
});

const transferType = [
  "account_to_account",
  "person_to_person",
  "wallet_transfer",
  "boleto_ticket",
];

describe("TransactionGateway - Transfer Block", () =>
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

    let transactionGateway = new TransactionGateway(fakeGateway);

    for (const type of transferType) {
      let transactionParams = {
        type: "sale",
        amount: "100.00",
        transfer: {
          type: type,
          sender: {
            firstName: "Alice",
            lastName: "Silva",
            accountReferenceNumber: "1000012345",
            taxId: "12345678900",
            address: {
              extendedAddress: "2B",
              streetAddress: "Rua das Flores, 100",
              locality: "São Paulo",
              region: "SP",
              countryCodeAlpha2: "BR",
              postalCode: "01001-000",
              internationalPhone: {
                countryCode: "55",
                nationalNumber: "1234567890",
              },
            },
          },
          receiver: {
            firstName: "Bob",
            lastName: "Souza",
            accountReferenceNumber: "2000012345",
            taxId: "98765432100",
            address: {
              extendedAddress: "2B",
              streetAddress: "Avenida Brasil, 200",
              locality: "Rio de Janeiro",
              region: "RJ",
              countryCodeAlpha2: "BR",
              postalCode: "20040-002",
              internationalPhone: {
                countryCode: "55",
                nationalNumber: "9876543210",
              },
            },
          },
        },
      };

      it("should a transaction with type: " + type, function (done) {
        transactionGateway.sale(transactionParams, (err, params) => {
          assert.notExists(err);
          assert.deepEqual(params.transaction.transfer, {
            type: type,
            sender: {
              firstName: "Alice",
              lastName: "Silva",
              accountReferenceNumber: "1000012345",
              taxId: "12345678900",
              address: {
                extendedAddress: "2B",
                streetAddress: "Rua das Flores, 100",
                locality: "São Paulo",
                region: "SP",
                countryCodeAlpha2: "BR",
                postalCode: "01001-000",
                internationalPhone: {
                  countryCode: "55",
                  nationalNumber: "1234567890",
                },
              },
            },
            receiver: {
              firstName: "Bob",
              lastName: "Souza",
              accountReferenceNumber: "2000012345",
              taxId: "98765432100",
              address: {
                extendedAddress: "2B",
                streetAddress: "Avenida Brasil, 200",
                locality: "Rio de Janeiro",
                region: "RJ",
                countryCodeAlpha2: "BR",
                postalCode: "20040-002",
                internationalPhone: {
                  countryCode: "55",
                  nationalNumber: "9876543210",
                },
              },
            },
          });
        });
        done();
      });
    }
  }));
