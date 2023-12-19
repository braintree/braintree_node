"use strict";

let ValidationErrorCodes =
  require("../../../lib/braintree/validation_error_codes").ValidationErrorCodes;
let braintree = specHelper.braintree;
let CreditCardNumbers =
  require("../../../lib/braintree/test_values/credit_card_numbers").CreditCardNumbers;

describe("CreditCardVerificationGateway", function () {
  describe("find", function () {
    it("finds a verification", function (done) {
      let customerParams = {
        creditCard: {
          cardholderName: "John Smith",
          number: "4000111111111115",
          expirationDate: "05/2014",
          options: {
            verifyCard: true,
          },
        },
      };

      specHelper.defaultGateway.customer.create(
        customerParams,
        (err, response) =>
          specHelper.defaultGateway.creditCardVerification.find(
            response.verification.id,
            function (err, verification) {
              assert.isNull(err);
              assert.equal(
                verification.creditCard.cardholderName,
                "John Smith"
              );
              assert.isDefined(verification.graphQLId);

              done();
            }
          )
      );
    });

    it("handles not finding a verification", (done) =>
      specHelper.defaultGateway.creditCardVerification.find(
        "nonexistent_verification",
        function (err) {
          assert.equal(err.type, braintree.errorTypes.notFoundError);

          done();
        }
      ));

    it("handles whitespace ids", (done) =>
      specHelper.defaultGateway.creditCardVerification.find(
        " ",
        function (err) {
          assert.equal(err.type, braintree.errorTypes.notFoundError);

          done();
        }
      ));
  });

  describe("create", function () {
    it("handles verified verifications", function (done) {
      let params = {
        creditCard: {
          cardholderName: "John Smith",
          number: "4111111111111111",
          expirationDate: "05/2014",
        },
      };

      specHelper.defaultGateway.creditCardVerification.create(
        params,
        function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);

          let verification = response.verification;

          assert.equal(verification.processorResponseCode, "1000");
          assert.equal(verification.processorResponseText, "Approved");
          assert.equal(verification.processorResponseType, "approved");

          done();
        }
      );
    });

    it("handles processor declined verifications", function (done) {
      let params = {
        creditCard: {
          cardholderName: "John Smith",
          number: "4000111111111115",
          expirationDate: "05/2014",
        },
      };

      specHelper.defaultGateway.creditCardVerification.create(
        params,
        function (err, response) {
          assert.isFalse(response.success);

          let verification = response.verification;

          assert.equal(verification.processorResponseCode, "2000");
          assert.equal(verification.processorResponseText, "Do Not Honor");
          assert.equal(verification.processorResponseType, "soft_declined");

          done();
        }
      );
    });

    it("handles validation errors", function (done) {
      let params = {
        creditCard: {
          cardholderName: "John Smith",
          number: "4111111111111111",
          expirationDate: "05/2014",
        },
        options: {
          amount: "-10.00",
        },
      };

      specHelper.defaultGateway.creditCardVerification.create(
        params,
        function (err, response) {
          assert.equal(
            response.errors.for("verification").for("options").on("amount")[0]
              .code,
            ValidationErrorCodes.Verification.Options.AmountCannotBeNegative
          );

          done();
        }
      );
    });

    it("supports accountType debit", function (done) {
      let params = {
        creditCard: {
          cardholderName: "John Smith",
          number: CreditCardNumbers.CardTypeIndicators.Hiper,
          expirationDate: "05/2014",
        },
        options: {
          merchantAccountId: "hiper_brl",
          accountType: "debit",
        },
      };

      specHelper.defaultGateway.creditCardVerification.create(
        params,
        function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);

          let verification = response.verification;

          assert.equal(verification.processorResponseText, "Approved");
          assert.equal(verification.creditCard.accountType, "debit");

          done();
        }
      );
    });

    it("supports accountType credit", function (done) {
      let params = {
        creditCard: {
          cardholderName: "John Smith",
          number: CreditCardNumbers.CardTypeIndicators.Hiper,
          expirationDate: "05/2014",
        },
        options: {
          merchantAccountId: "hiper_brl",
          accountType: "credit",
        },
      };

      specHelper.defaultGateway.creditCardVerification.create(
        params,
        function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);

          let verification = response.verification;

          assert.equal(verification.processorResponseText, "Approved");
          assert.equal(verification.creditCard.accountType, "credit");

          done();
        }
      );
    });

    it("handles error AccountTypeIsInvalid", function (done) {
      let params = {
        creditCard: {
          cardholderName: "John Smith",
          number: CreditCardNumbers.CardTypeIndicators.Hiper,
          expirationDate: "05/2014",
        },
        options: {
          merchantAccountId: "hiper_brl",
          accountType: "ach",
        },
      };

      specHelper.defaultGateway.creditCardVerification.create(
        params,
        function (err, response) {
          assert.isNull(err);
          assert.isFalse(response.success);
          assert.equal(
            response.errors
              .for("verification")
              .for("options")
              .on("accountType")[0].code,
            ValidationErrorCodes.Verification.Options.AccountTypeIsInvalid
          );

          done();
        }
      );
    });

    it("handles error AccountTypeNotSupported", function (done) {
      let params = {
        creditCard: {
          cardholderName: "John Smith",
          number: "4000111111111115",
          expirationDate: "05/2014",
        },
        options: {
          accountType: "debit",
        },
      };

      specHelper.defaultGateway.creditCardVerification.create(
        params,
        function (err, response) {
          assert.isNull(err);
          assert.isFalse(response.success);
          assert.equal(
            response.errors
              .for("verification")
              .for("options")
              .on("accountType")[0].code,
            ValidationErrorCodes.Verification.Options.AccountTypeNotSupported
          );

          done();
        }
      );
    });

    it("returns network response code/text", function (done) {
      let params = {
        creditCard: {
          cardholderName: "John Smith",
          number: "4111111111111111",
          expirationDate: "05/2014",
        },
      };

      specHelper.defaultGateway.creditCardVerification.create(
        params,
        function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);

          let verification = response.verification;

          assert.equal(verification.processorResponseCode, "1000");
          assert.equal(verification.processorResponseText, "Approved");
          assert.equal(verification.processorResponseType, "approved");

          assert.equal(verification.networkResponseCode, "XX");
          assert.equal(
            verification.networkResponseText,
            "sample network response text"
          );

          done();
        }
      );
    });

    context("network transaction id", function () {
      it("supports visa", function (done) {
        let params = {
          creditCard: {
            cardholderName: "John Smith",
            number: "4111111111111111",
            expirationDate: "05/2014",
          },
        };

        specHelper.defaultGateway.creditCardVerification.create(
          params,
          function (err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            let verification = response.verification;

            assert.isNotNull(verification.networkTransactionId);
            done();
          }
        );
      });

      it("supports mastercard", function (done) {
        specHelper.defaultGateway.customer.create({}, function () {
          let params = {
            creditCard: {
              number: "5555555555554444",
              expirationDate: "05/12",
            },
          };

          specHelper.defaultGateway.creditCardVerification.create(
            params,
            function (err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);
              let verification = response.verification;

              assert.isNotNull(verification.networkTransactionId);
              done();
            }
          );
        });
      });
    });

    it("creates a verification with billingAddress", function (done) {
      let params = {
        creditCard: {
          billingAddress: {
            company: "FinTech",
            countryCodeAlpha2: "US",
            countryCodeAlpha3: "USA",
            countryCodeNumeric: "840",
            countryName: "United States",
            extendedAddress: "C Suite",
            firstName: "John",
            lastName: "Smith",
            locality: "San Jose",
            postalCode: "95131",
            region: "CA",
            streetAddress: "2211 North First Street",
          },
          cardholderName: "John Smith",
          number: "4111111111111111",
          expirationDate: "05/2029",
        },
      };

      specHelper.defaultGateway.creditCardVerification.create(
        params,
        function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);

          let verification = response.verification;

          assert.equal(verification.processorResponseCode, "1000");
          assert.equal(verification.processorResponseText, "Approved");
          assert.equal(verification.processorResponseType, "approved");

          done();
        }
      );
    });

    it("creates a verification with externalVault", function (done) {
      let params = {
        creditCard: {
          cardholderName: "John Smith",
          number: "4111111111111111",
          expirationDate: "05/2029",
        },
        externalVault: {
          status: "will_vault",
        },
      };

      specHelper.defaultGateway.creditCardVerification.create(
        params,
        function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);

          let verification = response.verification;

          assert.equal(verification.processorResponseCode, "1000");
          assert.equal(verification.processorResponseText, "Approved");
          assert.equal(verification.processorResponseType, "approved");

          done();
        }
      );
    });

    it("supports intendedTransactionSource", function (done) {
      let params = {
        creditCard: {
          cardholderName: "John Smith",
          number: "4111111111111111",
          expirationDate: "05/2029",
        },
        intendedTransactionSource: "installment",
      };

      specHelper.defaultGateway.creditCardVerification.create(
        params,
        function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);

          let verification = response.verification;

          assert.equal(verification.processorResponseCode, "1000");
          assert.equal(verification.processorResponseText, "Approved");
          assert.equal(verification.processorResponseType, "approved");

          done();
        }
      );
    });

    it("creates a verification with paymentMethodNonce", function (done) {
      let nonceParams = {
        creditCard: {
          number: "4111111111111111",
          expirationMonth: "05",
          expirationYear: "2029",
        },
      };

      specHelper.generateNonceForNewPaymentMethod(
        nonceParams,
        null,
        function (nonce) {
          let params = {
            creditCard: {
              cardholderName: "John Smith",
              number: "4111111111111111",
            },
            paymentMethodNonce: nonce,
          };

          specHelper.defaultGateway.creditCardVerification.create(
            params,
            function (err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);

              let verification = response.verification;

              assert.equal(verification.processorResponseCode, "1000");
              assert.equal(verification.processorResponseText, "Approved");
              assert.equal(verification.processorResponseType, "approved");

              done();
            }
          );
        }
      );
    });

    it("creates a verification with riskData", function (done) {
      let params = {
        creditCard: {
          cardholderName: "John Smith",
          number: "4111111111111111",
          expirationDate: "05/2029",
        },
        riskData: {
          customerBrowser: "Edge",
          customerIp: "192.168.0.1",
        },
      };

      specHelper.defaultGateway.creditCardVerification.create(
        params,
        function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);

          let verification = response.verification;

          assert.equal(verification.processorResponseCode, "1000");
          assert.equal(verification.processorResponseText, "Approved");
          assert.equal(verification.processorResponseType, "approved");

          done();
        }
      );
    });

    it("creates a verification with threeDSecureAuthenticationId", function (done) {
      let threeDVerificationParams = {
        number: "4111111111111111",
        expirationMonth: "05",
        expirationYear: "2029",
      };

      specHelper.create3DSVerification(
        specHelper.threeDSecureMerchantAccountId,
        threeDVerificationParams,
        function (threeDSecureAuthId) {
          let params = {
            creditCard: {
              cardholderName: "John Smith",
              number: "4111111111111111",
              expirationDate: "05/2029",
            },
            options: {
              merchantAccountId: specHelper.threeDSecureMerchantAccountId,
            },
            threeDSecureAuthenticationId: threeDSecureAuthId,
          };

          specHelper.defaultGateway.creditCardVerification.create(
            params,
            function (err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);

              let verification = response.verification;

              assert.equal(verification.processorResponseCode, "1000");
              assert.equal(verification.processorResponseText, "Approved");
              assert.equal(verification.processorResponseType, "approved");

              done();
            }
          );
        }
      );
    });

    it("creates a verification with threeDSecurePassThru", function (done) {
      let params = {
        creditCard: {
          cardholderName: "John Smith",
          number: "4111111111111111",
          expirationDate: "05/2029",
        },
        threeDSecurePassThru: {
          eciFlag: "02",
          cavv: "some_cavv",
          xid: "some_xid",
          threeDSecureVersion: "1.0.2",
          authenticationResponse: "Y",
          directoryResponse: "Y",
          cavvAlgorithm: "2",
          dsTransactionId: "some_ds_id",
        },
      };

      specHelper.defaultGateway.creditCardVerification.create(
        params,
        function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);

          let verification = response.verification;

          assert.equal(verification.processorResponseCode, "1000");
          assert.equal(verification.processorResponseText, "Approved");
          assert.equal(verification.processorResponseType, "approved");

          done();
        }
      );
    });
  });
});
