'use strict';

require('../../spec_helper');
let _ = require('underscore')._;
let braintree = specHelper.braintree;
let Braintree = require('../../../lib/braintree');
let util = require('util');
let Config = require('../../../lib/braintree/config').Config;
let Environment = require('../../../lib/braintree/environment').Environment;
let Nonces = require('../../../lib/braintree/test/nonces').Nonces;
let ValidationErrorCodes = require('../../../lib/braintree/validation_error_codes').ValidationErrorCodes;

describe("PaymentMethodGateway", function() {
  describe("create", function() {
    let customerId = null;

    it('works with an unknown payment method nonce', done =>
      specHelper.defaultGateway.customer.create({firstName: 'John', lastName: 'Smith'}, function(err, response) {
        customerId = response.customer.id;

        let paymentMethodParams = {
          customerId,
          paymentMethodNonce: Nonces.AbstractTransactable
        };

        return specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function(err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.isNotNull(response.paymentMethod.token);
          assert.isNotNull(response.paymentMethod.customerId);

          return done();
        });
      })
    );

    context('Apple Pay', () =>
      it("vaults an Apple Pay card from the nonce", done =>
        specHelper.defaultGateway.customer.create({firstName: 'John', lastName: 'Appleseed'}, function(err, response) {
          customerId = response.customer.id;

          let paymentMethodParams = {
            customerId,
            paymentMethodNonce: Nonces.ApplePayAmEx
          };

          return specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function(err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.isNotNull(response.paymentMethod.token);
            assert.isNotNull(response.paymentMethod.cardType);
            assert.isNotNull(response.paymentMethod.paymentInstrumentName);
            assert.isNotNull(response.paymentMethod.sourceDescription);
            assert.isNotNull(response.paymentMethod.customerId);

            return done();
          });
        })
      )
    );

    context('Android Pay', function() {
      it("vaults an Android Pay proxy card from the nonce", done =>
        specHelper.defaultGateway.customer.create({firstName: 'John', lastName: 'Appleseed'}, function(err, response) {
          customerId = response.customer.id;

          let paymentMethodParams = {
            customerId,
            paymentMethodNonce: Nonces.AndroidPayDiscover
          };

          return specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function(err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.isNotNull(response.paymentMethod.token);
            assert.isNotNull(response.paymentMethod.google_transaction_id);
            assert.equal(response.paymentMethod.virtualCardType, specHelper.braintree.CreditCard.CardType.Discover);
            assert.equal(response.paymentMethod.last4, "1117");
            assert.isString(response.paymentMethod.expirationMonth);
            assert.isString(response.paymentMethod.expirationYear);
            assert.isTrue(response.paymentMethod.default);
            assert.include(response.paymentMethod.imageUrl, "android_pay");
            assert.equal(response.paymentMethod.sourceCardType, specHelper.braintree.CreditCard.CardType.Visa);
            assert.equal(response.paymentMethod.sourceCardLast4, "1111");
            assert.equal(response.paymentMethod.sourceDescription, "Visa 1111");
            assert.equal(response.paymentMethod.customerId, customerId);

            return done();
          });
        })
      );

      return it("vaults an Android Pay network token from the nonce", done =>
        specHelper.defaultGateway.customer.create({firstName: 'John', lastName: 'Appleseed'}, function(err, response) {
          customerId = response.customer.id;

          let paymentMethodParams = {
            customerId,
            paymentMethodNonce: Nonces.AndroidPayMasterCard
          };

          return specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function(err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.isNotNull(response.paymentMethod.token);
            assert.isNotNull(response.paymentMethod.google_transaction_id);
            assert.equal(response.paymentMethod.virtualCardType, specHelper.braintree.CreditCard.CardType.MasterCard);
            assert.equal(response.paymentMethod.last4, "4444");
            assert.isString(response.paymentMethod.expirationMonth);
            assert.isString(response.paymentMethod.expirationYear);
            assert.isTrue(response.paymentMethod.default);
            assert.include(response.paymentMethod.imageUrl, "android_pay");
            assert.equal(response.paymentMethod.sourceCardType, specHelper.braintree.CreditCard.CardType.MasterCard);
            assert.equal(response.paymentMethod.sourceCardLast4, "4444");
            assert.equal(response.paymentMethod.sourceDescription, "MasterCard 4444");
            assert.equal(response.paymentMethod.customerId, customerId);

            return done();
          });
        })
      );
    });

    context('Amex Express Checkout', () =>
      it("vaults an Amex Express Checkout Card from the nonce", done =>
        specHelper.defaultGateway.customer.create({firstName: 'John', lastName: 'Appleseed'}, function(err, response) {
          customerId = response.customer.id;

          let paymentMethodParams = {
            customerId,
            paymentMethodNonce: Nonces.AmexExpressCheckout
          };

          return specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function(err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.isNotNull(response.paymentMethod.token);
            assert.isString(response.paymentMethod.expirationMonth);
            assert.isString(response.paymentMethod.expirationYear);
            assert.isTrue(response.paymentMethod.default);
            assert.include(response.paymentMethod.imageUrl, ".png");
            assert.match(response.paymentMethod.sourceDescription, /^AmEx \d{4}$/);
            assert.match(response.paymentMethod.cardMemberNumber, /^\d{4}$/);
            assert.equal(response.paymentMethod.customerId, customerId);

            return done();
          });
        })
      )
    );

    context('Venmo Account', () =>
      it("vaults an Venmo Account from the nonce", done =>
        specHelper.defaultGateway.customer.create({firstName: 'John', lastName: 'Appleseed'}, function(err, response) {
          customerId = response.customer.id;

          let paymentMethodParams = {
            customerId,
            paymentMethodNonce: Nonces.VenmoAccount
          };

          return specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function(err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.isNotNull(response.paymentMethod.token);
            assert.isTrue(response.paymentMethod.default);
            assert.include(response.paymentMethod.imageUrl, ".png");
            assert.equal(response.paymentMethod.customerId, customerId);
            assert.equal(response.paymentMethod.username, "venmojoe");
            assert.equal(response.paymentMethod.venmoUserId, "Venmo-Joe-1");

            return done();
          });
        })
      )
    );

    context('US Bank Account', function() {
      it("vaults a US Bank Account from the nonce", done =>
        specHelper.defaultGateway.customer.create({firstName: 'John', lastName: 'Appleseed'}, function(err, response) {
          customerId = response.customer.id;
          return specHelper.generateValidUsBankAccountNonce(function(nonce) {
            let paymentMethodParams = {
              customerId,
              paymentMethodNonce: nonce
            };
            return specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function(err, response) {
              let usBankAccount = response.paymentMethod;
              assert.isNull(err);
              assert.isTrue(response.success);
              assert.isNotNull(response.paymentMethod.token);
              assert.equal(usBankAccount.last4, "1234");
              assert.equal(usBankAccount.accountHolderName, "Dan Schulman");
              assert.equal(usBankAccount.routingNumber, "021000021");
              assert.equal(usBankAccount.accountType, "checking");
              assert.match(usBankAccount.bankName, /CHASE/);

              return done();
            });
          });
        })
      );

      return it("does not vault a US Bank Account from an invalid nonce", done =>
        specHelper.defaultGateway.customer.create({firstName: 'John', lastName: 'Appleseed'}, function(err, response) {
          customerId = response.customer.id;

          let paymentMethodParams = {
            customerId,
            paymentMethodNonce: specHelper.generateInvalidUsBankAccountNonce()
          };

          return specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function(err, response) {
            assert.isFalse(response.success);
            assert.equal(response.errors.for('paymentMethod').on('paymentMethodNonce')[0].code,
              ValidationErrorCodes.PaymentMethod.PaymentMethodNonceUnknown);

            return done();
          });
        })
      );
    });

    context('Coinbase', () =>
      it("vaults a Coinbase account from the nonce", done =>
        specHelper.defaultGateway.customer.create({firstName: 'Paul', lastName: 'Gross'}, function(err, response) {
          customerId = response.customer.id;

          let paymentMethodParams = {
            customerId,
            paymentMethodNonce: Nonces.Coinbase
          };

          return specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function(err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.isNotNull(response.paymentMethod.token);
            assert.isNotNull(response.paymentMethod.customerId);

            return done();
          });
        })
      )
    );



    context('with a credit card payment method nonce', function() {
      it('creates a credit card from the nonce', done =>
        specHelper.defaultGateway.customer.create({firstName: 'John', lastName: 'Smith'}, function(err, response) {
          customerId = response.customer.id;

          return specHelper.defaultGateway.clientToken.generate({}, function(err, result) {
            let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
            let authorizationFingerprint = clientToken.authorizationFingerprint;

            let params = {
              authorizationFingerprint,
              creditCard: {
                number: '4111111111111111',
                expirationDate: '01/2020'
              }
            };

            let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig));
            return myHttp.post("/client_api/v1/payment_methods/credit_cards.json", params, function(statusCode, body) {
              let nonce = JSON.parse(body).creditCards[0].nonce;

              let creditCardParams = {
                customerId,
                paymentMethodNonce: nonce
              };

              return specHelper.defaultGateway.paymentMethod.create(creditCardParams, function(err, response) {
                assert.isNull(err);
                assert.isTrue(response.success);
                assert.equal(response.paymentMethod.maskedNumber, '411111******1111');
                assert.equal(response.paymentMethod.customerId, customerId);

                return done();
              });
            });
          });
        })
      );

      it("accepts a custom verification amount", done =>
        specHelper.defaultGateway.customer.create({}, function(err, response) {
          customerId = response.customer.id;

          return specHelper.defaultGateway.clientToken.generate({}, function(err, result) {
            let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
            let authorizationFingerprint = clientToken.authorizationFingerprint;

            let params = {
              authorizationFingerprint,
              creditCard: {
                number: '4000111111111115',
                expirationMonth: '11',
                expirationYear: '2099'
              }
            };

            let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig));
            return myHttp.post("/client_api/v1/payment_methods/credit_cards.json", params, function(statusCode, body) {
              let nonce = JSON.parse(body).creditCards[0].nonce;

              let creditCardParams = {
                paymentMethodNonce: nonce,
                customerId,
                options: {
                  verifyCard: "true",
                  verificationAmount: "1.03"
                }
              };

              return specHelper.defaultGateway.paymentMethod.create(creditCardParams, function(err, response) {
                assert.isNull(err);
                assert.isFalse(response.success);
                assert.equal(response.verification.status, 'processor_declined');

                return done();
              });
            });
          });
        })
      );

      it('respects verify_card and verification_merchant_account_id when included outside of the nonce', done =>
        specHelper.defaultGateway.customer.create({}, function(err, response) {
          customerId = response.customer.id;

          return specHelper.defaultGateway.clientToken.generate({}, function(err, result) {
            let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
            let authorizationFingerprint = clientToken.authorizationFingerprint;

            let params = {
              authorizationFingerprint,
              creditCard: {
                number: '4000111111111115',
                expirationMonth: '11',
                expirationYear: '2099'
              }
            };

            let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig));
            return myHttp.post("/client_api/v1/payment_methods/credit_cards.json", params, function(statusCode, body) {
              let nonce = JSON.parse(body).creditCards[0].nonce;

              let creditCardParams = {
                paymentMethodNonce: nonce,
                customerId,
                options: {
                  verifyCard: "true",
                  verificationMerchantAccountId: specHelper.nonDefaultMerchantAccountId
                }
              };

              return specHelper.defaultGateway.paymentMethod.create(creditCardParams, function(err, response) {
                assert.isNull(err);
                assert.isFalse(response.success);

                assert.equal(response.verification.status, 'processor_declined');
                assert.equal(response.verification.processorResponseCode, '2000');
                assert.equal(response.verification.processorResponseText, 'Do Not Honor');
                assert.equal(response.verification.merchantAccountId, specHelper.nonDefaultMerchantAccountId);

                return done();
              });
            });
          });
        })
      );

      it('respects failOnDuplicatePaymentMethod when included outside of the nonce', done =>
        specHelper.defaultGateway.customer.create({}, function(err, response) {
          customerId = response.customer.id;

          let creditCardParams = {
            customerId,
            number: '4111111111111111',
            expirationDate: '05/2012'
          };

          specHelper.defaultGateway.creditCard.create(creditCardParams, function(err, response) {
            assert.isNull(err);
            return assert.isTrue(response.success);
          });

          return specHelper.defaultGateway.clientToken.generate({}, function(err, result) {
            let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
            let authorizationFingerprint = clientToken.authorizationFingerprint;

            let params = {
              authorizationFingerprint,
              creditCard: {
                number: '4111111111111111',
                expirationDate: '05/2012'
              }
            };

            let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig));
            return myHttp.post("/client_api/v1/payment_methods/credit_cards.json", params, function(statusCode, body) {
              let nonce = JSON.parse(body).creditCards[0].nonce;

              creditCardParams = {
                customerId,
                paymentMethodNonce: nonce,
                options: {
                  failOnDuplicatePaymentMethod: 'true'
                }
              };

              return specHelper.defaultGateway.paymentMethod.create(creditCardParams, function(err, response) {
                assert.isNull(err);
                assert.isFalse(response.success);
                assert.equal(response.errors.deepErrors()[0].code, '81724');

                return done();
              });
            });
          });
        })
      );

      it('allows passing the billing address outside of the nonce', done =>
        specHelper.defaultGateway.customer.create({}, function(err, response) {
          customerId = response.customer.id;

          return specHelper.defaultGateway.clientToken.generate({}, function(err, result) {
            let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
            let authorizationFingerprint = clientToken.authorizationFingerprint;

            let params = {
              authorizationFingerprint,
              creditCard: {
                number: '4111111111111111',
                expirationMonth: '12',
                expirationYear: '2020',
                options: {
                  validate: 'false'
                }
              }
            };

            let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig));
            return myHttp.post("/client_api/v1/payment_methods/credit_cards.json", params, function(statusCode, body) {
              let nonce = JSON.parse(body).creditCards[0].nonce;

              let creditCardParams = {
                paymentMethodNonce: nonce,
                customerId,
                billingAddress: {
                  streetAddress: "123 Abc Way"
                }
              };

              return specHelper.defaultGateway.paymentMethod.create(creditCardParams, function(err, response) {
                assert.isNull(err);
                assert.isTrue(response.success);

                assert.isTrue(response.paymentMethod.constructor.name === "CreditCard");
                let token = response.paymentMethod.token;
                return specHelper.defaultGateway.paymentMethod.find(token, function(err, creditCard) {
                  assert.isNull(err);
                  assert.isTrue(creditCard !== null);
                  assert.equal(creditCard.billingAddress.streetAddress, "123 Abc Way");

                  return done();
                });
              });
            });
          });
        })
      );

      it('overrides the billing address in the nonce', done =>
        specHelper.defaultGateway.customer.create({}, function(err, response) {
          customerId = response.customer.id;

          return specHelper.defaultGateway.clientToken.generate({}, function(err, result) {
            let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
            let authorizationFingerprint = clientToken.authorizationFingerprint;

            let params = {
              authorizationFingerprint,
              creditCard: {
                number: '4111111111111111',
                expirationMonth: '12',
                expirationYear: '2020',
                options: {
                  validate: 'false'
                },
                billingAddress: {
                  streetAddress: "456 Xyz Way"
                }
              }
            };

            let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig));
            return myHttp.post("/client_api/v1/payment_methods/credit_cards.json", params, function(statusCode, body) {
              let nonce = JSON.parse(body).creditCards[0].nonce;

              let creditCardParams = {
                paymentMethodNonce: nonce,
                customerId,
                billingAddress: {
                  streetAddress: "123 Abc Way"
                }
              };

              return specHelper.defaultGateway.paymentMethod.create(creditCardParams, function(err, response) {
                assert.isNull(err);
                assert.isTrue(response.success);

                assert.isTrue(response.paymentMethod.constructor.name === "CreditCard");
                let token = response.paymentMethod.token;
                return specHelper.defaultGateway.paymentMethod.find(token, function(err, creditCard) {
                  assert.isNull(err);
                  assert.isTrue(creditCard !== null);
                  assert.equal(creditCard.billingAddress.streetAddress, "123 Abc Way");

                  return done();
                });
              });
            });
          });
        })
      );

      it('does not override the billing address for a vaulted credit card', done =>
        specHelper.defaultGateway.customer.create({}, function(err, response) {
          customerId = response.customer.id;

          return specHelper.defaultGateway.clientToken.generate({customerId}, function(err, result) {
            let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
            let authorizationFingerprint = clientToken.authorizationFingerprint;

            let params = {
              authorizationFingerprint,
              creditCard: {
                number: '4111111111111111',
                expirationMonth: '12',
                expirationYear: '2020',
                billingAddress: {
                  streetAddress: "456 Xyz Way"
                }
              }
            };

            let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig));
            return myHttp.post("/client_api/v1/payment_methods/credit_cards.json", params, function(statusCode, body) {
              assert.equal(statusCode, "201");
              let nonce = JSON.parse(body).creditCards[0].nonce;

              let creditCardParams = {
                paymentMethodNonce: nonce,
                customerId,
                billingAddress: {
                  streetAddress: "123 Abc Way"
                }
              };

              return specHelper.defaultGateway.paymentMethod.create(creditCardParams, function(err, response) {
                assert.isNull(err);
                assert.isTrue(response.success);

                assert.isTrue(response.paymentMethod.constructor.name === "CreditCard");
                let token = response.paymentMethod.token;
                return specHelper.defaultGateway.paymentMethod.find(token, function(err, creditCard) {
                  assert.isNull(err);
                  assert.isTrue(creditCard !== null);
                  assert.equal(creditCard.billingAddress.streetAddress, "456 Xyz Way");

                  return done();
                });
              });
            });
          });
        })
      );

      return it('allows passing a billing address id outside of the nonce', done =>
        specHelper.defaultGateway.customer.create({}, function(err, response) {
          customerId = response.customer.id;

          return specHelper.defaultGateway.clientToken.generate({}, function(err, result) {
            let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
            let authorizationFingerprint = clientToken.authorizationFingerprint;

            let params = {
              authorizationFingerprint,
              creditCard: {
                number: '4111111111111111',
                expirationMonth: '12',
                expirationYear: '2020',
                options: {
                  validate: 'false'
                }
              }
            };

            let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig));
            return myHttp.post("/client_api/v1/payment_methods/credit_cards.json", params, function(statusCode, body) {
              let nonce = JSON.parse(body).creditCards[0].nonce;

              let addressParams = {
                customerId,
                firstName: "Bobby",
                lastName: "Tables"
              };

              return specHelper.defaultGateway.address.create(addressParams, function(err, response) {
                assert.isNull(err);
                assert.isTrue(response.success);

                let creditCardParams = {
                  paymentMethodNonce: nonce,
                  customerId,
                  billingAddressId: response.address.id
                };

                return specHelper.defaultGateway.paymentMethod.create(creditCardParams, function(err, response) {
                  assert.isNull(err);
                  assert.isTrue(response.success);

                  assert.isTrue(response.paymentMethod.constructor.name === "CreditCard");
                  let token = response.paymentMethod.token;
                  return specHelper.defaultGateway.paymentMethod.find(token, function(err, creditCard) {
                    assert.isNull(err);
                    assert.isTrue(creditCard !== null);
                    assert.equal(creditCard.billingAddress.firstName, "Bobby");
                    assert.equal(creditCard.billingAddress.lastName, "Tables");

                    return done();
                  });
                });
              });
            });
          });
        })
      );
    });

    context('with a paypal account payment method nonce', function() {
      before(done =>
        specHelper.defaultGateway.customer.create({firstName: 'John', lastName: 'Smith'}, function(err, response) {
          customerId = response.customer.id;
          return done();
        })
      );

      it('does not return an error if credit card options are present for a paypal nonce', done =>
        specHelper.defaultGateway.customer.create({}, function(err, response) {
          customerId = response.customer.id;

          return specHelper.defaultGateway.clientToken.generate({}, function(err, result) {
            let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
            let authorizationFingerprint = clientToken.authorizationFingerprint;

            let params = {
              authorizationFingerprint,
              paypalAccount: {
                consentCode: 'consent-code'
              }
            };

            let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig));
            return myHttp.post("/client_api/v1/payment_methods/paypal_accounts.json", params, function(statusCode, body) {
              let nonce = JSON.parse(body).paypalAccounts[0].nonce;

              let paypalAccountParams = {
                paymentMethodNonce: nonce,
                customerId,
                options: {
                  verifyCard: "true",
                  failOnDuplicatePaymentMethod: "true",
                  verificationMerchantAccountId: "notARealMerchantAccountId"
                }
              };

              return specHelper.defaultGateway.paymentMethod.create(paypalAccountParams, function(err, response) {
                assert.isNull(err);
                assert.isTrue(response.success);

                assert.equal(response.paymentMethod.constructor.name, "PayPalAccount");
                assert.isTrue(response.paymentMethod.imageUrl !== null);
                let token = response.paymentMethod.token;
                return specHelper.defaultGateway.paymentMethod.find(token, function(err, paypalAccount) {
                  assert.isNull(err);
                  assert.isTrue(paypalAccount !== null);
                  assert.equal(paypalAccount.customerId, customerId);

                  return done();
                });
              });
            });
          });
        })
      );

      it('ignores passed billing address params', done =>
        specHelper.defaultGateway.customer.create({}, function(err, response) {
          customerId = response.customer.id;

          return specHelper.defaultGateway.clientToken.generate({}, function(err, result) {
            let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
            let authorizationFingerprint = clientToken.authorizationFingerprint;

            let params = {
              authorizationFingerprint,
              paypalAccount: {
                consentCode: 'PAYPAL_CONSENT_CODE'
              }
            };

            let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig));
            return myHttp.post("/client_api/v1/payment_methods/paypal_accounts.json", params, function(statusCode, body) {
              let nonce = JSON.parse(body).paypalAccounts[0].nonce;

              let paypalAccountParams = {
                paymentMethodNonce: nonce,
                customerId,
                billingAddress: {
                  streetAddress: "123 Abc Way"
                }
              };

              return specHelper.defaultGateway.paymentMethod.create(paypalAccountParams, function(err, response) {
                assert.isNull(err);
                assert.isTrue(response.success);

                assert.equal(response.paymentMethod.constructor.name, "PayPalAccount");
                assert.isTrue(response.paymentMethod.imageUrl !== null);
                let token = response.paymentMethod.token;
                return specHelper.defaultGateway.paymentMethod.find(token, function(err, paypalAccount) {
                  assert.isNull(err);
                  assert.isTrue(paypalAccount !== null);

                  return done();
                });
              });
            });
          });
        })
      );

      return it('ignores passed billing address id', done =>
        specHelper.defaultGateway.customer.create({}, function(err, response) {
          customerId = response.customer.id;

          return specHelper.defaultGateway.clientToken.generate({}, function(err, result) {
            let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
            let authorizationFingerprint = clientToken.authorizationFingerprint;

            let params = {
              authorizationFingerprint,
              paypalAccount: {
                consentCode: 'PAYPAL_CONSENT_CODE'
              }
            };

            let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig));
            return myHttp.post("/client_api/v1/payment_methods/paypal_accounts.json", params, function(statusCode, body) {
              let nonce = JSON.parse(body).paypalAccounts[0].nonce;

              let paypalAccountParams = {
                paymentMethodNonce: nonce,
                customerId,
                billingAddressId: "address_id"
              };

              return specHelper.defaultGateway.paymentMethod.create(paypalAccountParams, function(err, response) {
                assert.isNull(err);
                assert.isTrue(response.success);

                assert.equal(response.paymentMethod.constructor.name, "PayPalAccount");
                assert.isTrue(response.paymentMethod.imageUrl !== null);
                let token = response.paymentMethod.token;
                return specHelper.defaultGateway.paymentMethod.find(token, function(err, paypalAccount) {
                  assert.isNull(err);
                  assert.isTrue(paypalAccount !== null);

                  return done();
                });
              });
            });
          });
        })
      );
    });

    it("creates a paypal account from a payment method nonce", done =>
      specHelper.defaultGateway.customer.create({}, function(err, response) {
        customerId = response.customer.id;
        return specHelper.defaultGateway.clientToken.generate({}, function(err, result) {
          let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
          let authorizationFingerprint = clientToken.authorizationFingerprint;

          let params = {
            authorizationFingerprint,
            paypalAccount: {
              consentCode: 'PAYPAL_CONSENT_CODE'
            }
          };

          let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig));
          return myHttp.post("/client_api/v1/payment_methods/paypal_accounts.json", params, function(statusCode, body) {
            let nonce = JSON.parse(body).paypalAccounts[0].nonce;
            let paypalAccountParams = {
              customerId,
              paymentMethodNonce: nonce
            };

            return specHelper.defaultGateway.paymentMethod.create(paypalAccountParams, function(err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);
              assert.isString(response.paymentMethod.email);
              assert.isString(response.paymentMethod.imageUrl);
              assert.isString(response.paymentMethod.customerId);
              return done();
            });
          });
        });
      })
    );

    it("can create a payment method and set the token and default", done =>
      specHelper.defaultGateway.customer.create({}, function(err, response) {
        customerId = response.customer.id;
        let creditCardParams = {
          customerId,
          number: '5105105105105100',
          expirationDate: '05/2012'
        };

        return specHelper.defaultGateway.creditCard.create(creditCardParams, (err, response) =>
          specHelper.defaultGateway.clientToken.generate({}, function(err, result) {
            let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
            let authorizationFingerprint = clientToken.authorizationFingerprint;

            let params = {
              authorizationFingerprint,
              creditCard: {
                number: '4111111111111111',
                expirationDate: '01/2020'
              }
            };

            let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig));
            return myHttp.post("/client_api/v1/payment_methods/credit_cards.json", params, function(statusCode, body) {
              let nonce = JSON.parse(body).creditCards[0].nonce;

              let paymentMethodToken = specHelper.randomId();
              creditCardParams = {
                customerId,
                paymentMethodNonce: nonce,
                token: paymentMethodToken,
                options: {
                  makeDefault: true
                }
              };

              return specHelper.defaultGateway.paymentMethod.create(creditCardParams, function(err, response) {
                assert.isNull(err);
                assert.isTrue(response.success);
                assert.isTrue(response.paymentMethod.default);
                assert.equal(response.paymentMethod.token, paymentMethodToken);
                assert.equal(response.paymentMethod.customerId, customerId);

                return done();
              });
            });
          })
        );
      })
    );

    it("returns an error when trying to create a paypal account only authorized for one-time use", done =>
      specHelper.defaultGateway.customer.create({}, function(err, response) {
        customerId = response.customer.id;

        return specHelper.defaultGateway.clientToken.generate({}, function(err, result) {
          let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
          let authorizationFingerprint = clientToken.authorizationFingerprint;

          let params = {
            authorizationFingerprint,
            paypalAccount: {
              accessToken: 'PAYPAL_ACCESS_TOKEN'
            }
          };

          let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig));
          return myHttp.post("/client_api/v1/payment_methods/paypal_accounts.json", params, function(statusCode, body) {
            let nonce = JSON.parse(body).paypalAccounts[0].nonce;
            let paypalAccountParams = {
              customerId,
              paymentMethodNonce: nonce
            };

            return specHelper.defaultGateway.paymentMethod.create(paypalAccountParams, function(err, response) {
              assert.isNull(err);
              assert.isFalse(response.success);
              assert.equal(
                response.errors.for('paypalAccount').on('base')[0].code,
                '82902'
              );

              return done();
            });
          });
        });
      })
    );

    it("handles errors", done =>
      specHelper.defaultGateway.customer.create({}, function(err, response) {
        customerId = response.customer.id;

        return specHelper.defaultGateway.clientToken.generate({}, function(err, result) {
          let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
          let authorizationFingerprint = clientToken.authorizationFingerprint;

          let params = {
            authorizationFingerprint,
            paypalAccount: {}
          };

          let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig));
          return myHttp.post("/client_api/v1/payment_methods/paypal_accounts.json", params, function(statusCode, body) {
            let nonce = JSON.parse(body).paypalAccounts[0].nonce;
            let paypalAccountParams = {
              customerId,
              paymentMethodNonce: nonce
            };

            return specHelper.defaultGateway.paymentMethod.create(paypalAccountParams, function(err, response) {
              assert.isFalse(response.success);
              assert.equal(response.errors.for('paypalAccount').on('base')[0].code, '82902');

              return done();
            });
          });
        });
      })
    );

    return context('with a fake apple pay nonce', function() {
      before(done =>
        specHelper.defaultGateway.customer.create({firstName: 'John', lastName: 'Smith'}, function(err, response) {
          customerId = response.customer.id;
          return done();
        })
      );

      return it('creates a payment method', done =>
        specHelper.defaultGateway.customer.create({}, function(err, response) {
          customerId = response.customer.id;

          let applePayCardParams = {
            paymentMethodNonce: Nonces.ApplePayMasterCard,
            customerId
          };

          return specHelper.defaultGateway.paymentMethod.create(applePayCardParams, function(err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);

            let token = response.paymentMethod.token;
            return specHelper.defaultGateway.paymentMethod.find(token, function(err, applePayCard) {
              assert.isNull(err);
              assert.isTrue(applePayCard !== null);

              return done();
            });
          });
        })
      );
    });
  });

  describe("find", function() {
    context('credit card', function() {
      let paymentMethodToken = null;

      before(done =>
        specHelper.defaultGateway.customer.create({firstName: 'John', lastName: 'Smith'}, function(err, response) {
          let customerId = response.customer.id;
          paymentMethodToken = specHelper.randomId();

          return specHelper.defaultGateway.clientToken.generate({}, function(err, result) {
            let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
            let authorizationFingerprint = clientToken.authorizationFingerprint;
            let params = {
              authorizationFingerprint,
              creditCard: {
                token: paymentMethodToken,
                number: '4111111111111111',
                expirationDate: '01/2020'
              }
            };

            let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig));
            return myHttp.post("/client_api/v1/payment_methods/credit_cards.json", params, function(statusCode, body) {
              let nonce = JSON.parse(body).creditCards[0].nonce;
              let paymentMethodParams = {
                customerId,
                paymentMethodNonce: nonce
              };
              return specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, (err, creditCard) => done());
            });
          });
        })
      );

      return it('finds the card', done =>
        specHelper.defaultGateway.paymentMethod.find(paymentMethodToken, function(err, creditCard) {
          assert.isNull(err);
          assert.equal(creditCard.maskedNumber, '411111******1111');

          return done();
        })
      );
    });

    context('paypal account', () =>
      it("finds the paypal account", done =>
        specHelper.defaultGateway.customer.create({}, function(err, response) {
          let paymentMethodParams = {
            customerId: response.customer.id,
            paymentMethodNonce: Nonces.PayPalFuturePayment
          };

          return specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function(err, response) {
            let paymentMethodToken = response.paymentMethod.token;
            return specHelper.defaultGateway.paymentMethod.find(paymentMethodToken, function(err, paypalAccount) {
              assert.isNull(err);
              assert.isString(paypalAccount.email);

              return done();
            });
          });
        })
      )
    );

    context('android pay card', () =>
      it("finds the android pay card", done =>
        specHelper.defaultGateway.customer.create({}, function(err, response) {
          let paymentMethodParams = {
            customerId: response.customer.id,
            paymentMethodNonce: Nonces.AndroidPay
          };

          return specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function(err, response) {
            let paymentMethodToken = response.paymentMethod.token;
            return specHelper.defaultGateway.paymentMethod.find(paymentMethodToken, function(err, androidPayCard) {
              assert.isNull(err);
              assert.isString(androidPayCard.googleTransactionId);
              assert.equal(androidPayCard.cardType, specHelper.braintree.CreditCard.CardType.Discover);
              assert.equal(androidPayCard.virtualCardType, specHelper.braintree.CreditCard.CardType.Discover);
              assert.equal(androidPayCard.last4, "1117");
              assert.isString(androidPayCard.expirationMonth);
              assert.isString(androidPayCard.expirationYear);
              assert.isTrue(androidPayCard.default);
              assert.include(androidPayCard.imageUrl, "android_pay");
              assert.equal(androidPayCard.sourceCardType, specHelper.braintree.CreditCard.CardType.Visa);
              assert.equal(androidPayCard.sourceCardLast4, "1111");

              return done();
            });
          });
        })
      )
    );

    return context('unkown payment method', () =>
      it("finds the unknown payment method", done =>
        specHelper.defaultGateway.customer.create({}, function(err, response) {
          let paymentMethodParams = {
            customerId: response.customer.id,
            paymentMethodNonce: Nonces.AbstractTransactable
          };

          return specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function(err, response) {
            let paymentMethodToken = response.paymentMethod.token;
            return specHelper.defaultGateway.paymentMethod.find(paymentMethodToken, function(err, paymentMethod) {
              assert.isNull(err);
              assert.isString(paymentMethod.token);

              return done();
            });
          });
        })
      )
    );
  });

  it("handles not finding the paypal account", done =>
     specHelper.defaultGateway.paymentMethod.find('NON_EXISTENT_TOKEN', function(err, paypalAccount) {
       assert.equal(err.type, braintree.errorTypes.notFoundError);

       return done();
     })
   );

  it("handles whitespace", done =>
      specHelper.defaultGateway.paymentMethod.find(' ', function(err, paypalAccount) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);

        return done();
      })
   );

  describe("update", function() {
    context('credit card', function() {

      it("updates the credit card", done =>
        specHelper.defaultGateway.customer.create({}, function(err, response) {
          let customerId = response.customer.id;

          let creditCardParams = {
            cardholderName: 'Original Holder',
            customerId,
            cvv: '123',
            number: '4012888888881881',
            expirationDate: '05/2012'
          };

          return specHelper.defaultGateway.creditCard.create(creditCardParams, function(err, response) {
            assert.isTrue(response.success);

            let creditCard = response.creditCard;

            let updateParams = {
              cardholderName: 'New Holder',
              cvv: '456',
              number: '5555555555554444',
              expirationDate: '06/2013'
            };

            return specHelper.defaultGateway.paymentMethod.update(creditCard.token, updateParams, function(err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);
              assert.equal(response.paymentMethod.token, creditCard.token);
              let updatedCreditCard = response.paymentMethod;
              assert.equal(updatedCreditCard.cardholderName, 'New Holder');
              assert.equal(updatedCreditCard.bin, '555555');
              assert.equal(updatedCreditCard.last4, '4444');
              assert.equal(updatedCreditCard.expirationDate, '06/2013');

              return done();
            });
          });
        })
      );

      it("handles a not found error correctly", done =>
        specHelper.defaultGateway.customer.create({}, function(err, response) {
          let customerId = response.customer.id;
          let updateParams = {
            cardholderName: 'New Holder',
            cvv: '456',
            number: '5555555555554444',
            expirationDate: '06/2013'
          };

          return specHelper.defaultGateway.paymentMethod.update("doesNotExist", updateParams, function(err, response) {
            assert.isNull(response);
            assert.isNotNull(err);
            return done();
          });
        })
      );

      it("can pass expirationMonth and expirationYear", done =>
        specHelper.defaultGateway.customer.create({}, function(err, response) {
          let customerId = response.customer.id;

          let creditCardParams = {
            customerId,
            number: '4012888888881881',
            expirationDate: '05/2012'
          };

          return specHelper.defaultGateway.creditCard.create(creditCardParams, function(err, response) {
            assert.isTrue(response.success);

            let creditCard = response.creditCard;

            let updateParams = {
              expirationMonth: '07',
              expirationYear: '2011'
            };

            return specHelper.defaultGateway.paymentMethod.update(creditCard.token, updateParams, function(err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);
              let updatedCreditCard = response.paymentMethod;
              assert.equal(updatedCreditCard.expirationMonth, '07');
              assert.equal(updatedCreditCard.expirationYear, '2011');
              assert.equal(updatedCreditCard.expirationDate, '07/2011');

              return done();
            });
          });
        })
      );

      it("verifies the update if options[verify_card]=true", done =>
        specHelper.defaultGateway.customer.create({}, function(err, response) {
          let customerId = response.customer.id;

          let creditCardParams = {
            cardholderName: 'Original Holder',
            customerId,
            cvv: '123',
            number: '4012888888881881',
            expirationDate: '05/2012'
          };

          return specHelper.defaultGateway.creditCard.create(creditCardParams, function(err, response) {
            assert.isTrue(response.success);

            let creditCard = response.creditCard;

            let updateParams = {
              cardholderName: 'New Holder',
              cvv: '456',
              number: '5105105105105100',
              expirationDate: '06/2013',
              options: {
                verifyCard: 'true'
              }
            };

            return specHelper.defaultGateway.paymentMethod.update(creditCard.token, updateParams, function(err, response) {
              assert.isFalse(response.success);
              assert.equal(response.verification.status, 'processor_declined');
              assert.isNull(response.verification.gatewayRejectionReason);

              return done();
            });
          });
        })
      );

      it("can pass a custom verification amount", done =>
        specHelper.defaultGateway.customer.create({}, function(err, response) {
          let customerId = response.customer.id;

          let creditCardParams = {
            cardholderName: 'Card Holder',
            customerId,
            cvv: '123',
            number: '4012888888881881',
            expirationDate: '05/2020'
          };

          return specHelper.defaultGateway.creditCard.create(creditCardParams, function(err, response) {
            assert.isTrue(response.success);

            let creditCard = response.creditCard;

            let updateParams = {
              paymentMethodNonce: Nonces.ProcessorDeclinedMasterCard,
              options: {
                verifyCard: 'true',
                verificationAmount: '2.34'
              }
            };

            return specHelper.defaultGateway.paymentMethod.update(creditCard.token, updateParams, function(err, response) {
              assert.isFalse(response.success);
              assert.equal(response.verification.status, 'processor_declined');
              assert.isNull(response.verification.gatewayRejectionReason);

              return done();
            });
          });
        })
      );

      it("returns an error if invalid", done =>
        specHelper.defaultGateway.customer.create({}, function(err, response) {
          let customerId = response.customer.id;

          let creditCardParams = {
            cardholderName: 'Original Holder',
            customerId,
            number: '4012888888881881',
            expirationDate: '05/2012'
          };

          return specHelper.defaultGateway.creditCard.create(creditCardParams, function(err, response) {
            assert.isTrue(response.success);

            let creditCard = response.creditCard;

            let updateParams = {
              cardholderName: 'New Holder',
              number: 'invalid',
              expirationDate: '05/2014'
            };

            return specHelper.defaultGateway.paymentMethod.update(creditCard.token, updateParams, function(err, response) {
              assert.isFalse(response.success);
              assert.equal(response.errors.for('creditCard').on('number')[0].message, "Credit card number must be 12-19 digits.");

              return done();
            });
          });
        })
      );

      it("can update the default", done =>
        specHelper.defaultGateway.customer.create({}, function(err, response) {
          let customerId = response.customer.id;

          let creditCardParams = {
            customerId,
            number: '4012888888881881',
            expirationDate: '05/2009'
          };

          return specHelper.defaultGateway.creditCard.create(creditCardParams, function(err, response) {
            assert.isTrue(response.success);

            let creditCard1 = response.creditCard;

            return specHelper.defaultGateway.creditCard.create(creditCardParams, function(err, response) {
              assert.isTrue(response.success);

              let creditCard2 = response.creditCard;

              assert.isTrue(creditCard1.default);
              assert.isFalse(creditCard2.default);

              let updateParams = {
                options: {
                  makeDefault: 'true'
                }
              };

              return specHelper.defaultGateway.paymentMethod.update(creditCard2.token, updateParams, function(err, response) {
                assert.isNull(err);
                assert.isTrue(response.success);
                specHelper.defaultGateway.paymentMethod.find(creditCard1.token, function(err, creditCard) {
                  assert.isNull(err);
                  return assert.isFalse(creditCard.default);
                });

                specHelper.defaultGateway.paymentMethod.find(creditCard2.token, function(err, creditCard) {
                  assert.isNull(err);
                  return assert.isTrue(creditCard.default);
                });

                return done();
              });
            });
          });
        })
      );

      return context('billing address', function() {
        it("creates a new billing address by default", done =>
          specHelper.defaultGateway.customer.create({}, function(err, response) {
            let customerId = response.customer.id;

            let creditCardParams = {
              customerId,
              number: '4012888888881881',
              expirationDate: '05/2012',
              billingAddress: {
                streetAddress: "123 Nigeria Ave"
              }
            };

            return specHelper.defaultGateway.creditCard.create(creditCardParams, function(err, response) {
              assert.isTrue(response.success);

              let creditCard = response.creditCard;

              let updateParams = {
                billingAddress: {
                  region: "IL"
                }
              };

              return specHelper.defaultGateway.paymentMethod.update(creditCard.token, updateParams, function(err, response) {
                assert.isNull(err);
                assert.isTrue(response.success);
                let updatedCreditCard = response.paymentMethod;
                assert.equal(updatedCreditCard.billingAddress.region, 'IL');
                assert.isNull(updatedCreditCard.billingAddress.streetAddress);
                let differentAddresses = (updatedCreditCard.billingAddress.id !== creditCard.billingAddress.id);
                assert.isTrue(differentAddresses);

                return done();
              });
            });
          })
        );

        it("updates the billing address if option is specified", done =>
          specHelper.defaultGateway.customer.create({}, function(err, response) {
            let customerId = response.customer.id;

            let creditCardParams = {
              customerId,
              number: '4012888888881881',
              expirationDate: '05/2012',
              billingAddress: {
                streetAddress: "123 Nigeria Ave"
              }
            };

            return specHelper.defaultGateway.creditCard.create(creditCardParams, function(err, response) {
              assert.isTrue(response.success);

              let creditCard = response.creditCard;

              let updateParams = {
                billingAddress: {
                  options: {
                    updateExisting: 'true'
                  },
                  region: "IL"
                }
              };

              return specHelper.defaultGateway.paymentMethod.update(creditCard.token, updateParams, function(err, response) {
                assert.isNull(err);
                assert.isTrue(response.success);
                let updatedCreditCard = response.paymentMethod;
                assert.equal(updatedCreditCard.billingAddress.region, 'IL');
                assert.equal(updatedCreditCard.billingAddress.streetAddress, '123 Nigeria Ave');
                let sameAddresses = (updatedCreditCard.billingAddress.id === creditCard.billingAddress.id);
                assert.isTrue(sameAddresses);

                return done();
              });
            });
          })
        );

        it("updates the country via codes", done =>
          specHelper.defaultGateway.customer.create({}, function(err, response) {
            let customerId = response.customer.id;

            let creditCardParams = {
              customerId,
              number: '4012888888881881',
              expirationDate: '05/2012',
              billingAddress: {
                streetAddress: "123 Nigeria Ave"
              }
            };

            return specHelper.defaultGateway.creditCard.create(creditCardParams, function(err, response) {
              assert.isTrue(response.success);

              let creditCard = response.creditCard;

              let updateParams = {
                billingAddress: {
                  countryName: "American Samoa",
                  countryCodeAlpha2: "AS",
                  countryCodeAlpha3: "ASM",
                  countryCodeNumeric: "016",
                  options: {
                    updateExisting: 'true'
                  }
                }
              };

              return specHelper.defaultGateway.paymentMethod.update(creditCard.token, updateParams, function(err, response) {
                assert.isNull(err);
                assert.isTrue(response.success);
                let updatedCreditCard = response.paymentMethod;
                assert.equal(updatedCreditCard.billingAddress.countryName, 'American Samoa');
                assert.equal(updatedCreditCard.billingAddress.countryCodeAlpha2, 'AS');
                assert.equal(updatedCreditCard.billingAddress.countryCodeAlpha3, 'ASM');
                assert.equal(updatedCreditCard.billingAddress.countryCodeNumeric, '016');

                return done();
              });
            });
          })
        );

        return it("can update the billing address", done =>
          specHelper.defaultGateway.customer.create({}, function(err, response) {
            let customerId = response.customer.id;

            let creditCardParams = {
              cardholder_name: 'Original Holder',
              customerId,
              cvv: '123',
              number: '4012888888881881',
              expirationDate: '05/2012',
              billingAddress: {
                firstName: "Old First Name",
                lastName: "Old Last Name",
                Company: "Old Company",
                streetAddress: "123 Old St",
                extendedAddress: "Apt Old",
                locality: "Old City",
                region: "Old State",
                postalCode: "12345",
                countryName: "Canada"
              }
            };

            return specHelper.defaultGateway.creditCard.create(creditCardParams, function(err, response) {
              assert.isTrue(response.success);

              let creditCard = response.creditCard;

              let updateParams = {
                options: {
                  verifyCard: 'false'
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
                  countryName: "United States of America"
                }
              };

              return specHelper.defaultGateway.paymentMethod.update(creditCard.token, updateParams, function(err, response) {
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
                assert.equal(address.countryName, "United States of America");

                return done();
              });
            });
          })
        );
      });
    });

    context('coinbase', () =>

      it("updates a coinbase account's default flag", done =>
        specHelper.defaultGateway.customer.create({}, function(err, response) {
          let customerId = response.customer.id;

          let creditCardParams = {
            customerId,
            number: '4012888888881881',
            expirationDate: '05/2009'
          };

          return specHelper.defaultGateway.creditCard.create(creditCardParams, function(err, response) {
            assert.isTrue(response.success);
            assert.isTrue(response.creditCard.default);

            let paymentMethodParams = {
              customerId,
              paymentMethodNonce: Nonces.Coinbase
            };

            return specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function(err, response) {
              assert.isTrue(response.success);
              assert.isFalse(response.paymentMethod.default);

              let coinbaseAccount = response.coinbaseAccount;

              let updateParams = {
                options: {
                  makeDefault: 'true'
                }
              };

              return specHelper.defaultGateway.paymentMethod.update(coinbaseAccount.token, updateParams, function(err, response) {
                assert.isNull(err);
                assert.isTrue(response.success);
                assert.equal(response.paymentMethod.token, coinbaseAccount.token);
                assert.isTrue(response.paymentMethod.default);

                return done();
              });
            });
          });
        })
      )
    );

    return context('paypal accounts', function() {

      it("updates a paypal account's token", done =>
        specHelper.defaultGateway.customer.create({}, function(err, response) {
          let customerId = response.customer.id;
          let originalToken = `paypal-account-${specHelper.randomId()}`;

          return specHelper.defaultGateway.clientToken.generate({}, function(err, result) {
            let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
            let authorizationFingerprint = clientToken.authorizationFingerprint;

            let params = {
              authorizationFingerprint,
              paypalAccount: {
                consentCode: 'consent-code',
                token: originalToken
              }
            };

            let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig));
            return myHttp.post("/client_api/v1/payment_methods/paypal_accounts.json", params, function(statusCode, body) {
              let nonce = JSON.parse(body).paypalAccounts[0].nonce;
              let paypalAccountParams = {
                paymentMethodNonce: nonce,
                customerId
              };

              return specHelper.defaultGateway.paymentMethod.create(paypalAccountParams, function(err, response) {
                assert.isNull(err);
                assert.isTrue(response.success);

                let originalResult = response.paymentMethod;

                let updatedToken = `UPDATED-TOKEN-${specHelper.randomId()}`;

                let updateParams =
                  {token: updatedToken};

                return specHelper.defaultGateway.paymentMethod.update(originalToken, updateParams, function(err, response) {
                  assert.isNull(err);
                  assert.isTrue(response.success);

                  return specHelper.defaultGateway.paypalAccount.find(updatedToken, function(err, paypalAccount) {
                    assert.isNull(err);

                    assert.equal(paypalAccount.email, originalResult.email);

                    return specHelper.defaultGateway.paypalAccount.find(originalToken, function(err, paypalAccount) {
                      assert.isNull(paypalAccount);
                      assert.equal(err.type, braintree.errorTypes.notFoundError);

                      return done();
                    });
                  });
                });
              });
            });
          });
        })
      );

      it("can make a paypal account the default payment method", done =>
        specHelper.defaultGateway.customer.create({}, function(err, response) {
          let customerId = response.customer.id;

          let creditCardParams = {
            cardholderName: 'Original Holder',
            customerId,
            number: '4012888888881881',
            expirationDate: '05/2009',
            options: {
              makeDefault: 'true'
            }
          };

          return specHelper.defaultGateway.creditCard.create(creditCardParams, function(err, response) {
            assert.isTrue(response.success);

            let creditCard = response.creditCard;

            return specHelper.defaultGateway.clientToken.generate({}, function(err, result) {
              let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
              let authorizationFingerprint = clientToken.authorizationFingerprint;

              let params = {
                authorizationFingerprint,
                paypalAccount: {
                  consentCode: 'consent-code'
                }
              };

              let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig));
              return myHttp.post("/client_api/v1/payment_methods/paypal_accounts.json", params, function(statusCode, body) {
                let nonce = JSON.parse(body).paypalAccounts[0].nonce;
                let paypalAccountParams = {
                  paymentMethodNonce: nonce,
                  customerId
                };

                return specHelper.defaultGateway.paymentMethod.create(paypalAccountParams, function(err, response) {
                  assert.isNull(err);
                  assert.isTrue(response.success);

                  let originalToken = response.paymentMethod.token;

                  assert.isFalse(response.paymentMethod.default);

                  let updateParams = {
                    options: {
                      makeDefault: 'true'
                    }
                  };

                  return specHelper.defaultGateway.paymentMethod.update(originalToken, updateParams, function(err, response) {
                    assert.isNull(err);
                    assert.isTrue(response.success);

                    return specHelper.defaultGateway.paypalAccount.find(originalToken, function(err, paypalAccount) {
                      assert.isTrue(paypalAccount.default);

                      return specHelper.defaultGateway.creditCard.find(creditCard.token, function(err, creditCard) {
                        assert.isFalse(creditCard.default);

                        return done();
                      });
                    });
                  });
                });
              });
            });
          });
        })
      );

      return it("returns an error if a token for account is used to attempt an update", done =>
        specHelper.defaultGateway.customer.create({}, function(err, response) {
          let customerId = response.customer.id;
          let firstToken = `paypal-account-${specHelper.randomId()}`;
          let secondToken = `paypal-account-${specHelper.randomId()}`;

          return specHelper.defaultGateway.clientToken.generate({}, function(err, result) {
            let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
            let authorizationFingerprint = clientToken.authorizationFingerprint;

            let params = {
              authorizationFingerprint,
              paypalAccount: {
                consentCode: 'consent-code',
                token: firstToken
              }
            };

            let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig));
            return myHttp.post("/client_api/v1/payment_methods/paypal_accounts.json", params, function(statusCode, body) {
              let firstNonce = JSON.parse(body).paypalAccounts[0].nonce;
              let paypalAccountParams = {
                paymentMethodNonce: firstNonce,
                customerId
              };

              return specHelper.defaultGateway.paymentMethod.create(paypalAccountParams, function(err, response) {
                assert.isNull(err);
                assert.isTrue(response.success);

                let firstResult = response.paymentMethod;

                params = {
                  authorizationFingerprint,
                  paypalAccount: {
                    consentCode: 'consent-code',
                    token: secondToken
                  }
                };

                myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig));
                return myHttp.post("/client_api/v1/payment_methods/paypal_accounts.json", params, function(statusCode, body) {
                  let secondNonce = JSON.parse(body).paypalAccounts[0].nonce;
                  paypalAccountParams = {
                    paymentMethodNonce: secondNonce,
                    customerId
                  };

                  return specHelper.defaultGateway.paymentMethod.create(paypalAccountParams, function(err, response) {
                    assert.isNull(err);
                    assert.isTrue(response.success);

                    let secondResult = response.paymentMethod;

                    let updateParams =
                      {token: secondToken};

                    return specHelper.defaultGateway.paymentMethod.update(firstToken, updateParams, function(err, response) {
                      assert.isNull(err);
                      assert.isFalse(response.success);

                      assert.equal(response.errors.deepErrors()[0].code, "92906");

                      return done();
                    });
                  });
                });
              });
            });
          });
        })
      );
    });
  });

  describe("delete", function(done) {
    let paymentMethodToken = null;

    context('credit card', function() {
      before(done =>
        specHelper.defaultGateway.customer.create({}, function(err, response) {
          let customerId = response.customer.id;

          return specHelper.defaultGateway.clientToken.generate({}, function(err, result) {
            let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
            let authorizationFingerprint = clientToken.authorizationFingerprint;
            let params = {
              authorizationFingerprint,
              creditCard: {
                number: '4111111111111111',
                expirationDate: '01/2020'
              }
            };

            let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig));
            return myHttp.post("/client_api/v1/payment_methods/credit_cards.json", params, function(statusCode, body) {
              let nonce = JSON.parse(body).creditCards[0].nonce;
              let paymentMethodParams = {
                customerId,
                paymentMethodNonce: nonce
              };
              return specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function(err, response) {
                paymentMethodToken = response.paymentMethod.token;
                return done();
              });
            });
          });
        })
      );

      return it('deletes the credit card', done =>
        specHelper.defaultGateway.paymentMethod.delete(paymentMethodToken, function(err) {
          assert.isNull(err);

          return specHelper.defaultGateway.paymentMethod.find(paymentMethodToken, function(err, response) {
            assert.equal(err.type, braintree.errorTypes.notFoundError);
            return done();
          });
        })
      );
    });

    context('paypal account', function() {
      before(done =>
        specHelper.defaultGateway.customer.create({}, function(err, response) {
          let customerId = response.customer.id;

          return specHelper.defaultGateway.clientToken.generate({}, function(err, result) {
            let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
            let authorizationFingerprint = clientToken.authorizationFingerprint;

            let params = {
              authorizationFingerprint,
              paypalAccount: {
                consentCode: 'PAYPAL_CONSENT_CODE'
              }
            };

            let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig));
            return myHttp.post("/client_api/v1/payment_methods/paypal_accounts.json", params, function(statusCode, body) {
              let nonce = JSON.parse(body).paypalAccounts[0].nonce;
              let paypalAccountParams = {
                customerId,
                paymentMethodNonce: nonce
              };

              return specHelper.defaultGateway.paymentMethod.create(paypalAccountParams, function(err, response) {
                paymentMethodToken = response.paymentMethod.token;
                return done();
              });
            });
          });
        })
      );


      return it("deletes the paypal account", done =>
        specHelper.defaultGateway.paymentMethod.delete(paymentMethodToken, function(err) {
          assert.isNull(err);

          return specHelper.defaultGateway.paypalAccount.find(paymentMethodToken, function(err, response) {
            assert.equal(err.type, braintree.errorTypes.notFoundError);
            return done();
          });
        })
      );
    });

    return it("handles invalid tokens", done =>
      specHelper.defaultGateway.paymentMethod.delete('NONEXISTENT_TOKEN', function(err) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);

        return done();
      })
    );
  });

  return context("grant and revoke payment methods", function() {
    let creditCard = null;
    let grantingGateway = null;

    before(function(done) {
      let partnerMerchantGateway = braintree.connect({
        merchantId: "integration_merchant_public_id",
        publicKey: "oauth_app_partner_user_public_key",
        privateKey: "oauth_app_partner_user_private_key",
        environment: Environment.Development
      });

      let customerParams = {
        firstName: "Joe",
        lastName: "Brown",
        company: "ExampleCo",
        email: "joe@example.com",
        phone: "312.555.1234",
        fax: "614.555.5678",
        website: "www.example.com"
      };

      return partnerMerchantGateway.customer.create(customerParams, function(err, response) {
        let customer = response.customer;

        let creditCardParams = {
          customerId: customer.id,
          cardholderName: "Adam Davis",
          number: "4111111111111111",
          expirationDate: "05/2009"
        };

        return partnerMerchantGateway.creditCard.create(creditCardParams, function(err, response) {
          creditCard = response.creditCard;

          let oauthGateway = braintree.connect({
            clientId: "client_id$development$integration_client_id",
            clientSecret: "client_secret$development$integration_client_secret",
            environment: Environment.Development
          });

          let accessTokenParams = {
            merchantPublicId: "integration_merchant_id",
            scope: "grant_payment_method"
          };

          return specHelper.createToken(oauthGateway, accessTokenParams, function(err, response) {
            grantingGateway = braintree.connect({
              accessToken: response.credentials.accessToken,
              environment: Environment.Development
            });
            return done();
          });
        });
      });
    });

    describe("grant", function() {
      it("returns a nonce that is transactable by a partner merchant exactly once", done =>
        grantingGateway.paymentMethod.grant(creditCard.token, { allow_vaulting: false }, function(err, response) {
          let grantResult = response;

          assert.isTrue(grantResult.success);

          let transactionParams = {
            paymentMethodNonce: grantResult.paymentMethodNonce.nonce,
            amount: Braintree.Test.TransactionAmounts.Authorize
          };

          return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
            assert.isTrue(response.success);

            return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response2) {
              assert.isFalse(response2.success);
              return done();
            });
          });
        })
      );

      it("returns a nonce that is not vaultable", done =>
        grantingGateway.paymentMethod.grant(creditCard.token, false, function(err, response) {
          let grantResult = response;

          return specHelper.defaultGateway.customer.create({}, function(err, response) {
            let pmParams = {
              customerId: response.customer.id,
              paymentMethodNonce: grantResult.paymentMethodNonce.nonce
            };

            return specHelper.defaultGateway.creditCard.create(pmParams, function(err, response) {
              assert.isFalse(response.success);
              return done();
            });
          });
        })
      );

      it("returns a nonce that is vaultable", done =>
        grantingGateway.paymentMethod.grant(creditCard.token, { allow_vaulting: true }, function(err, response) {
          let grantResult = response;

          return specHelper.defaultGateway.customer.create({}, function(err, response) {
            let pmParams = {
              customerId: response.customer.id,
              paymentMethodNonce: grantResult.paymentMethodNonce.nonce
            };

            return specHelper.defaultGateway.creditCard.create(pmParams, function(err, response) {
              assert.isTrue(response.success);
              return done();
            });
          });
        })
      );

      return it("raises an error if the token isn't found", done =>
        grantingGateway.paymentMethod.grant("not_a_real_token", false, function(err, response) {
          assert.isObject(err);
          assert.isNull(response);
          return done();
        })
      );
    });

    return describe("revoke", function() {
      it("renders a granted nonce unusable", done =>
        grantingGateway.paymentMethod.grant(creditCard.token, false, function(err, response) {
          let grantResult = response;

          return grantingGateway.paymentMethod.revoke(creditCard.token, function(err, revokeResult) {
            assert.isTrue(revokeResult.success);

            let transactionParams = {
              paymentMethodNonce: grantResult.paymentMethodNonce.nonce,
              amount: Braintree.Test.TransactionAmounts.Authorize
            };

            return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
              assert.isFalse(response.success);
              return done();
            });
          });
        })
      );

      return it("raises an error if the token isn't found", done =>
        grantingGateway.paymentMethod.revoke("not_a_real_token", function(err, response) {
          assert.isObject(err);
          assert.isNull(response);
          return done();
        })
      );
    });
  });
});
