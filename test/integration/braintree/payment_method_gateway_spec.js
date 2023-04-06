"use strict";
/* eslint-disable new-cap */

let braintree = specHelper.braintree;
let Braintree = require("../../../lib/braintree");
let Config = require("../../../lib/braintree/config").Config;
let Environment = require("../../../lib/braintree/environment").Environment;
let Nonces = require("../../../lib/braintree/test_values/nonces").Nonces;
let ValidationErrorCodes =
  require("../../../lib/braintree/validation_error_codes").ValidationErrorCodes;
let CreditCardNumbers =
  require("../../../lib/braintree/test_values/credit_card_numbers").CreditCardNumbers;

describe("PaymentMethodGateway", function () {
  describe("create", function () {
    let customerId;

    it("works with an unknown payment method nonce", (done) =>
      specHelper.defaultGateway.customer.create(
        { firstName: "John", lastName: "Smith" },
        function (err, response) {
          customerId = response.customer.id;

          let paymentMethodParams = {
            customerId,
            paymentMethodNonce: Nonces.AbstractTransactable,
          };

          specHelper.defaultGateway.paymentMethod.create(
            paymentMethodParams,
            function (err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);
              assert.isNotNull(response.paymentMethod.token);
              assert.isNotNull(response.paymentMethod.customerId);

              done();
            }
          );
        }
      ));

    it("works with a three d secure payment method nonce", (done) =>
      specHelper.defaultGateway.customer.create(
        { firstName: "John", lastName: "Smith" },
        function (err, response) {
          customerId = response.customer.id;

          let paymentMethodParams = {
            customerId,
            paymentMethodNonce: Nonces.ThreeDSecureVisaFullAuthentication,
            options: {
              verifyCard: "true",
            },
          };

          specHelper.defaultGateway.paymentMethod.create(
            paymentMethodParams,
            function (err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);

              let info = response.paymentMethod.verification.threeDSecureInfo;

              assert.isTrue(info.liabilityShifted);
              assert.isTrue(info.liabilityShiftPossible);
              assert.equal(info.enrolled, "Y");
              assert.equal(info.status, "authenticate_successful");
              assert.equal(info.cavv, "cavv_value");
              assert.equal(info.xid, "xid_value");
              assert.equal(info.eciFlag, "05");
              assert.isNotNull(info.threeDSecureVersion);
              assert.isNull(info.dsTransactionId);
              done();
            }
          );
        }
      ));

    it("adds validation error in pass thru when a param is missing", (done) =>
      specHelper.defaultGateway.customer.create(
        { firstName: "John", lastName: "Smith" },
        function (err, response) {
          customerId = response.customer.id;

          let paymentMethodParams = {
            customerId,
            paymentMethodNonce: Nonces.Transactable,
            threeDSecurePassThru: {
              eciFlag: "02",
              cavv: "some_cavv",
              xid: "some_xid",
              threeDSecureVersion: "xx",
              authenticationResponse: "Y",
              directoryResponse: "Y",
              cavvAlgorithm: "2",
              dsTransactionId: "some_ds_transaction_id",
            },
            options: {
              verifyCard: "true",
            },
          };

          specHelper.defaultGateway.paymentMethod.create(
            paymentMethodParams,
            function (err, response) {
              assert.isNull(err);
              assert.isFalse(response.success);

              assert.equal(
                response.errors.deepErrors()[0].code,
                ValidationErrorCodes.Verification.ThreeDSecurePassThru
                  .ThreeDSecureVersionIsInvalid
              );
              done();
            }
          );
        }
      ));

    it("works with a three_d_secure pass thru params in payment method nonce", (done) =>
      specHelper.defaultGateway.customer.create(
        { firstName: "John", lastName: "Smith" },
        function (err, response) {
          customerId = response.customer.id;

          let paymentMethodParams = {
            customerId,
            paymentMethodNonce: Nonces.Transactable,
            threeDSecurePassThru: {
              eciFlag: "02",
              cavv: "some_cavv",
              xid: "some_xid",
              threeDSecureVersion: "1.0.2",
              authenticationResponse: "Y",
              directoryResponse: "Y",
              cavvAlgorithm: "2",
              dsTransactionId: "some_ds_transaction_id",
            },
            options: {
              verifyCard: "true",
            },
          };

          specHelper.defaultGateway.paymentMethod.create(
            paymentMethodParams,
            function (err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);

              done();
            }
          );
        }
      ));

    it("includes risk data when skipAdvancedFraudChecking is false", (done) =>
      specHelper.fraudProtectionEnterpriseGateway.customer.create(
        {},
        function (err, response) {
          customerId = response.customer.id;

          specHelper.fraudProtectionEnterpriseGateway.clientToken.generate(
            {},
            function (err, result) {
              let clientToken = JSON.parse(
                specHelper.decodeClientToken(result.clientToken)
              );
              let authorizationFingerprint =
                clientToken.authorizationFingerprint;

              let params = {
                authorizationFingerprint,
                creditCard: {
                  number: "4111111111111111",
                  expirationDate: "01/2023",
                },
              };

              let myHttp = new specHelper.clientApiHttp(
                new Config(specHelper.fraudProtectionEnterpriseConfig)
              );

              return myHttp.post(
                "/client_api/v1/payment_methods/credit_cards.json",
                params,
                function (statusCode, body) {
                  let nonce = JSON.parse(body).creditCards[0].nonce;

                  let paymentMethodParams = {
                    paymentMethodNonce: nonce,
                    customerId,
                    options: {
                      verifyCard: "true",
                      skipAdvancedFraudChecking: "false",
                    },
                  };

                  specHelper.fraudProtectionEnterpriseGateway.paymentMethod.create(
                    paymentMethodParams,
                    function (err, response) {
                      assert.isNull(err);
                      assert.isTrue(response.success);

                      let riskData = response.creditCard.verification.riskData;

                      assert.isDefined(riskData);
                      done();
                    }
                  );
                }
              );
            }
          );
        }
      ));

    it("does not include risk data when skipAdvancedFraudChecking is true", (done) =>
      specHelper.fraudProtectionEnterpriseGateway.customer.create(
        {},
        function (err, response) {
          customerId = response.customer.id;

          specHelper.fraudProtectionEnterpriseGateway.clientToken.generate(
            {},
            function (err, result) {
              let clientToken = JSON.parse(
                specHelper.decodeClientToken(result.clientToken)
              );
              let authorizationFingerprint =
                clientToken.authorizationFingerprint;

              let params = {
                authorizationFingerprint,
                creditCard: {
                  number: "4111111111111111",
                  expirationDate: "01/2023",
                },
              };

              let myHttp = new specHelper.clientApiHttp(
                new Config(specHelper.fraudProtectionEnterpriseConfig)
              );

              return myHttp.post(
                "/client_api/v1/payment_methods/credit_cards.json",
                params,
                function (statusCode, body) {
                  let nonce = JSON.parse(body).creditCards[0].nonce;

                  let paymentMethodParams = {
                    paymentMethodNonce: nonce,
                    customerId,
                    options: {
                      verifyCard: "true",
                      skipAdvancedFraudChecking: "true",
                    },
                  };

                  specHelper.fraudProtectionEnterpriseGateway.paymentMethod.create(
                    paymentMethodParams,
                    function (err, response) {
                      assert.isNull(err);
                      assert.isTrue(response.success);

                      let riskData = response.creditCard.verification.riskData;

                      assert.isUndefined(riskData);
                      done();
                    }
                  );
                }
              );
            }
          );
        }
      ));

    context("Apple Pay", () =>
      it("vaults an Apple Pay card from the nonce", (done) =>
        specHelper.defaultGateway.customer.create(
          { firstName: "John", lastName: "Appleseed" },
          function (err, response) {
            customerId = response.customer.id;

            let paymentMethodParams = {
              customerId,
              paymentMethodNonce: Nonces.ApplePayAmEx,
            };

            specHelper.defaultGateway.paymentMethod.create(
              paymentMethodParams,
              function (err, response) {
                assert.isNull(err);
                assert.isTrue(response.success);
                assert.isNotNull(response.paymentMethod.token);
                assert.isNotNull(response.paymentMethod.cardType);
                assert.isNotNull(response.paymentMethod.paymentInstrumentName);
                assert.isNotNull(response.paymentMethod.sourceDescription);
                assert.isNotNull(response.paymentMethod.customerId);

                done();
              }
            );
          }
        ))
    );

    context("Android Pay", function () {
      it("vaults an Android Pay proxy card from the nonce", (done) =>
        specHelper.defaultGateway.customer.create(
          { firstName: "John", lastName: "Appleseed" },
          function (err, response) {
            customerId = response.customer.id;

            let paymentMethodParams = {
              customerId,
              paymentMethodNonce: Nonces.AndroidPayDiscover,
            };

            specHelper.defaultGateway.paymentMethod.create(
              paymentMethodParams,
              function (err, response) {
                assert.isNull(err);
                assert.isTrue(response.success);
                assert.isNotNull(response.paymentMethod.token);
                assert.isNotNull(response.paymentMethod.google_transaction_id);
                assert.equal(
                  response.paymentMethod.virtualCardType,
                  specHelper.braintree.CreditCard.CardType.Discover
                );
                assert.equal(response.paymentMethod.last4, "1117");
                assert.isString(response.paymentMethod.expirationMonth);
                assert.isString(response.paymentMethod.expirationYear);
                assert.isTrue(response.paymentMethod.default);
                assert.include(response.paymentMethod.imageUrl, "android_pay");
                assert.isFalse(response.paymentMethod.isNetworkTokenized);
                assert.equal(
                  response.paymentMethod.sourceCardType,
                  specHelper.braintree.CreditCard.CardType.Discover
                );
                assert.equal(response.paymentMethod.sourceCardLast4, "1111");
                assert.equal(
                  response.paymentMethod.sourceDescription,
                  "Discover 1111"
                );
                assert.equal(response.paymentMethod.customerId, customerId);

                done();
              }
            );
          }
        ));

      it("vaults an Android Pay network token from the nonce", (done) =>
        specHelper.defaultGateway.customer.create(
          { firstName: "John", lastName: "Appleseed" },
          function (err, response) {
            customerId = response.customer.id;

            let paymentMethodParams = {
              customerId,
              paymentMethodNonce: Nonces.AndroidPayMasterCard,
            };

            specHelper.defaultGateway.paymentMethod.create(
              paymentMethodParams,
              function (err, response) {
                assert.isNull(err);
                assert.isTrue(response.success);
                assert.isNotNull(response.paymentMethod.token);
                assert.isNotNull(response.paymentMethod.google_transaction_id);
                assert.equal(
                  response.paymentMethod.virtualCardType,
                  specHelper.braintree.CreditCard.CardType.MasterCard
                );
                assert.equal(response.paymentMethod.last4, "4444");
                assert.isString(response.paymentMethod.expirationMonth);
                assert.isString(response.paymentMethod.expirationYear);
                assert.isTrue(response.paymentMethod.default);
                assert.include(response.paymentMethod.imageUrl, "android_pay");
                assert.isTrue(response.paymentMethod.isNetworkTokenized);
                assert.equal(
                  response.paymentMethod.sourceCardType,
                  specHelper.braintree.CreditCard.CardType.MasterCard
                );
                assert.equal(response.paymentMethod.sourceCardLast4, "4444");
                assert.equal(
                  response.paymentMethod.sourceDescription,
                  "MasterCard 4444"
                );
                assert.equal(response.paymentMethod.customerId, customerId);

                done();
              }
            );
          }
        ));
    });

    context("Venmo Account", () =>
      it("vaults an Venmo Account from the nonce", (done) =>
        specHelper.defaultGateway.customer.create(
          { firstName: "John", lastName: "Appleseed" },
          function (err, response) {
            customerId = response.customer.id;

            let paymentMethodParams = {
              customerId,
              paymentMethodNonce: Nonces.VenmoAccount,
            };

            specHelper.defaultGateway.paymentMethod.create(
              paymentMethodParams,
              function (err, response) {
                assert.isNull(err);
                assert.isTrue(response.success);
                assert.isNotNull(response.paymentMethod.token);
                assert.isTrue(response.paymentMethod.default);
                assert.include(response.paymentMethod.imageUrl, ".png");
                assert.equal(response.paymentMethod.customerId, customerId);
                assert.equal(response.paymentMethod.username, "venmojoe");
                assert.equal(
                  response.paymentMethod.venmoUserId,
                  "1234567891234567891"
                );

                done();
              }
            );
          }
        ))
    );

    context("with a credit card payment method nonce", function () {
      it("creates a credit card from the nonce", (done) =>
        specHelper.defaultGateway.customer.create(
          { firstName: "John", lastName: "Smith" },
          function (err, response) {
            customerId = response.customer.id;

            specHelper.defaultGateway.clientToken.generate(
              {},
              function (err, result) {
                let clientToken = JSON.parse(
                  specHelper.decodeClientToken(result.clientToken)
                );
                let authorizationFingerprint =
                  clientToken.authorizationFingerprint;

                let params = {
                  authorizationFingerprint,
                  creditCard: {
                    number: "4111111111111111",
                    expirationDate: "01/2020",
                  },
                };

                let myHttp = new specHelper.clientApiHttp(
                  new Config(specHelper.defaultConfig)
                );

                return myHttp.post(
                  "/client_api/v1/payment_methods/credit_cards.json",
                  params,
                  function (statusCode, body) {
                    let nonce = JSON.parse(body).creditCards[0].nonce;

                    let creditCardParams = {
                      customerId,
                      paymentMethodNonce: nonce,
                    };

                    specHelper.defaultGateway.paymentMethod.create(
                      creditCardParams,
                      function (err, response) {
                        assert.isNull(err);
                        assert.isTrue(response.success);
                        assert.equal(
                          response.paymentMethod.maskedNumber,
                          "411111******1111"
                        );
                        assert.equal(
                          response.paymentMethod.customerId,
                          customerId
                        );

                        done();
                      }
                    );
                  }
                );
              }
            );
          }
        ));

      it("accepts a custom verification amount", (done) =>
        specHelper.defaultGateway.customer.create({}, function (err, response) {
          customerId = response.customer.id;

          specHelper.defaultGateway.clientToken.generate(
            {},
            function (err, result) {
              let clientToken = JSON.parse(
                specHelper.decodeClientToken(result.clientToken)
              );
              let authorizationFingerprint =
                clientToken.authorizationFingerprint;

              let params = {
                authorizationFingerprint,
                creditCard: {
                  number: "4000111111111115",
                  expirationMonth: "11",
                  expirationYear: "2099",
                },
              };

              let myHttp = new specHelper.clientApiHttp(
                new Config(specHelper.defaultConfig)
              );

              return myHttp.post(
                "/client_api/v1/payment_methods/credit_cards.json",
                params,
                function (statusCode, body) {
                  let nonce = JSON.parse(body).creditCards[0].nonce;

                  let creditCardParams = {
                    paymentMethodNonce: nonce,
                    customerId,
                    options: {
                      verifyCard: "true",
                      verificationAmount: "1.03",
                    },
                  };

                  specHelper.defaultGateway.paymentMethod.create(
                    creditCardParams,
                    function (err, response) {
                      assert.isNull(err);
                      assert.isFalse(response.success);
                      assert.equal(
                        response.verification.status,
                        "processor_declined"
                      );

                      done();
                    }
                  );
                }
              );
            }
          );
        }));

      it("respects verify_card and verification_merchant_account_id when included outside of the nonce", (done) =>
        specHelper.defaultGateway.customer.create({}, function (err, response) {
          customerId = response.customer.id;

          specHelper.defaultGateway.clientToken.generate(
            {},
            function (err, result) {
              let clientToken = JSON.parse(
                specHelper.decodeClientToken(result.clientToken)
              );
              let authorizationFingerprint =
                clientToken.authorizationFingerprint;

              let params = {
                authorizationFingerprint,
                creditCard: {
                  number: "4000111111111115",
                  expirationMonth: "11",
                  expirationYear: "2099",
                },
              };

              let myHttp = new specHelper.clientApiHttp(
                new Config(specHelper.defaultConfig)
              );

              return myHttp.post(
                "/client_api/v1/payment_methods/credit_cards.json",
                params,
                function (statusCode, body) {
                  let nonce = JSON.parse(body).creditCards[0].nonce;

                  let creditCardParams = {
                    paymentMethodNonce: nonce,
                    customerId,
                    options: {
                      verifyCard: "true",
                      verificationMerchantAccountId:
                        specHelper.nonDefaultMerchantAccountId,
                    },
                  };

                  specHelper.defaultGateway.paymentMethod.create(
                    creditCardParams,
                    function (err, response) {
                      assert.isNull(err);
                      assert.isFalse(response.success);

                      assert.equal(
                        response.verification.status,
                        "processor_declined"
                      );
                      assert.equal(
                        response.verification.processorResponseCode,
                        "2000"
                      );
                      assert.equal(
                        response.verification.processorResponseText,
                        "Do Not Honor"
                      );
                      assert.equal(
                        response.verification.merchantAccountId,
                        specHelper.nonDefaultMerchantAccountId
                      );

                      done();
                    }
                  );
                }
              );
            }
          );
        }));

      it("supports accountType credit", (done) =>
        specHelper.defaultGateway.customer.create(
          { firstName: "John", lastName: "Smith" },
          function (err, response) {
            customerId = response.customer.id;

            specHelper.defaultGateway.clientToken.generate(
              {},
              function (err, result) {
                let clientToken = JSON.parse(
                  specHelper.decodeClientToken(result.clientToken)
                );
                let authorizationFingerprint =
                  clientToken.authorizationFingerprint;

                let params = {
                  authorizationFingerprint,
                  creditCard: {
                    number: CreditCardNumbers.CardTypeIndicators.Hiper,
                    expirationDate: "01/2020",
                  },
                };

                let myHttp = new specHelper.clientApiHttp(
                  new Config(specHelper.defaultConfig)
                );

                return myHttp.post(
                  "/client_api/v1/payment_methods/credit_cards.json",
                  params,
                  function (statusCode, body) {
                    let nonce = JSON.parse(body).creditCards[0].nonce;

                    let creditCardParams = {
                      customerId,
                      paymentMethodNonce: nonce,
                      options: {
                        verifyCard: "true",
                        verificationMerchantAccountId: "hiper_brl",
                        verificationAccountType: "credit",
                      },
                    };

                    specHelper.defaultGateway.paymentMethod.create(
                      creditCardParams,
                      function (err, response) {
                        assert.isNull(err);
                        assert.isTrue(response.success);
                        assert.equal(
                          response.paymentMethod.verification.creditCard
                            .accountType,
                          "credit"
                        );

                        done();
                      }
                    );
                  }
                );
              }
            );
          }
        ));

      it("supports accountType debit", (done) =>
        specHelper.defaultGateway.customer.create(
          { firstName: "John", lastName: "Smith" },
          function (err, response) {
            customerId = response.customer.id;

            specHelper.defaultGateway.clientToken.generate(
              {},
              function (err, result) {
                let clientToken = JSON.parse(
                  specHelper.decodeClientToken(result.clientToken)
                );
                let authorizationFingerprint =
                  clientToken.authorizationFingerprint;

                let params = {
                  authorizationFingerprint,
                  creditCard: {
                    number: CreditCardNumbers.CardTypeIndicators.Hiper,
                    expirationDate: "01/2020",
                  },
                };

                let myHttp = new specHelper.clientApiHttp(
                  new Config(specHelper.defaultConfig)
                );

                return myHttp.post(
                  "/client_api/v1/payment_methods/credit_cards.json",
                  params,
                  function (statusCode, body) {
                    let nonce = JSON.parse(body).creditCards[0].nonce;

                    let creditCardParams = {
                      customerId,
                      paymentMethodNonce: nonce,
                      options: {
                        verifyCard: "true",
                        verificationMerchantAccountId: "hiper_brl",
                        verificationAccountType: "debit",
                      },
                    };

                    specHelper.defaultGateway.paymentMethod.create(
                      creditCardParams,
                      function (err, response) {
                        assert.isNull(err);
                        assert.isTrue(response.success);
                        assert.equal(
                          response.paymentMethod.verification.creditCard
                            .accountType,
                          "debit"
                        );

                        done();
                      }
                    );
                  }
                );
              }
            );
          }
        ));

      it("respects failOnDuplicatePaymentMethod when included outside of the nonce", (done) =>
        specHelper.defaultGateway.customer.create({}, function (err, response) {
          customerId = response.customer.id;

          let creditCardParams = {
            customerId,
            number: "4111111111111111",
            expirationDate: "05/2012",
          };

          specHelper.defaultGateway.creditCard.create(
            creditCardParams,
            function (err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);
            }
          );

          specHelper.defaultGateway.clientToken.generate(
            {},
            function (err, result) {
              let clientToken = JSON.parse(
                specHelper.decodeClientToken(result.clientToken)
              );
              let authorizationFingerprint =
                clientToken.authorizationFingerprint;

              let params = {
                authorizationFingerprint,
                creditCard: {
                  number: "4111111111111111",
                  expirationDate: "05/2012",
                },
              };

              let myHttp = new specHelper.clientApiHttp(
                new Config(specHelper.defaultConfig)
              );

              return myHttp.post(
                "/client_api/v1/payment_methods/credit_cards.json",
                params,
                function (statusCode, body) {
                  let nonce = JSON.parse(body).creditCards[0].nonce;

                  creditCardParams = {
                    customerId,
                    paymentMethodNonce: nonce,
                    options: {
                      failOnDuplicatePaymentMethod: "true",
                    },
                  };

                  specHelper.defaultGateway.paymentMethod.create(
                    creditCardParams,
                    function (err, response) {
                      assert.isNull(err);
                      assert.isFalse(response.success);
                      assert.equal(
                        response.errors.deepErrors()[0].code,
                        "81724"
                      );

                      done();
                    }
                  );
                }
              );
            }
          );
        }));

      it("allows passing the billing address outside of the nonce", (done) =>
        specHelper.defaultGateway.customer.create({}, function (err, response) {
          customerId = response.customer.id;

          specHelper.defaultGateway.clientToken.generate(
            {},
            function (err, result) {
              let clientToken = JSON.parse(
                specHelper.decodeClientToken(result.clientToken)
              );
              let authorizationFingerprint =
                clientToken.authorizationFingerprint;

              let params = {
                authorizationFingerprint,
                creditCard: {
                  number: "4111111111111111",
                  expirationMonth: "12",
                  expirationYear: "2020",
                  options: {
                    validate: "false",
                  },
                },
              };

              let myHttp = new specHelper.clientApiHttp(
                new Config(specHelper.defaultConfig)
              );

              return myHttp.post(
                "/client_api/v1/payment_methods/credit_cards.json",
                params,
                function (statusCode, body) {
                  let nonce = JSON.parse(body).creditCards[0].nonce;

                  let creditCardParams = {
                    paymentMethodNonce: nonce,
                    customerId,
                    billingAddress: {
                      streetAddress: "123 Abc Way",
                    },
                  };

                  specHelper.defaultGateway.paymentMethod.create(
                    creditCardParams,
                    function (err, response) {
                      assert.isNull(err);
                      assert.isTrue(response.success);

                      assert.isTrue(
                        response.paymentMethod.constructor.name === "CreditCard"
                      );
                      let token = response.paymentMethod.token;

                      specHelper.defaultGateway.paymentMethod.find(
                        token,
                        function (err, creditCard) {
                          assert.isNull(err);
                          assert.isTrue(creditCard !== null);
                          assert.equal(
                            creditCard.billingAddress.streetAddress,
                            "123 Abc Way"
                          );

                          done();
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }));

      it("overrides the billing address in the nonce", (done) =>
        specHelper.defaultGateway.customer.create({}, function (err, response) {
          customerId = response.customer.id;

          specHelper.defaultGateway.clientToken.generate(
            {},
            function (err, result) {
              let clientToken = JSON.parse(
                specHelper.decodeClientToken(result.clientToken)
              );
              let authorizationFingerprint =
                clientToken.authorizationFingerprint;

              let params = {
                authorizationFingerprint,
                creditCard: {
                  number: "4111111111111111",
                  expirationMonth: "12",
                  expirationYear: "2020",
                  options: {
                    validate: "false",
                  },
                  billingAddress: {
                    streetAddress: "456 Xyz Way",
                  },
                },
              };

              let myHttp = new specHelper.clientApiHttp(
                new Config(specHelper.defaultConfig)
              );

              return myHttp.post(
                "/client_api/v1/payment_methods/credit_cards.json",
                params,
                function (statusCode, body) {
                  let nonce = JSON.parse(body).creditCards[0].nonce;

                  let creditCardParams = {
                    paymentMethodNonce: nonce,
                    customerId,
                    billingAddress: {
                      streetAddress: "123 Abc Way",
                    },
                  };

                  specHelper.defaultGateway.paymentMethod.create(
                    creditCardParams,
                    function (err, response) {
                      assert.isNull(err);
                      assert.isTrue(response.success);

                      assert.isTrue(
                        response.paymentMethod.constructor.name === "CreditCard"
                      );
                      let token = response.paymentMethod.token;

                      specHelper.defaultGateway.paymentMethod.find(
                        token,
                        function (err, creditCard) {
                          assert.isNull(err);
                          assert.isTrue(creditCard !== null);
                          assert.equal(
                            creditCard.billingAddress.streetAddress,
                            "123 Abc Way"
                          );

                          done();
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }));

      it("does not override the billing address for a vaulted credit card", (done) =>
        specHelper.defaultGateway.customer.create({}, function (err, response) {
          customerId = response.customer.id;

          specHelper.defaultGateway.clientToken.generate(
            { customerId },
            function (err, result) {
              let clientToken = JSON.parse(
                specHelper.decodeClientToken(result.clientToken)
              );
              let authorizationFingerprint =
                clientToken.authorizationFingerprint;

              let params = {
                authorizationFingerprint,
                creditCard: {
                  number: "4111111111111111",
                  expirationMonth: "12",
                  expirationYear: "2020",
                  billingAddress: {
                    streetAddress: "456 Xyz Way",
                  },
                },
              };

              let myHttp = new specHelper.clientApiHttp(
                new Config(specHelper.defaultConfig)
              );

              return myHttp.post(
                "/client_api/v1/payment_methods/credit_cards.json",
                params,
                function (statusCode, body) {
                  assert.equal(statusCode, "201");
                  let nonce = JSON.parse(body).creditCards[0].nonce;

                  let creditCardParams = {
                    paymentMethodNonce: nonce,
                    customerId,
                    billingAddress: {
                      streetAddress: "123 Abc Way",
                    },
                  };

                  specHelper.defaultGateway.paymentMethod.create(
                    creditCardParams,
                    function (err, response) {
                      assert.isNull(err);
                      assert.isTrue(response.success);

                      assert.isTrue(
                        response.paymentMethod.constructor.name === "CreditCard"
                      );
                      let token = response.paymentMethod.token;

                      specHelper.defaultGateway.paymentMethod.find(
                        token,
                        function (err, creditCard) {
                          assert.isNull(err);
                          assert.isTrue(creditCard !== null);
                          assert.equal(
                            creditCard.billingAddress.streetAddress,
                            "456 Xyz Way"
                          );

                          done();
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }));

      it("allows passing a billing address id outside of the nonce", (done) =>
        specHelper.defaultGateway.customer.create({}, function (err, response) {
          customerId = response.customer.id;

          specHelper.defaultGateway.clientToken.generate(
            {},
            function (err, result) {
              let clientToken = JSON.parse(
                specHelper.decodeClientToken(result.clientToken)
              );
              let authorizationFingerprint =
                clientToken.authorizationFingerprint;

              let params = {
                authorizationFingerprint,
                creditCard: {
                  number: "4111111111111111",
                  expirationMonth: "12",
                  expirationYear: "2020",
                  options: {
                    validate: "false",
                  },
                },
              };

              let myHttp = new specHelper.clientApiHttp(
                new Config(specHelper.defaultConfig)
              );

              return myHttp.post(
                "/client_api/v1/payment_methods/credit_cards.json",
                params,
                function (statusCode, body) {
                  let nonce = JSON.parse(body).creditCards[0].nonce;

                  let addressParams = {
                    customerId,
                    firstName: "Bobby",
                    lastName: "Tables",
                  };

                  specHelper.defaultGateway.address.create(
                    addressParams,
                    function (err, response) {
                      assert.isNull(err);
                      assert.isTrue(response.success);

                      let creditCardParams = {
                        paymentMethodNonce: nonce,
                        customerId,
                        billingAddressId: response.address.id,
                      };

                      specHelper.defaultGateway.paymentMethod.create(
                        creditCardParams,
                        function (err, response) {
                          assert.isNull(err);
                          assert.isTrue(response.success);

                          assert.isTrue(
                            response.paymentMethod.constructor.name ===
                              "CreditCard"
                          );
                          let token = response.paymentMethod.token;

                          specHelper.defaultGateway.paymentMethod.find(
                            token,
                            function (err, creditCard) {
                              assert.isNull(err);
                              assert.isTrue(creditCard !== null);
                              assert.equal(
                                creditCard.billingAddress.firstName,
                                "Bobby"
                              );
                              assert.equal(
                                creditCard.billingAddress.lastName,
                                "Tables"
                              );

                              done();
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }));
    });

    context("with a paypal account payment method nonce", function () {
      before((done) =>
        specHelper.defaultGateway.customer.create(
          { firstName: "John", lastName: "Smith" },
          function (err, response) {
            customerId = response.customer.id;
            done();
          }
        )
      );

      it("does not return an error if credit card options are present for a paypal nonce", (done) =>
        specHelper.defaultGateway.customer.create({}, function (err, response) {
          customerId = response.customer.id;

          specHelper.defaultGateway.clientToken.generate(
            {},
            function (err, result) {
              let clientToken = JSON.parse(
                specHelper.decodeClientToken(result.clientToken)
              );
              let authorizationFingerprint =
                clientToken.authorizationFingerprint;

              let params = {
                authorizationFingerprint,
                paypalAccount: {
                  consentCode: "consent-code",
                },
              };

              let myHttp = new specHelper.clientApiHttp(
                new Config(specHelper.defaultConfig)
              );

              return myHttp.post(
                "/client_api/v1/payment_methods/paypal_accounts.json",
                params,
                function (statusCode, body) {
                  let nonce = JSON.parse(body).paypalAccounts[0].nonce;

                  let paypalAccountParams = {
                    paymentMethodNonce: nonce,
                    customerId,
                    options: {
                      verifyCard: "true",
                      failOnDuplicatePaymentMethod: "true",
                      verificationMerchantAccountId:
                        "notARealMerchantAccountId",
                    },
                  };

                  specHelper.defaultGateway.paymentMethod.create(
                    paypalAccountParams,
                    function (err, response) {
                      assert.isNull(err);
                      assert.isTrue(response.success);

                      assert.equal(
                        response.paymentMethod.constructor.name,
                        "PayPalAccount"
                      );
                      assert.isTrue(response.paymentMethod.imageUrl !== null);
                      let token = response.paymentMethod.token;

                      specHelper.defaultGateway.paymentMethod.find(
                        token,
                        function (err, paypalAccount) {
                          assert.isNull(err);
                          assert.isTrue(paypalAccount !== null);
                          assert.equal(paypalAccount.customerId, customerId);

                          done();
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }));

      it("ignores passed billing address params", (done) =>
        specHelper.defaultGateway.customer.create({}, function (err, response) {
          customerId = response.customer.id;

          specHelper.defaultGateway.clientToken.generate(
            {},
            function (err, result) {
              let clientToken = JSON.parse(
                specHelper.decodeClientToken(result.clientToken)
              );
              let authorizationFingerprint =
                clientToken.authorizationFingerprint;

              let params = {
                authorizationFingerprint,
                paypalAccount: {
                  consentCode: "PAYPAL_CONSENT_CODE",
                },
              };

              let myHttp = new specHelper.clientApiHttp(
                new Config(specHelper.defaultConfig)
              );

              return myHttp.post(
                "/client_api/v1/payment_methods/paypal_accounts.json",
                params,
                function (statusCode, body) {
                  let nonce = JSON.parse(body).paypalAccounts[0].nonce;

                  let paypalAccountParams = {
                    paymentMethodNonce: nonce,
                    customerId,
                    billingAddress: {
                      streetAddress: "123 Abc Way",
                    },
                  };

                  specHelper.defaultGateway.paymentMethod.create(
                    paypalAccountParams,
                    function (err, response) {
                      assert.isNull(err);
                      assert.isTrue(response.success);

                      assert.equal(
                        response.paymentMethod.constructor.name,
                        "PayPalAccount"
                      );
                      assert.isTrue(response.paymentMethod.imageUrl !== null);
                      let token = response.paymentMethod.token;

                      specHelper.defaultGateway.paymentMethod.find(
                        token,
                        function (err, paypalAccount) {
                          assert.isNull(err);
                          assert.isTrue(paypalAccount !== null);

                          done();
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }));

      it("ignores passed billing address id", (done) =>
        specHelper.defaultGateway.customer.create({}, function (err, response) {
          customerId = response.customer.id;

          specHelper.defaultGateway.clientToken.generate(
            {},
            function (err, result) {
              let clientToken = JSON.parse(
                specHelper.decodeClientToken(result.clientToken)
              );
              let authorizationFingerprint =
                clientToken.authorizationFingerprint;

              let params = {
                authorizationFingerprint,
                paypalAccount: {
                  consentCode: "PAYPAL_CONSENT_CODE",
                },
              };

              let myHttp = new specHelper.clientApiHttp(
                new Config(specHelper.defaultConfig)
              );

              return myHttp.post(
                "/client_api/v1/payment_methods/paypal_accounts.json",
                params,
                function (statusCode, body) {
                  let nonce = JSON.parse(body).paypalAccounts[0].nonce;

                  let paypalAccountParams = {
                    paymentMethodNonce: nonce,
                    customerId,
                    billingAddressId: "address_id",
                  };

                  specHelper.defaultGateway.paymentMethod.create(
                    paypalAccountParams,
                    function (err, response) {
                      assert.isNull(err);
                      assert.isTrue(response.success);

                      assert.equal(
                        response.paymentMethod.constructor.name,
                        "PayPalAccount"
                      );
                      assert.isTrue(response.paymentMethod.imageUrl !== null);
                      let token = response.paymentMethod.token;

                      specHelper.defaultGateway.paymentMethod.find(
                        token,
                        function (err, paypalAccount) {
                          assert.isNull(err);
                          assert.isTrue(paypalAccount !== null);

                          done();
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }));
    });

    it("creates a paypal account from a payment method nonce", (done) =>
      specHelper.defaultGateway.customer.create({}, function (err, response) {
        customerId = response.customer.id;
        specHelper.defaultGateway.clientToken.generate(
          {},
          function (err, result) {
            let clientToken = JSON.parse(
              specHelper.decodeClientToken(result.clientToken)
            );
            let authorizationFingerprint = clientToken.authorizationFingerprint;

            let params = {
              authorizationFingerprint,
              paypalAccount: {
                consentCode: "PAYPAL_CONSENT_CODE",
              },
            };

            let myHttp = new specHelper.clientApiHttp(
              new Config(specHelper.defaultConfig)
            );

            return myHttp.post(
              "/client_api/v1/payment_methods/paypal_accounts.json",
              params,
              function (statusCode, body) {
                let nonce = JSON.parse(body).paypalAccounts[0].nonce;
                let paypalAccountParams = {
                  customerId,
                  paymentMethodNonce: nonce,
                };

                specHelper.defaultGateway.paymentMethod.create(
                  paypalAccountParams,
                  function (err, response) {
                    assert.isNull(err);
                    assert.isTrue(response.success);
                    assert.isString(response.paymentMethod.email);
                    assert.isString(response.paymentMethod.imageUrl);
                    assert.isString(response.paymentMethod.customerId);
                    done();
                  }
                );
              }
            );
          }
        );
      }));

    it("creates a paypal account from a payment method nonce with intent=order", (done) =>
      specHelper.defaultGateway.customer.create({}, function (err, response) {
        customerId = response.customer.id;
        specHelper.defaultGateway.clientToken.generate(
          {},
          function (err, result) {
            let clientToken = JSON.parse(
              specHelper.decodeClientToken(result.clientToken)
            );
            let authorizationFingerprint = clientToken.authorizationFingerprint;

            let params = {
              authorizationFingerprint,
              paypalAccount: {
                intent: "order",
                paymentToken: "paypal-payment-token",
                payerId: "paypal-payer-id",
              },
            };

            let myHttp = new specHelper.clientApiHttp(
              new Config(specHelper.defaultConfig)
            );

            return myHttp.post(
              "/client_api/v1/payment_methods/paypal_accounts.json",
              params,
              function (statusCode, body) {
                let nonce = JSON.parse(body).paypalAccounts[0].nonce;
                let paypalAccountParams = {
                  customerId,
                  paymentMethodNonce: nonce,
                };

                specHelper.defaultGateway.paymentMethod.create(
                  paypalAccountParams,
                  function (err, response) {
                    assert.isNull(err);
                    assert.isTrue(response.success);
                    assert.isString(response.paymentMethod.email);
                    assert.isString(response.paymentMethod.imageUrl);
                    assert.isString(response.paymentMethod.customerId);
                    done();
                  }
                );
              }
            );
          }
        );
      }));

    it("creates a paypal account from a payment method nonce with intent=order and paypal options", (done) =>
      specHelper.defaultGateway.customer.create({}, function (err, response) {
        customerId = response.customer.id;
        specHelper.defaultGateway.clientToken.generate(
          {},
          function (err, result) {
            let clientToken = JSON.parse(
              specHelper.decodeClientToken(result.clientToken)
            );
            let authorizationFingerprint = clientToken.authorizationFingerprint;

            let params = {
              authorizationFingerprint,
              paypalAccount: {
                intent: "order",
                paymentToken: "paypal-payment-token",
                payerId: "paypal-payer-id",
              },
            };

            let myHttp = new specHelper.clientApiHttp(
              new Config(specHelper.defaultConfig)
            );

            return myHttp.post(
              "/client_api/v1/payment_methods/paypal_accounts.json",
              params,
              function (statusCode, body) {
                let nonce = JSON.parse(body).paypalAccounts[0].nonce;
                let paypalAccountParams = {
                  customerId,
                  paymentMethodNonce: nonce,
                  options: {
                    paypal: {
                      payeeEmail: "payee@example.com",
                      orderId: "merchant-order-id",
                      customField: "custom merchant field",
                      description: "merchant description",
                      amount: "1.23",
                      shipping: {
                        company: "Braintree",
                        countryName: "United States of America",
                        extendedAddress: "Apt B",
                        firstName: "first",
                        lastName: "last",
                        locality: "Chicago",
                        postalCode: "60646",
                        region: "IL",
                        streetAddress: "123 Fake St",
                      },
                    },
                  },
                };

                specHelper.defaultGateway.paymentMethod.create(
                  paypalAccountParams,
                  function (err, response) {
                    assert.isNull(err);
                    assert.isTrue(response.success);
                    assert.isString(response.paymentMethod.email);
                    assert.isString(response.paymentMethod.imageUrl);
                    assert.isString(response.paymentMethod.customerId);
                    done();
                  }
                );
              }
            );
          }
        );
      }));

    it("creates a paypal account from a paypal refresh token", (done) =>
      specHelper.defaultGateway.customer.create({}, function (err, response) {
        customerId = response.customer.id;
        let paypalAccountParams = {
          customerId,
          paypalRefreshToken: "PAYPAL_REFRESH_TOKEN",
        };

        specHelper.defaultGateway.paymentMethod.create(
          paypalAccountParams,
          function (err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.isString(response.paymentMethod.customerId);
            assert.isString(response.paymentMethod.billingAgreementId);
            done();
          }
        );
      }));

    it("can create a payment method and set the token and default", (done) =>
      specHelper.defaultGateway.customer.create({}, function (err, response) {
        customerId = response.customer.id;
        let creditCardParams = {
          customerId,
          number: "5105105105105100",
          expirationDate: "05/2012",
        };

        specHelper.defaultGateway.creditCard.create(creditCardParams, () =>
          specHelper.defaultGateway.clientToken.generate(
            {},
            function (err, result) {
              let clientToken = JSON.parse(
                specHelper.decodeClientToken(result.clientToken)
              );
              let authorizationFingerprint =
                clientToken.authorizationFingerprint;

              let params = {
                authorizationFingerprint,
                creditCard: {
                  number: "4111111111111111",
                  expirationDate: "01/2020",
                },
              };

              let myHttp = new specHelper.clientApiHttp(
                new Config(specHelper.defaultConfig)
              );

              return myHttp.post(
                "/client_api/v1/payment_methods/credit_cards.json",
                params,
                function (statusCode, body) {
                  let nonce = JSON.parse(body).creditCards[0].nonce;

                  let paymentMethodToken = specHelper.randomId();

                  creditCardParams = {
                    customerId,
                    paymentMethodNonce: nonce,
                    token: paymentMethodToken,
                    options: {
                      makeDefault: true,
                    },
                  };

                  specHelper.defaultGateway.paymentMethod.create(
                    creditCardParams,
                    function (err, response) {
                      assert.isNull(err);
                      assert.isTrue(response.success);
                      assert.isTrue(response.paymentMethod.default);
                      assert.equal(
                        response.paymentMethod.token,
                        paymentMethodToken
                      );
                      assert.equal(
                        response.paymentMethod.customerId,
                        customerId
                      );

                      done();
                    }
                  );
                }
              );
            }
          )
        );
      }));

    it("returns an error when trying to create a paypal account only authorized for one-time use", (done) =>
      specHelper.defaultGateway.customer.create({}, function (err, response) {
        customerId = response.customer.id;

        specHelper.defaultGateway.clientToken.generate(
          {},
          function (err, result) {
            let clientToken = JSON.parse(
              specHelper.decodeClientToken(result.clientToken)
            );
            let authorizationFingerprint = clientToken.authorizationFingerprint;

            let params = {
              authorizationFingerprint,
              paypalAccount: {
                accessToken: "PAYPAL_ACCESS_TOKEN",
              },
            };

            let myHttp = new specHelper.clientApiHttp(
              new Config(specHelper.defaultConfig)
            );

            return myHttp.post(
              "/client_api/v1/payment_methods/paypal_accounts.json",
              params,
              function (statusCode, body) {
                let nonce = JSON.parse(body).paypalAccounts[0].nonce;
                let paypalAccountParams = {
                  customerId,
                  paymentMethodNonce: nonce,
                };

                specHelper.defaultGateway.paymentMethod.create(
                  paypalAccountParams,
                  function (err, response) {
                    assert.isNull(err);
                    assert.isFalse(response.success);
                    const codes = response.errors
                      .for("paypalAccount")
                      .on("base")
                      .map((error) => error.code);

                    assert.include(codes, "82902");

                    done();
                  }
                );
              }
            );
          }
        );
      }));

    it("handles errors", (done) =>
      specHelper.defaultGateway.customer.create({}, function (err, response) {
        customerId = response.customer.id;

        specHelper.defaultGateway.clientToken.generate(
          {},
          function (err, result) {
            let clientToken = JSON.parse(
              specHelper.decodeClientToken(result.clientToken)
            );
            let authorizationFingerprint = clientToken.authorizationFingerprint;

            let params = {
              authorizationFingerprint,
              paypalAccount: {},
            };

            let myHttp = new specHelper.clientApiHttp(
              new Config(specHelper.defaultConfig)
            );

            return myHttp.post(
              "/client_api/v1/payment_methods/paypal_accounts.json",
              params,
              function (statusCode, body) {
                let nonce = JSON.parse(body).paypalAccounts[0].nonce;
                let paypalAccountParams = {
                  customerId,
                  paymentMethodNonce: nonce,
                };

                specHelper.defaultGateway.paymentMethod.create(
                  paypalAccountParams,
                  function (err, response) {
                    assert.isFalse(response.success);
                    const codes = response.errors
                      .for("paypalAccount")
                      .on("base")
                      .map((error) => error.code);

                    assert.include(codes, "82902");

                    done();
                  }
                );
              }
            );
          }
        );
      }));

    context("with a fake apple pay nonce", function () {
      before((done) =>
        specHelper.defaultGateway.customer.create(
          { firstName: "John", lastName: "Smith" },
          function (err, response) {
            customerId = response.customer.id;
            done();
          }
        )
      );

      it("creates a payment method", (done) =>
        specHelper.defaultGateway.customer.create({}, function (err, response) {
          customerId = response.customer.id;

          let applePayCardParams = {
            paymentMethodNonce: Nonces.ApplePayMasterCard,
            customerId,
          };

          specHelper.defaultGateway.paymentMethod.create(
            applePayCardParams,
            function (err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);

              let token = response.paymentMethod.token;

              specHelper.defaultGateway.paymentMethod.find(
                token,
                function (err, applePayCard) {
                  assert.isNull(err);
                  assert.isTrue(applePayCard !== null);

                  done();
                }
              );
            }
          );
        }));
    });

    context("SEPA direct debit", function () {
      it("creates a SEPA direct debit account from a payment method nonce", (done) =>
        specHelper.defaultGateway.customer.create({}, function (err, response) {
          customerId = response.customer.id;
          specHelper.defaultGateway.clientToken.generate(
            {},
            function (err, result) {
              assert.isNull(err);
              assert.isTrue(result.success);
              let sepaDirectDebitAccountParams = {
                customerId,
                paymentMethodNonce: Nonces.SepaDirectDebit,
              };

              specHelper.defaultGateway.paymentMethod.create(
                sepaDirectDebitAccountParams,
                function (err, response) {
                  assert.isNull(err);
                  assert.isTrue(response.success);
                  let sepaDirectDebitAccount = response.paymentMethod;

                  assert.equal(sepaDirectDebitAccount.customerId, customerId);
                  assert.equal(sepaDirectDebitAccount.mandateType, "RECURRENT");
                  assert.equal(
                    sepaDirectDebitAccount.merchantOrPartnerCustomerId,
                    "a-fake-mp-customer-id"
                  );
                  assert.equal(sepaDirectDebitAccount.default, true);
                  assert.equal(sepaDirectDebitAccount.last4, "1234");
                  assert.equal(
                    sepaDirectDebitAccount.bankReferenceToken,
                    "a-fake-bank-reference-token"
                  );
                  assert.isString(sepaDirectDebitAccount.token);
                  assert.isString(sepaDirectDebitAccount.globalId);
                  assert.isString(sepaDirectDebitAccount.graphQLId);
                  assert.isString(sepaDirectDebitAccount.customerGlobalId);
                  assert.isString(sepaDirectDebitAccount.createdAt);
                  assert.isString(sepaDirectDebitAccount.updatedAt);
                  assert.match(sepaDirectDebitAccount.imageUrl, /svg/);
                }
              );
              done();
            }
          );
        }));
    });
  });

  describe("find", function () {
    context("credit card", function () {
      let paymentMethodToken;

      it("finds the card", function (done) {
        specHelper.defaultGateway.customer.create({}, function (err, response) {
          let paymentMethodParams = {
            paymentMethodNonce: "fake-valid-visa-nonce",
            customerId: response.customer.id,
            number: "4111111111111111",
            cvv: "100",
          };

          specHelper.defaultGateway.paymentMethod.create(
            paymentMethodParams,
            function (err, response) {
              paymentMethodToken = response.paymentMethod.token;

              specHelper.defaultGateway.paymentMethod.find(
                paymentMethodToken,
                function (err, creditCard) {
                  assert.isNull(err);
                  assert.equal(creditCard.maskedNumber, "411111******1111");

                  done();
                }
              );
            }
          );
        });
      });
    });

    context("paypal account", () =>
      it("finds the paypal account", (done) =>
        specHelper.defaultGateway.customer.create({}, function (err, response) {
          let paymentMethodParams = {
            customerId: response.customer.id,
            paymentMethodNonce: Nonces.PayPalBillingAgreement,
          };

          specHelper.defaultGateway.paymentMethod.create(
            paymentMethodParams,
            function (err, response) {
              let paymentMethodToken = response.paymentMethod.token;

              specHelper.defaultGateway.paymentMethod.find(
                paymentMethodToken,
                function (err, paypalAccount) {
                  assert.isNull(err);
                  assert.isString(paypalAccount.email);

                  done();
                }
              );
            }
          );
        }))
    );

    context("SEPA direct debit", () =>
      it("finds the account", (done) =>
        specHelper.defaultGateway.customer.create({}, function (err, response) {
          let customer = response.customer;
          let paymentMethodParams = {
            customerId: customer.id,
            paymentMethodNonce: Nonces.SepaDirectDebit,
          };

          specHelper.defaultGateway.paymentMethod.create(
            paymentMethodParams,
            function (err, response) {
              let paymentMethodToken = response.paymentMethod.token;

              specHelper.defaultGateway.paymentMethod.find(
                paymentMethodToken,
                function (err, sepaDirectDebitAccount) {
                  assert.isNull(err);

                  assert.equal(sepaDirectDebitAccount.customerId, customer.id);
                  assert.equal(sepaDirectDebitAccount.mandateType, "RECURRENT");
                  assert.equal(
                    sepaDirectDebitAccount.merchantOrPartnerCustomerId,
                    "a-fake-mp-customer-id"
                  );
                  assert.equal(sepaDirectDebitAccount.default, true);
                  assert.equal(sepaDirectDebitAccount.last4, "1234");
                  assert.equal(
                    sepaDirectDebitAccount.bankReferenceToken,
                    "a-fake-bank-reference-token"
                  );
                  assert.isString(sepaDirectDebitAccount.token);
                  assert.isString(sepaDirectDebitAccount.globalId);
                  assert.isString(sepaDirectDebitAccount.graphQLId);
                  assert.isString(sepaDirectDebitAccount.customerGlobalId);
                  assert.isString(sepaDirectDebitAccount.createdAt);
                  assert.isString(sepaDirectDebitAccount.updatedAt);
                  assert.match(sepaDirectDebitAccount.imageUrl, /svg/);

                  done();
                }
              );
            }
          );
        }))
    );

    context("android pay card", () =>
      it("finds the android pay card", (done) =>
        specHelper.defaultGateway.customer.create({}, function (err, response) {
          let paymentMethodParams = {
            customerId: response.customer.id,
            paymentMethodNonce: Nonces.AndroidPay,
          };

          specHelper.defaultGateway.paymentMethod.create(
            paymentMethodParams,
            function (err, response) {
              let paymentMethodToken = response.paymentMethod.token;

              specHelper.defaultGateway.paymentMethod.find(
                paymentMethodToken,
                function (err, androidPayCard) {
                  assert.isNull(err);
                  assert.isString(androidPayCard.googleTransactionId);
                  assert.equal(
                    androidPayCard.cardType,
                    specHelper.braintree.CreditCard.CardType.Discover
                  );
                  assert.equal(
                    androidPayCard.virtualCardType,
                    specHelper.braintree.CreditCard.CardType.Discover
                  );
                  assert.equal(androidPayCard.last4, "1117");
                  assert.isString(androidPayCard.expirationMonth);
                  assert.isString(androidPayCard.expirationYear);
                  assert.isTrue(androidPayCard.default);
                  assert.include(androidPayCard.imageUrl, "android_pay");
                  assert.equal(
                    androidPayCard.sourceCardType,
                    specHelper.braintree.CreditCard.CardType.Discover
                  );
                  assert.equal(androidPayCard.sourceCardLast4, "1111");

                  done();
                }
              );
            }
          );
        }))
    );

    context("unkown payment method", () =>
      it("finds the unknown payment method", (done) =>
        specHelper.defaultGateway.customer.create({}, function (err, response) {
          let paymentMethodParams = {
            customerId: response.customer.id,
            paymentMethodNonce: Nonces.AbstractTransactable,
          };

          specHelper.defaultGateway.paymentMethod.create(
            paymentMethodParams,
            function (err, response) {
              let paymentMethodToken = response.paymentMethod.token;

              specHelper.defaultGateway.paymentMethod.find(
                paymentMethodToken,
                function (err, paymentMethod) {
                  assert.isNull(err);
                  assert.isString(paymentMethod.token);

                  done();
                }
              );
            }
          );
        }))
    );
  });

  it("handles not finding the paypal account", (done) =>
    specHelper.defaultGateway.paymentMethod.find(
      "NON_EXISTENT_TOKEN",
      function (err) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);

        done();
      }
    ));

  it("handles whitespace", (done) =>
    specHelper.defaultGateway.paymentMethod.find(" ", function (err) {
      assert.equal(err.type, braintree.errorTypes.notFoundError);

      done();
    }));

  describe("update", function () {
    context("credit card", function () {
      it("throws validation error when updating card with invalid pass thru params", (done) =>
        specHelper.defaultGateway.customer.create({}, function (err, response) {
          let customerId = response.customer.id;

          let creditCardParams = {
            cardholderName: "Original Holder",
            customerId,
            cvv: "123",
            number: "4012888888881881",
            expirationDate: "05/2012",
          };

          specHelper.defaultGateway.creditCard.create(
            creditCardParams,
            function (err, response) {
              assert.isTrue(response.success);

              let creditCard = response.creditCard;

              let updateParams = {
                cardholderName: "New Holder",
                cvv: "456",
                number: "5555555555554444",
                expirationDate: "06/2013",
                threeDSecurePassThru: {
                  eciFlag: "02",
                  cavv: "some_cavv",
                  xid: "some_xid",
                  authenticationResponse: "Y",
                  threeDSecureVersion: "xx",
                  directoryResponse: "Y",
                  cavvAlgorithm: "2",
                  dsTransactionId: "some_ds_transaction_id",
                },
                options: {
                  verifyCard: true,
                },
              };

              specHelper.defaultGateway.paymentMethod.update(
                creditCard.token,
                updateParams,
                function (err, response) {
                  assert.isNull(err);
                  assert.isFalse(response.success);
                  assert.equal(
                    response.errors.deepErrors()[0].code,
                    ValidationErrorCodes.Verification.ThreeDSecurePassThru
                      .ThreeDSecureVersionIsInvalid
                  );
                  done();
                }
              );
            }
          );
        }));

      it("updates the payment method with three_d_secure pass thru params", (done) =>
        specHelper.defaultGateway.customer.create({}, function (err, response) {
          let customerId = response.customer.id;

          let creditCardParams = {
            cardholderName: "Original Holder",
            customerId,
            cvv: "123",
            number: "4012888888881881",
            expirationDate: "05/2012",
          };

          specHelper.defaultGateway.creditCard.create(
            creditCardParams,
            function (err, response) {
              assert.isTrue(response.success);

              let creditCard = response.creditCard;
              let updateParams = {
                cardholderName: "New Holder",
                cvv: "456",
                number: "5555555555554444",
                expirationDate: "06/2013",
                threeDSecurePassThru: {
                  eciFlag: "02",
                  cavv: "some_cavv",
                  xid: "some_xid",
                  authenticationResponse: "Y",
                  threeDSecureVersion: "1.2.2",
                  directoryResponse: "Y",
                  cavvAlgorithm: "2",
                  dsTransactionId: "some_ds_transaction_id",
                },
                options: {
                  verifyCard: true,
                },
              };

              specHelper.defaultGateway.paymentMethod.update(
                creditCard.token,
                updateParams,
                function (err, response) {
                  assert.isNull(err);
                  assert.isTrue(response.success);
                  assert.equal(response.paymentMethod.token, creditCard.token);
                  let updatedCreditCard = response.paymentMethod;

                  assert.equal(updatedCreditCard.cardholderName, "New Holder");
                  assert.equal(updatedCreditCard.bin, "555555");
                  assert.equal(updatedCreditCard.last4, "4444");
                  assert.equal(updatedCreditCard.expirationDate, "06/2013");

                  done();
                }
              );
            }
          );
        }));

      it("updates the credit card", (done) =>
        specHelper.defaultGateway.customer.create({}, function (err, response) {
          let customerId = response.customer.id;

          let creditCardParams = {
            cardholderName: "Original Holder",
            customerId,
            cvv: "123",
            number: "4012888888881881",
            expirationDate: "05/2012",
          };

          specHelper.defaultGateway.creditCard.create(
            creditCardParams,
            function (err, response) {
              assert.isTrue(response.success);

              let creditCard = response.creditCard;

              let updateParams = {
                cardholderName: "New Holder",
                cvv: "456",
                number: "5555555555554444",
                expirationDate: "06/2013",
              };

              specHelper.defaultGateway.paymentMethod.update(
                creditCard.token,
                updateParams,
                function (err, response) {
                  assert.isNull(err);
                  assert.isTrue(response.success);
                  assert.equal(response.paymentMethod.token, creditCard.token);
                  let updatedCreditCard = response.paymentMethod;

                  assert.equal(updatedCreditCard.cardholderName, "New Holder");
                  assert.equal(updatedCreditCard.bin, "555555");
                  assert.equal(updatedCreditCard.last4, "4444");
                  assert.equal(updatedCreditCard.expirationDate, "06/2013");

                  done();
                }
              );
            }
          );
        }));

      it("support accountType debit", (done) =>
        specHelper.defaultGateway.customer.create({}, function (err, response) {
          let customerId = response.customer.id;

          let creditCardParams = {
            cardholderName: "Original Holder",
            customerId,
            cvv: "123",
            number: "4012888888881881",
            expirationDate: "05/2012",
          };

          specHelper.defaultGateway.creditCard.create(
            creditCardParams,
            function (err, response) {
              assert.isTrue(response.success);

              let creditCard = response.creditCard;

              let updateParams = {
                cardholderName: "New Holder",
                cvv: "456",
                number: CreditCardNumbers.CardTypeIndicators.Hiper,
                expirationDate: "06/2013",
                options: {
                  verifyCard: true,
                  verificationMerchantAccountId: "hiper_brl",
                  verificationAccountType: "debit",
                },
              };

              specHelper.defaultGateway.paymentMethod.update(
                creditCard.token,
                updateParams,
                function (err, response) {
                  assert.isNull(err);
                  assert.isTrue(response.success);
                  assert.equal(response.paymentMethod.token, creditCard.token);
                  let updatedCreditCard = response.paymentMethod;

                  assert.equal(
                    updatedCreditCard.verification.creditCard.accountType,
                    "debit"
                  );

                  done();
                }
              );
            }
          );
        }));

      it("support accountType credit", (done) =>
        specHelper.defaultGateway.customer.create({}, function (err, response) {
          let customerId = response.customer.id;

          let creditCardParams = {
            cardholderName: "Original Holder",
            customerId,
            cvv: "123",
            number: "4012888888881881",
            expirationDate: "05/2012",
          };

          specHelper.defaultGateway.creditCard.create(
            creditCardParams,
            function (err, response) {
              assert.isTrue(response.success);

              let creditCard = response.creditCard;

              let updateParams = {
                cardholderName: "New Holder",
                cvv: "456",
                number: CreditCardNumbers.CardTypeIndicators.Hiper,
                expirationDate: "06/2013",
                options: {
                  verifyCard: true,
                  verificationMerchantAccountId: "hiper_brl",
                  verificationAccountType: "credit",
                },
              };

              specHelper.defaultGateway.paymentMethod.update(
                creditCard.token,
                updateParams,
                function (err, response) {
                  assert.isNull(err);
                  assert.isTrue(response.success);
                  assert.equal(response.paymentMethod.token, creditCard.token);
                  let updatedCreditCard = response.paymentMethod;

                  assert.equal(
                    updatedCreditCard.verification.creditCard.accountType,
                    "credit"
                  );

                  done();
                }
              );
            }
          );
        }));

      it("handles a not found error correctly", (done) =>
        specHelper.defaultGateway.customer.create({}, function () {
          let updateParams = {
            cardholderName: "New Holder",
            cvv: "456",
            number: "5555555555554444",
            expirationDate: "06/2013",
          };

          specHelper.defaultGateway.paymentMethod.update(
            "doesNotExist",
            updateParams,
            function (err, response) {
              assert.isUndefined(response);
              assert.isNotNull(err);
              done();
            }
          );
        }));

      it("can pass expirationMonth and expirationYear", (done) =>
        specHelper.defaultGateway.customer.create({}, function (err, response) {
          let customerId = response.customer.id;

          let creditCardParams = {
            customerId,
            number: "4012888888881881",
            expirationDate: "05/2012",
          };

          specHelper.defaultGateway.creditCard.create(
            creditCardParams,
            function (err, response) {
              assert.isTrue(response.success);

              let creditCard = response.creditCard;

              let updateParams = {
                expirationMonth: "07",
                expirationYear: "2011",
              };

              specHelper.defaultGateway.paymentMethod.update(
                creditCard.token,
                updateParams,
                function (err, response) {
                  assert.isNull(err);
                  assert.isTrue(response.success);
                  let updatedCreditCard = response.paymentMethod;

                  assert.equal(updatedCreditCard.expirationMonth, "07");
                  assert.equal(updatedCreditCard.expirationYear, "2011");
                  assert.equal(updatedCreditCard.expirationDate, "07/2011");

                  done();
                }
              );
            }
          );
        }));

      it("verifies the update if options[verify_card]=true", (done) =>
        specHelper.defaultGateway.customer.create({}, function (err, response) {
          let customerId = response.customer.id;

          let creditCardParams = {
            cardholderName: "Original Holder",
            customerId,
            cvv: "123",
            number: "4012888888881881",
            expirationDate: "05/2012",
          };

          specHelper.defaultGateway.creditCard.create(
            creditCardParams,
            function (err, response) {
              assert.isTrue(response.success);

              let creditCard = response.creditCard;

              let updateParams = {
                cardholderName: "New Holder",
                cvv: "456",
                number: "5105105105105100",
                expirationDate: "06/2013",
                options: {
                  verifyCard: "true",
                },
              };

              specHelper.defaultGateway.paymentMethod.update(
                creditCard.token,
                updateParams,
                function (err, response) {
                  assert.isFalse(response.success);
                  assert.equal(
                    response.verification.status,
                    "processor_declined"
                  );
                  assert.isNull(response.verification.gatewayRejectionReason);

                  done();
                }
              );
            }
          );
        }));

      it("includes risk data when skipAdvancedFraudChecking is false", function (done) {
        let customerParams = {
          creditCard: {
            number: "4111111111111111",
            expirationDate: "06/2023",
          },
        };

        specHelper.fraudProtectionEnterpriseGateway.customer.create(
          customerParams,
          function (err, response) {
            let creditCard = response.customer.creditCards[0];

            let paymentMethodParams = {
              expirationDate: "09/2033",
              options: {
                verifyCard: "true",
                skipAdvancedFraudChecking: "false",
              },
            };

            specHelper.fraudProtectionEnterpriseGateway.paymentMethod.update(
              creditCard.token,
              paymentMethodParams,
              function (err, response) {
                assert.isNull(err);
                assert.isTrue(response.success);

                let riskData = response.creditCard.verification.riskData;

                assert.isDefined(riskData);
                done();
              }
            );
          }
        );
      });

      it("does not include risk data when skipAdvancedFraudChecking is true", function (done) {
        let customerParams = {
          creditCard: {
            number: "4111111111111111",
            expirationDate: "06/2023",
          },
        };

        specHelper.fraudProtectionEnterpriseGateway.customer.create(
          customerParams,
          function (err, response) {
            let creditCard = response.customer.creditCards[0];

            let paymentMethodParams = {
              expirationDate: "09/2033",
              options: {
                verifyCard: "true",
                skipAdvancedFraudChecking: "true",
              },
            };

            specHelper.fraudProtectionEnterpriseGateway.paymentMethod.update(
              creditCard.token,
              paymentMethodParams,
              function (err, response) {
                assert.isNull(err);
                assert.isTrue(response.success);

                let riskData = response.creditCard.verification.riskData;

                assert.isUndefined(riskData);
                done();
              }
            );
          }
        );
      });

      it("can pass a custom verification amount", (done) =>
        specHelper.defaultGateway.customer.create({}, function (err, response) {
          let customerId = response.customer.id;

          let creditCardParams = {
            cardholderName: "Card Holder",
            customerId,
            cvv: "123",
            number: "4012888888881881",
            expirationDate: "05/2020",
          };

          specHelper.defaultGateway.creditCard.create(
            creditCardParams,
            function (err, response) {
              assert.isTrue(response.success);

              let creditCard = response.creditCard;

              let updateParams = {
                paymentMethodNonce: Nonces.ProcessorDeclinedMasterCard,
                options: {
                  verifyCard: "true",
                  verificationAmount: "2.34",
                },
              };

              specHelper.defaultGateway.paymentMethod.update(
                creditCard.token,
                updateParams,
                function (err, response) {
                  assert.isFalse(response.success);
                  assert.equal(
                    response.verification.status,
                    "processor_declined"
                  );
                  assert.isNull(response.verification.gatewayRejectionReason);

                  done();
                }
              );
            }
          );
        }));

      it("returns an error if invalid", (done) =>
        specHelper.defaultGateway.customer.create({}, function (err, response) {
          let customerId = response.customer.id;

          let creditCardParams = {
            cardholderName: "Original Holder",
            customerId,
            number: "4012888888881881",
            expirationDate: "05/2012",
          };

          specHelper.defaultGateway.creditCard.create(
            creditCardParams,
            function (err, response) {
              assert.isTrue(response.success);

              let creditCard = response.creditCard;

              let updateParams = {
                cardholderName: "New Holder",
                number: "invalid",
                expirationDate: "05/2014",
              };

              specHelper.defaultGateway.paymentMethod.update(
                creditCard.token,
                updateParams,
                function (err, response) {
                  assert.isFalse(response.success);
                  assert.equal(
                    response.errors.for("creditCard").on("number")[0].message,
                    "Credit card number must be 12-19 digits."
                  );

                  done();
                }
              );
            }
          );
        }));

      it("can update the default", (done) =>
        specHelper.defaultGateway.customer.create({}, function (err, response) {
          let customerId = response.customer.id;

          let creditCardParams = {
            customerId,
            number: "4012888888881881",
            expirationDate: "05/2009",
          };

          specHelper.defaultGateway.creditCard.create(
            creditCardParams,
            function (err, response) {
              assert.isTrue(response.success);

              let creditCard1 = response.creditCard;

              specHelper.defaultGateway.creditCard.create(
                creditCardParams,
                function (err, response) {
                  assert.isTrue(response.success);

                  let creditCard2 = response.creditCard;

                  assert.isTrue(creditCard1.default);
                  assert.isFalse(creditCard2.default);

                  let updateParams = {
                    options: {
                      makeDefault: "true",
                    },
                  };

                  specHelper.defaultGateway.paymentMethod.update(
                    creditCard2.token,
                    updateParams,
                    function (err, response) {
                      assert.isNull(err);
                      assert.isTrue(response.success);
                      specHelper.defaultGateway.paymentMethod.find(
                        creditCard1.token,
                        function (err, creditCard) {
                          assert.isNull(err);
                          assert.isFalse(creditCard.default);
                        }
                      );

                      specHelper.defaultGateway.paymentMethod.find(
                        creditCard2.token,
                        function (err, creditCard) {
                          assert.isNull(err);
                          assert.isTrue(creditCard.default);
                        }
                      );

                      done();
                    }
                  );
                }
              );
            }
          );
        }));

      context("billing address", function () {
        it("creates a new billing address by default", (done) =>
          specHelper.defaultGateway.customer.create(
            {},
            function (err, response) {
              let customerId = response.customer.id;

              let creditCardParams = {
                customerId,
                number: "4012888888881881",
                expirationDate: "05/2012",
                billingAddress: {
                  streetAddress: "123 Nigeria Ave",
                },
              };

              specHelper.defaultGateway.creditCard.create(
                creditCardParams,
                function (err, response) {
                  assert.isTrue(response.success);

                  let creditCard = response.creditCard;

                  let updateParams = {
                    billingAddress: {
                      region: "IL",
                    },
                  };

                  specHelper.defaultGateway.paymentMethod.update(
                    creditCard.token,
                    updateParams,
                    function (err, response) {
                      assert.isNull(err);
                      assert.isTrue(response.success);
                      let updatedCreditCard = response.paymentMethod;

                      assert.equal(
                        updatedCreditCard.billingAddress.region,
                        "IL"
                      );
                      assert.isNull(
                        updatedCreditCard.billingAddress.streetAddress
                      );
                      let differentAddresses =
                        updatedCreditCard.billingAddress.id !==
                        creditCard.billingAddress.id;

                      assert.isTrue(differentAddresses);

                      done();
                    }
                  );
                }
              );
            }
          ));

        it("updates the billing address if option is specified", (done) =>
          specHelper.defaultGateway.customer.create(
            {},
            function (err, response) {
              let customerId = response.customer.id;

              let creditCardParams = {
                customerId,
                number: "4012888888881881",
                expirationDate: "05/2012",
                billingAddress: {
                  streetAddress: "123 Nigeria Ave",
                },
              };

              specHelper.defaultGateway.creditCard.create(
                creditCardParams,
                function (err, response) {
                  assert.isTrue(response.success);

                  let creditCard = response.creditCard;

                  let updateParams = {
                    billingAddress: {
                      options: {
                        updateExisting: "true",
                      },
                      region: "IL",
                    },
                  };

                  specHelper.defaultGateway.paymentMethod.update(
                    creditCard.token,
                    updateParams,
                    function (err, response) {
                      assert.isNull(err);
                      assert.isTrue(response.success);
                      let updatedCreditCard = response.paymentMethod;

                      assert.equal(
                        updatedCreditCard.billingAddress.region,
                        "IL"
                      );
                      assert.equal(
                        updatedCreditCard.billingAddress.streetAddress,
                        "123 Nigeria Ave"
                      );
                      let sameAddresses =
                        updatedCreditCard.billingAddress.id ===
                        creditCard.billingAddress.id;

                      assert.isTrue(sameAddresses);

                      done();
                    }
                  );
                }
              );
            }
          ));

        it("updates the country via codes", (done) =>
          specHelper.defaultGateway.customer.create(
            {},
            function (err, response) {
              let customerId = response.customer.id;

              let creditCardParams = {
                customerId,
                number: "4012888888881881",
                expirationDate: "05/2012",
                billingAddress: {
                  streetAddress: "123 Nigeria Ave",
                },
              };

              specHelper.defaultGateway.creditCard.create(
                creditCardParams,
                function (err, response) {
                  assert.isTrue(response.success);

                  let creditCard = response.creditCard;

                  let updateParams = {
                    billingAddress: {
                      countryName: "American Samoa",
                      countryCodeAlpha2: "AS",
                      countryCodeAlpha3: "ASM",
                      countryCodeNumeric: "016",
                      options: {
                        updateExisting: "true",
                      },
                    },
                  };

                  specHelper.defaultGateway.paymentMethod.update(
                    creditCard.token,
                    updateParams,
                    function (err, response) {
                      assert.isNull(err);
                      assert.isTrue(response.success);
                      let updatedCreditCard = response.paymentMethod;

                      assert.equal(
                        updatedCreditCard.billingAddress.countryName,
                        "American Samoa"
                      );
                      assert.equal(
                        updatedCreditCard.billingAddress.countryCodeAlpha2,
                        "AS"
                      );
                      assert.equal(
                        updatedCreditCard.billingAddress.countryCodeAlpha3,
                        "ASM"
                      );
                      assert.equal(
                        updatedCreditCard.billingAddress.countryCodeNumeric,
                        "016"
                      );

                      done();
                    }
                  );
                }
              );
            }
          ));

        it("can update the billing address", (done) =>
          specHelper.defaultGateway.customer.create(
            {},
            function (err, response) {
              let customerId = response.customer.id;

              let creditCardParams = {
                cardholder_name: "Original Holder", // eslint-disable-line camelcase
                customerId,
                cvv: "123",
                number: "4012888888881881",
                expirationDate: "05/2012",
                billingAddress: {
                  firstName: "Old First Name",
                  lastName: "Old Last Name",
                  Company: "Old Company",
                  streetAddress: "123 Old St",
                  extendedAddress: "Apt Old",
                  locality: "Old City",
                  region: "Old State",
                  postalCode: "12345",
                  countryName: "Canada",
                },
              };

              specHelper.defaultGateway.creditCard.create(
                creditCardParams,
                function (err, response) {
                  assert.isTrue(response.success);

                  let creditCard = response.creditCard;

                  let updateParams = {
                    options: {
                      verifyCard: "false",
                    },
                    billingAddress: {
                      firstName: "New First Name",
                      lastName: "New Last Name",
                      company: "New Company",
                      streetAddress: "123 New St",
                      extendedAddress: "Apt New",
                      locality: "New City",
                      region: "New State",
                      postalCode: "56789",
                      countryName: "United States of America",
                    },
                  };

                  specHelper.defaultGateway.paymentMethod.update(
                    creditCard.token,
                    updateParams,
                    function (err, response) {
                      assert.isNull(err);
                      assert.isTrue(response.success);
                      let address = response.paymentMethod.billingAddress;

                      assert.equal(address.firstName, "New First Name");
                      assert.equal(address.lastName, "New Last Name");
                      assert.equal(address.company, "New Company");
                      assert.equal(address.streetAddress, "123 New St");
                      assert.equal(address.extendedAddress, "Apt New");
                      assert.equal(address.locality, "New City");
                      assert.equal(address.region, "New State");
                      assert.equal(address.postalCode, "56789");
                      assert.equal(
                        address.countryName,
                        "United States of America"
                      );

                      done();
                    }
                  );
                }
              );
            }
          ));
      });
    });

    context("paypal accounts", function () {
      it("updates a paypal account's token", (done) =>
        specHelper.defaultGateway.customer.create({}, function (err, response) {
          let customerId = response.customer.id;
          let originalToken = `paypal-account-${specHelper.randomId()}`;

          specHelper.defaultGateway.clientToken.generate(
            {},
            function (err, result) {
              let clientToken = JSON.parse(
                specHelper.decodeClientToken(result.clientToken)
              );
              let authorizationFingerprint =
                clientToken.authorizationFingerprint;

              let params = {
                authorizationFingerprint,
                paypalAccount: {
                  consentCode: "consent-code",
                  token: originalToken,
                },
              };

              let myHttp = new specHelper.clientApiHttp(
                new Config(specHelper.defaultConfig)
              );

              return myHttp.post(
                "/client_api/v1/payment_methods/paypal_accounts.json",
                params,
                function (statusCode, body) {
                  let nonce = JSON.parse(body).paypalAccounts[0].nonce;
                  let paypalAccountParams = {
                    paymentMethodNonce: nonce,
                    customerId,
                  };

                  specHelper.defaultGateway.paymentMethod.create(
                    paypalAccountParams,
                    function (err, response) {
                      assert.isNull(err);
                      assert.isTrue(response.success);

                      let originalResult = response.paymentMethod;

                      let updatedToken = `UPDATED-TOKEN-${specHelper.randomId()}`;

                      let updateParams = { token: updatedToken };

                      specHelper.defaultGateway.paymentMethod.update(
                        originalToken,
                        updateParams,
                        function (err, response) {
                          assert.isNull(err);
                          assert.isTrue(response.success);

                          specHelper.defaultGateway.paypalAccount.find(
                            updatedToken,
                            function (err, paypalAccount) {
                              assert.isNull(err);

                              assert.equal(
                                paypalAccount.email,
                                originalResult.email
                              );

                              specHelper.defaultGateway.paypalAccount.find(
                                originalToken,
                                function (err, paypalAccount) {
                                  assert.isUndefined(paypalAccount);
                                  assert.equal(
                                    err.type,
                                    braintree.errorTypes.notFoundError
                                  );

                                  done();
                                }
                              );
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }));

      it("can make a paypal account the default payment method", (done) =>
        specHelper.defaultGateway.customer.create({}, function (err, response) {
          let customerId = response.customer.id;

          let creditCardParams = {
            cardholderName: "Original Holder",
            customerId,
            number: "4012888888881881",
            expirationDate: "05/2009",
            options: {
              makeDefault: "true",
            },
          };

          specHelper.defaultGateway.creditCard.create(
            creditCardParams,
            function (err, response) {
              assert.isTrue(response.success);

              let creditCard = response.creditCard;

              specHelper.defaultGateway.clientToken.generate(
                {},
                function (err, result) {
                  let clientToken = JSON.parse(
                    specHelper.decodeClientToken(result.clientToken)
                  );
                  let authorizationFingerprint =
                    clientToken.authorizationFingerprint;

                  let params = {
                    authorizationFingerprint,
                    paypalAccount: {
                      consentCode: "consent-code",
                    },
                  };

                  let myHttp = new specHelper.clientApiHttp(
                    new Config(specHelper.defaultConfig)
                  );

                  return myHttp.post(
                    "/client_api/v1/payment_methods/paypal_accounts.json",
                    params,
                    function (statusCode, body) {
                      let nonce = JSON.parse(body).paypalAccounts[0].nonce;
                      let paypalAccountParams = {
                        paymentMethodNonce: nonce,
                        customerId,
                      };

                      specHelper.defaultGateway.paymentMethod.create(
                        paypalAccountParams,
                        function (err, response) {
                          assert.isNull(err);
                          assert.isTrue(response.success);

                          let originalToken = response.paymentMethod.token;

                          assert.isFalse(response.paymentMethod.default);

                          let updateParams = {
                            options: {
                              makeDefault: "true",
                            },
                          };

                          specHelper.defaultGateway.paymentMethod.update(
                            originalToken,
                            updateParams,
                            function (err, response) {
                              assert.isNull(err);
                              assert.isTrue(response.success);

                              specHelper.defaultGateway.paypalAccount.find(
                                originalToken,
                                function (err, paypalAccount) {
                                  assert.isTrue(paypalAccount.default);

                                  specHelper.defaultGateway.creditCard.find(
                                    creditCard.token,
                                    function (err, creditCard) {
                                      assert.isFalse(creditCard.default);

                                      done();
                                    }
                                  );
                                }
                              );
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }));

      it("returns an error if a token for account is used to attempt an update", (done) =>
        specHelper.defaultGateway.customer.create({}, function (err, response) {
          let customerId = response.customer.id;
          let firstToken = `paypal-account-${specHelper.randomId()}`;
          let secondToken = `paypal-account-${specHelper.randomId()}`;

          specHelper.defaultGateway.clientToken.generate(
            {},
            function (err, result) {
              let clientToken = JSON.parse(
                specHelper.decodeClientToken(result.clientToken)
              );
              let authorizationFingerprint =
                clientToken.authorizationFingerprint;

              let params = {
                authorizationFingerprint,
                paypalAccount: {
                  consentCode: "consent-code",
                  token: firstToken,
                },
              };

              let myHttp = new specHelper.clientApiHttp(
                new Config(specHelper.defaultConfig)
              );

              return myHttp.post(
                "/client_api/v1/payment_methods/paypal_accounts.json",
                params,
                function (statusCode, body) {
                  let firstNonce = JSON.parse(body).paypalAccounts[0].nonce;
                  let paypalAccountParams = {
                    paymentMethodNonce: firstNonce,
                    customerId,
                  };

                  specHelper.defaultGateway.paymentMethod.create(
                    paypalAccountParams,
                    function (err, response) {
                      assert.isNull(err);
                      assert.isTrue(response.success);

                      params = {
                        authorizationFingerprint,
                        paypalAccount: {
                          consentCode: "consent-code",
                          token: secondToken,
                        },
                      };

                      myHttp = new specHelper.clientApiHttp(
                        new Config(specHelper.defaultConfig)
                      );

                      return myHttp.post(
                        "/client_api/v1/payment_methods/paypal_accounts.json",
                        params,
                        function (statusCode, body) {
                          let secondNonce =
                            JSON.parse(body).paypalAccounts[0].nonce;

                          paypalAccountParams = {
                            paymentMethodNonce: secondNonce,
                            customerId,
                          };

                          specHelper.defaultGateway.paymentMethod.create(
                            paypalAccountParams,
                            function (err, response) {
                              assert.isNull(err);
                              assert.isTrue(response.success);

                              let updateParams = { token: secondToken };

                              specHelper.defaultGateway.paymentMethod.update(
                                firstToken,
                                updateParams,
                                function (err, response) {
                                  assert.isNull(err);
                                  assert.isFalse(response.success);

                                  assert.equal(
                                    response.errors.deepErrors()[0].code,
                                    "92906"
                                  );

                                  done();
                                }
                              );
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }));
    });
  });

  describe("delete", function () {
    let paymentMethodToken;

    context("credit card", function () {
      before((done) =>
        specHelper.defaultGateway.customer.create({}, function (err, response) {
          let customerId = response.customer.id;

          specHelper.defaultGateway.clientToken.generate(
            {},
            function (err, result) {
              let clientToken = JSON.parse(
                specHelper.decodeClientToken(result.clientToken)
              );
              let authorizationFingerprint =
                clientToken.authorizationFingerprint;
              let params = {
                authorizationFingerprint,
                creditCard: {
                  number: "4111111111111111",
                  expirationDate: "01/2020",
                },
              };

              let myHttp = new specHelper.clientApiHttp(
                new Config(specHelper.defaultConfig)
              );

              return myHttp.post(
                "/client_api/v1/payment_methods/credit_cards.json",
                params,
                function (statusCode, body) {
                  let nonce = JSON.parse(body).creditCards[0].nonce;
                  let paymentMethodParams = {
                    customerId,
                    paymentMethodNonce: nonce,
                  };

                  specHelper.defaultGateway.paymentMethod.create(
                    paymentMethodParams,
                    function (err, response) {
                      paymentMethodToken = response.paymentMethod.token;
                      done();
                    }
                  );
                }
              );
            }
          );
        })
      );

      it("deletes the credit card", (done) =>
        specHelper.defaultGateway.paymentMethod.delete(
          paymentMethodToken,
          function (err) {
            assert.isNull(err);

            specHelper.defaultGateway.paymentMethod.find(
              paymentMethodToken,
              function (err) {
                assert.equal(err.type, braintree.errorTypes.notFoundError);
                done();
              }
            );
          }
        ));
    });

    context("paypal account", function () {
      before((done) =>
        specHelper.defaultGateway.customer.create({}, function (err, response) {
          let customerId = response.customer.id;

          specHelper.defaultGateway.clientToken.generate(
            {},
            function (err, result) {
              let clientToken = JSON.parse(
                specHelper.decodeClientToken(result.clientToken)
              );
              let authorizationFingerprint =
                clientToken.authorizationFingerprint;

              let params = {
                authorizationFingerprint,
                paypalAccount: {
                  consentCode: "PAYPAL_CONSENT_CODE",
                },
              };

              let myHttp = new specHelper.clientApiHttp(
                new Config(specHelper.defaultConfig)
              );

              return myHttp.post(
                "/client_api/v1/payment_methods/paypal_accounts.json",
                params,
                function (statusCode, body) {
                  let nonce = JSON.parse(body).paypalAccounts[0].nonce;
                  let paypalAccountParams = {
                    customerId,
                    paymentMethodNonce: nonce,
                  };

                  specHelper.defaultGateway.paymentMethod.create(
                    paypalAccountParams,
                    function (err, response) {
                      paymentMethodToken = response.paymentMethod.token;
                      done();
                    }
                  );
                }
              );
            }
          );
        })
      );

      it("deletes the paypal account", (done) =>
        specHelper.defaultGateway.paymentMethod.delete(
          paymentMethodToken,
          function (err) {
            assert.isNull(err);

            specHelper.defaultGateway.paypalAccount.find(
              paymentMethodToken,
              function (err) {
                assert.equal(err.type, braintree.errorTypes.notFoundError);
                done();
              }
            );
          }
        ));
    });

    it("handles invalid tokens", (done) =>
      specHelper.defaultGateway.paymentMethod.delete(
        "NONEXISTENT_TOKEN",
        function (err) {
          assert.equal(err.type, braintree.errorTypes.notFoundError);

          done();
        }
      ));

    context("SEPA direct debit", function () {
      before((done) =>
        specHelper.defaultGateway.customer.create({}, function (err, response) {
          let customerId = response.customer.id;
          let sepaDirectDebitAccountParams = {
            customerId,
            paymentMethodNonce: Nonces.SepaDirectDebit,
          };

          specHelper.defaultGateway.paymentMethod.create(
            sepaDirectDebitAccountParams,
            function (err, response) {
              paymentMethodToken = response.paymentMethod.token;
              done();
            }
          );
        })
      );

      it("deletes the SEPA direct debit account", (done) =>
        specHelper.defaultGateway.paymentMethod.delete(
          paymentMethodToken,
          function (err) {
            assert.isNull(err);

            specHelper.defaultGateway.sepaDirectDebitAccount.find(
              paymentMethodToken,
              function (err) {
                assert.equal(err.type, braintree.errorTypes.notFoundError);
                done();
              }
            );
          }
        ));
    });
  });

  context("grant and revoke payment methods", function () {
    let creditCard, grantingGateway;

    before(function (done) {
      let partnerMerchantGateway = new braintree.BraintreeGateway({
        merchantId: "integration_merchant_public_id",
        publicKey: "oauth_app_partner_user_public_key",
        privateKey: "oauth_app_partner_user_private_key",
        environment: Environment.Development,
      });

      let customerParams = {
        firstName: "Joe",
        lastName: "Brown",
        company: "ExampleCo",
        email: "joe@example.com",
        phone: "312.555.1234",
        fax: "614.555.5678",
        website: "www.example.com",
      };

      return partnerMerchantGateway.customer.create(
        customerParams,
        function (err, response) {
          let customer = response.customer;

          let creditCardParams = {
            customerId: customer.id,
            cardholderName: "Adam Davis",
            number: "4111111111111111",
            expirationDate: "05/2009",
          };

          return partnerMerchantGateway.creditCard.create(
            creditCardParams,
            function (err, response) {
              creditCard = response.creditCard;

              let oauthGateway = new braintree.BraintreeGateway({
                clientId: "client_id$development$integration_client_id",
                clientSecret:
                  "client_secret$development$integration_client_secret",
                environment: Environment.Development,
              });

              let accessTokenParams = {
                merchantPublicId: "integration_merchant_id",
                scope: "grant_payment_method",
              };

              specHelper.createToken(
                oauthGateway,
                accessTokenParams,
                function (err, response) {
                  grantingGateway = new braintree.BraintreeGateway({
                    accessToken: response.credentials.accessToken,
                    environment: Environment.Development,
                  });
                  done();
                }
              );
            }
          );
        }
      );
    });

    describe("grant", function () {
      it("returns a nonce that is transactable by a partner merchant exactly once", (done) =>
        grantingGateway.paymentMethod.grant(
          creditCard.token,
          {
            allow_vaulting: false, // eslint-disable-line camelcase
          },
          function (err, response) {
            let grantResult = response;

            assert.isTrue(grantResult.success);

            let transactionParams = {
              paymentMethodNonce: grantResult.paymentMethodNonce.nonce,
              amount: Braintree.Test.TransactionAmounts.Authorize,
            };

            specHelper.defaultGateway.transaction.sale(
              transactionParams,
              function (err, response) {
                assert.isTrue(response.success);

                specHelper.defaultGateway.transaction.sale(
                  transactionParams,
                  function (err, response2) {
                    assert.isFalse(response2.success);
                    done();
                  }
                );
              }
            );
          }
        ));

      it("returns a nonce that is not vaultable", (done) =>
        grantingGateway.paymentMethod.grant(
          creditCard.token,
          false,
          function (err, response) {
            let grantResult = response;

            specHelper.defaultGateway.customer.create(
              {},
              function (err, response) {
                let pmParams = {
                  customerId: response.customer.id,
                  paymentMethodNonce: grantResult.paymentMethodNonce.nonce,
                };

                specHelper.defaultGateway.creditCard.create(
                  pmParams,
                  function (err, response) {
                    assert.isFalse(response.success);
                    done();
                  }
                );
              }
            );
          }
        ));

      it("returns a nonce that is vaultable", (done) =>
        grantingGateway.paymentMethod.grant(
          creditCard.token,
          {
            allow_vaulting: true, // eslint-disable-line camelcase
          },
          function (err, response) {
            let grantResult = response;

            specHelper.defaultGateway.customer.create(
              {},
              function (err, response) {
                let pmParams = {
                  customerId: response.customer.id,
                  paymentMethodNonce: grantResult.paymentMethodNonce.nonce,
                };

                specHelper.defaultGateway.creditCard.create(
                  pmParams,
                  function (err, response) {
                    assert.isTrue(response.success);
                    done();
                  }
                );
              }
            );
          }
        ));

      it("raises an error if the token isn't found", (done) =>
        grantingGateway.paymentMethod.grant(
          "not_a_real_token",
          false,
          function (err, response) {
            assert.exists(err);
            assert.notExists(response);
            done();
          }
        ));
    });

    describe("revoke", function () {
      it("renders a granted nonce unusable", (done) =>
        grantingGateway.paymentMethod.grant(
          creditCard.token,
          false,
          function (err, response) {
            let grantResult = response;

            return grantingGateway.paymentMethod.revoke(
              creditCard.token,
              function (err, revokeResult) {
                assert.isTrue(revokeResult.success);

                let transactionParams = {
                  paymentMethodNonce: grantResult.paymentMethodNonce.nonce,
                  amount: Braintree.Test.TransactionAmounts.Authorize,
                };

                specHelper.defaultGateway.transaction.sale(
                  transactionParams,
                  function (err, response) {
                    assert.isFalse(response.success);
                    done();
                  }
                );
              }
            );
          }
        ));

      it("raises an error if the token isn't found", (done) =>
        grantingGateway.paymentMethod.revoke(
          "not_a_real_token",
          function (err, response) {
            assert.exists(err);
            assert.notExists(response);
            done();
          }
        ));
    });
  });
});
