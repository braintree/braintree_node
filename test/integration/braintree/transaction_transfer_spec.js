"use strict";

const { assert } = require("chai");
let ValidationErrorCodes =
  require("../../../lib/braintree/validation_error_codes").ValidationErrorCodes;

const dateOfBirth = new Date(`2012-04-10`).toISOString().slice(0, 10);

describe("TransactionGateway", function () {
  describe("should create a transaction with AFT merchant and valid value in transfer", function () {
    let transactionParams = {
      type: "sale",
      amount: "100.00",
      merchantAccountId: "aft_first_data_wallet_transfer",
      creditCard: {
        number: "4111111111111111",
        expirationDate: "06/2027",
        cvv: "123",
      },
      transfer: {
        type: "wallet_transfer",
        sender: {
          firstName: "Alice",
          middleName: "A",
          lastName: "Silva",
          accountReferenceNumber: "1000012345",
          address: {
            streetAddress: "1st Main Road",
            locality: "Los Angeles",
            region: "CA",
            countryCodeAlpha2: "US",
          },
          dateOfBirth: dateOfBirth,
        },
        receiver: {
          firstName: "Bob",
          middleName: "A",
          lastName: "Souza",
          address: {
            streetAddress: "2nd Main Road",
            locality: "Los Angeles",
            region: "CA",
            countryCodeAlpha2: "US",
          },
        },
      },
    };

    it("should create a transaction with wallet transfer", function (done) {
      specHelper.defaultGateway.transaction.sale(
        transactionParams,
        function (err, response) {
          assert.isTrue(response.success);
          assert.isTrue(response.transaction.accountFundingTransaction);
          assert.equal(response.transaction.status, "authorized");
          done();
        }
      );
    });
  });

  describe("should create a transaction with SDWO merchant and valid transfer type", function () {
    let transactionParams = {
      type: "sale",
      amount: "100.00",
      merchantAccountId: "card_processor_brl_sdwo",
      creditCard: {
        number: "4111111111111111",
        expirationDate: "06/2026",
        cvv: "123",
      },
      transfer: {
        type: "wallet_transfer",

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

    it("should create a transaction with wallet transfer transfer", function (done) {
      specHelper.defaultGateway.transaction.sale(
        transactionParams,
        function (err, response) {
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, "authorized");
          done();
        }
      );
    });
  });

  describe("should not create a transaction for invalid transfer type", function () {
    let transactionParams = {
      type: "sale",
      amount: "100.00",
      merchantAccountId: "aft_first_data_wallet_transfer",
      creditCard: {
        number: "4111111111111111",
        expirationDate: "06/2026",
        cvv: "123",
      },
      transfer: {
        type: "invalid_transfer",
      },
    };

    it("should not create a transaction with invalid transfer type", function (done) {
      specHelper.defaultGateway.transaction.sale(
        transactionParams,
        function (err, response) {
          assert.isNull(err);
          assert.isFalse(response.success);
          assert.equal(
            response.errors.for("accountFundingTransaction").validationErrors
              .base[0].code,
            ValidationErrorCodes.Transaction.TransferTypesNotApplicable
          );
          done();
        }
      );
    });
  });

  describe("Test without Transfer Type", function () {
    let transactionParams = {
      type: "sale",
      amount: "100.00",
      merchantAccountId: "card_processor_brl_sdwo",
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

      options: {
        storeInVaultOnSuccess: true,
      },
    };

    it("Shouldn't create a transaction for sdwo merchants", function (done) {
      specHelper.defaultGateway.transaction.sale(
        transactionParams,
        function (err, response) {
          assert.isNull(err);
          assert.isFalse(response.success);
          assert.equal(
            response.errors.for("transaction").validationErrors.base[0].code,
            ValidationErrorCodes.Transaction
              .TransactionTransferDetailsAreMandatory
          );
          done();
        }
      );
    });
  });
  describe("Test Transfer Type with null value for sdwo merchants", function () {
    let transactionParams = {
      type: "sale",
      amount: "100.00",
      merchantAccountId: "card_processor_brl_sdwo",
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
      transfer: {
        type: null,
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
      billing: {
        firstName: "Bob James",
        countryCodeAlpha2: "CA",
        extendedAddress: "",
        locality: "Trois-Rivires",
        region: "QC",
        postalCode: "G8Y 156",
        streetAddress: "2346 Boul Lane",
      },

      options: {
        storeInVaultOnSuccess: true,
      },
    };

    it("should create a transaction with null transfer type", function (done) {
      transactionParams.transfer.type = null;
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
  });
});
