'use strict';

require('../../spec_helper');

let { _ } = require('underscore');
let { braintree } = specHelper;
let Braintree = require('../../../lib/braintree');
let { CreditCardNumbers } = require('../../../lib/braintree/test/credit_card_numbers');
let { Nonces } = require('../../../lib/braintree/test/nonces');
let { VenmoSdk } = require('../../../lib/braintree/test/venmo_sdk');
let { CreditCard } = require('../../../lib/braintree/credit_card');
let { ValidationErrorCodes } = require('../../../lib/braintree/validation_error_codes');
let { PaymentInstrumentTypes } = require('../../../lib/braintree/payment_instrument_types');
let { Transaction } = require('../../../lib/braintree/transaction');
let { Dispute } = require('../../../lib/braintree/dispute');
let { Environment } = require('../../../lib/braintree/environment');
let { Config } = require('../../../lib/braintree/config');

describe("TransactionGateway", function() {
  describe("sale", function() {
    it("charges a card", function(done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.transaction.type, 'sale');
        assert.equal(response.transaction.amount, '5.00');
        assert.equal(response.transaction.creditCard.maskedNumber, '510510******5100');
        assert.isNull(response.transaction.voiceReferralNumber);

        return done();
      });
    });

    it("charges a card using an access token", function(done) {
      let oauthGateway = braintree.connect({
        clientId: 'client_id$development$integration_client_id',
        clientSecret: 'client_secret$development$integration_client_secret'
      });

      return specHelper.createToken(oauthGateway, {merchantPublicId: 'integration_merchant_id', scope: 'read_write'}, function(err, response) {

        let gateway = braintree.connect({
          accessToken: response.credentials.accessToken
        });

        let transactionParams = {
          amount: '5.00',
          creditCard: {
            number: '5105105105105100',
            expirationDate: '05/12'
          }
        };

        return gateway.transaction.sale(transactionParams, function(err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.type, 'sale');
          assert.equal(response.transaction.amount, '5.00');
          assert.equal(response.transaction.creditCard.maskedNumber, '510510******5100');
          assert.isNull(response.transaction.voiceReferralNumber);

          return done();
        });
      });
    });

    it("can use a customer from the vault", function(done) {
      let customerParams = {
        firstName: 'Adam',
        lastName: 'Jones',
        creditCard: {
          cardholderName: 'Adam Jones',
          number: '5105105105105100',
          expirationDate: '05/2014'
        }
      };

      return specHelper.defaultGateway.customer.create(customerParams, function(err, response) {
        let transactionParams = {
          customerId: response.customer.id,
          amount: '100.00'
        };

        return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.type, 'sale');
          assert.equal(response.transaction.customer.firstName, 'Adam');
          assert.equal(response.transaction.customer.lastName, 'Jones');
          assert.equal(response.transaction.creditCard.cardholderName, 'Adam Jones');
          assert.equal(response.transaction.creditCard.maskedNumber, '510510******5100');
          assert.equal(response.transaction.creditCard.expirationDate, '05/2014');

          return done();
        });
      });
    });

    it("can use a credit card from the vault", function(done) {
      let customerParams = {
        firstName: 'Adam',
        lastName: 'Jones',
        creditCard: {
          cardholderName: 'Adam Jones',
          number: '5105105105105100',
          expirationDate: '05/2014'
        }
      };

      return specHelper.defaultGateway.customer.create(customerParams, function(err, response) {
        let transactionParams = {
          paymentMethodToken: response.customer.creditCards[0].token,
          amount: '100.00'
        };

        return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.type, 'sale');
          assert.equal(response.transaction.customer.firstName, 'Adam');
          assert.equal(response.transaction.customer.lastName, 'Jones');
          assert.equal(response.transaction.creditCard.cardholderName, 'Adam Jones');
          assert.equal(response.transaction.creditCard.maskedNumber, '510510******5100');
          assert.equal(response.transaction.creditCard.expirationDate, '05/2014');

          return done();
        });
      });
    });

    it("returns payment_instrument_type for credit_card", function(done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.transaction.paymentInstrumentType, PaymentInstrumentTypes.CreditCard);

        return done();
      });
    });

    it("calls callback with an error when options object contains invalid keys", function(done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          fakeData: "some non-matching param value",
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
        assert.equal(err.type, "invalidKeysError");
        assert.equal(err.message, "These keys are invalid: creditCard[fakeData]");
        return done();
      });
    });

    it("skips advanced fraud checking if transaction[options][skip_advanced_fraud_checking] is set to true", function(done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        },
        options: {
          skipAdvancedFraudChecking: true
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.isNull(response.transaction.riskData.id);
        return done();
      });
    });

    context("with apple pay", () =>
      it("returns ApplePayCard for payment_instrument", done =>
        specHelper.defaultGateway.customer.create({}, function(err, response) {
          let transactionParams = {
            paymentMethodNonce: Nonces.ApplePayAmEx,
            amount: '100.00'
          };

          return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.equal(response.transaction.paymentInstrumentType, PaymentInstrumentTypes.ApplePayCard);
            assert.isNotNull(response.transaction.applePayCard.card_type);
            assert.isNotNull(response.transaction.applePayCard.payment_instrument_name);

            return done();
          });
        })
      )
    );

    context("with android pay proxy card", () =>
      it("returns AndroidPayCard for payment_instrument", done =>
        specHelper.defaultGateway.customer.create({}, function(err, response) {
          let transactionParams = {
            paymentMethodNonce: Nonces.AndroidPayDiscover,
            amount: '100.00'
          };

          return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.equal(response.transaction.paymentInstrumentType, PaymentInstrumentTypes.AndroidPayCard);
            assert.isString(response.transaction.androidPayCard.googleTransactionId);
            assert.equal(response.transaction.androidPayCard.cardType, specHelper.braintree.CreditCard.CardType.Discover);
            assert.equal(response.transaction.androidPayCard.last4, "1117");

            return done();
          });
        })
      )
    );

    context("with android pay network token", () =>
      it("returns AndroidPayCard for payment_instrument", done =>
        specHelper.defaultGateway.customer.create({}, function(err, response) {
          let transactionParams = {
            paymentMethodNonce: Nonces.AndroidPayMasterCard,
            amount: '100.00'
          };

          return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.equal(response.transaction.paymentInstrumentType, PaymentInstrumentTypes.AndroidPayCard);
            assert.isString(response.transaction.androidPayCard.googleTransactionId);
            assert.equal(response.transaction.androidPayCard.cardType, specHelper.braintree.CreditCard.CardType.MasterCard);
            assert.equal(response.transaction.androidPayCard.last4, "4444");

            return done();
          });
        })
      )
    );

    context("with amex express checkout card", () =>
      it("returns AmexExpressCheckoutCard for payment_instrument", done =>
        specHelper.defaultGateway.customer.create({}, function(err, response) {
          let transactionParams = {
            paymentMethodNonce: Nonces.AmexExpressCheckout,
            merchantAccountId: specHelper.fakeAmexDirectMerchantAccountId,
            amount: '100.00'
          };

          return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.equal(response.transaction.paymentInstrumentType, PaymentInstrumentTypes.AmexExpressCheckoutCard);
            assert.equal(response.transaction.amexExpressCheckoutCard.cardType, specHelper.braintree.CreditCard.CardType.AmEx);
            assert.match(response.transaction.amexExpressCheckoutCard.cardMemberNumber, /^\d{4}$/);

            return done();
          });
        })
      )
    );

    context("with venmo account", () =>
      it("returns VenmoAccount for payment_instrument", done =>
        specHelper.defaultGateway.customer.create({}, function(err, response) {
          let transactionParams = {
            paymentMethodNonce: Nonces.VenmoAccount,
            merchantAccountId: specHelper.fakeVenmoAccountMerchantAccountId,
            amount: '100.00'
          };

          return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.equal(response.transaction.paymentInstrumentType, PaymentInstrumentTypes.VenmoAccount);
            assert.equal(response.transaction.venmoAccount.username, "venmojoe");
            assert.equal(response.transaction.venmoAccount.venmoUserId, "Venmo-Joe-1");

            return done();
          });
        })
      )
    );

    context("Coinbase", () =>
      it("returns CoinbaseAccount for payment_instrument", done =>
        specHelper.defaultGateway.customer.create({}, function(err, response) {
          let transactionParams = {
            paymentMethodNonce: Nonces.Coinbase,
            amount: '100.00'
          };

          return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.equal(response.transaction.paymentInstrumentType, PaymentInstrumentTypes.CoinbaseAccount);
            assert.isNotNull(response.transaction.coinbaseAccount.user_email);

            return done();
          });
        })
      )
    );

    context("with a paypal acount", function() {
      it("returns PayPalAccount for payment_instrument", done =>
        specHelper.defaultGateway.customer.create({}, function(err, response) {
          let transactionParams = {
            paymentMethodNonce: Nonces.PayPalOneTimePayment,
            amount: '100.00'
          };

          return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.equal(response.transaction.paymentInstrumentType, PaymentInstrumentTypes.PayPalAccount);

            return done();
          });
        })
      );

      context("in-line capture", function() {
        it("includes processorSettlementResponse_code and processorSettlementResponseText for settlement declined transactions", function(done) {
          let transactionParams = {
            paymentMethodNonce: Nonces.PayPalOneTimePayment,
            amount: '10.00',
            options: {
              submitForSettlement: true
            }
          };

          return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            let transactionId = response.transaction.id;

            return specHelper.defaultGateway.testing.settlementDecline(transactionId, (err, transaction) =>
              specHelper.defaultGateway.transaction.find(transactionId, function(err, transaction) {
                assert.equal(transaction.processorSettlementResponseCode, "4001");
                assert.equal(transaction.processorSettlementResponseText, "Settlement Declined");
                return done();
              })
            );
          });
        });


        return it("includes processorSettlementResponseCode and processorSettlementResponseText for settlement pending transactions", function(done) {
          let transactionParams = {
            paymentMethodNonce: Nonces.PayPalOneTimePayment,
            amount: '10.00',
            options: {
              submitForSettlement: true
            }
          };

          return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            let transactionId = response.transaction.id;

            return specHelper.defaultGateway.testing.settlementPending(transactionId, (err, response) =>
              specHelper.defaultGateway.transaction.find(transactionId, function(err, transaction) {
                assert.equal(transaction.processorSettlementResponseCode, "4002");
                assert.equal(transaction.processorSettlementResponseText, "Settlement Pending");
                return done();
              })
            );
          });
        });
      });

      context("as a vaulted payment method", () =>
        it("successfully creates a transaction", done =>
          specHelper.defaultGateway.customer.create({}, function(err, response) {
            let customerId = response.customer.id;
            let nonceParams = {
              paypalAccount: {
                consentCode: 'PAYPAL_CONSENT_CODE',
                token: `PAYPAL_ACCOUNT_${specHelper.randomId()}`
              }
            };

            return specHelper.generateNonceForNewPaymentMethod(nonceParams, customerId, function(nonce) {
              let paymentMethodParams = {
                paymentMethodNonce: nonce,
                customerId
              };

              return specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function(err, response) {
                let paymentMethodToken = response.paymentMethod.token;

                let transactionParams = {
                  paymentMethodToken,
                  amount: '100.00'
                };

                return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
                  assert.isNull(err);
                  assert.isTrue(response.success);
                  assert.equal(response.transaction.type, 'sale');
                  assert.isString(response.transaction.paypalAccount.payerEmail);
                  assert.isString(response.transaction.paypalAccount.authorizationId);
                  assert.isString(response.transaction.paypalAccount.imageUrl);
                  assert.isString(response.transaction.paypalAccount.debugId);

                  return done();
                });
              });
            });
          })
        )
      );

      context("as a payment method nonce authorized for future payments", function() {
        it("successfully creates a transaction but doesn't vault a paypal account", function(done) {
          let paymentMethodToken = `PAYPAL_ACCOUNT_${specHelper.randomId()}`;

          let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig));
          return specHelper.defaultGateway.clientToken.generate({}, function(err, result) {
            let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
            let { authorizationFingerprint } = clientToken;
            let params = {
              authorizationFingerprint,
              paypalAccount: {
                consentCode: 'PAYPAL_CONSENT_CODE',
                token: paymentMethodToken
              }
            };

            return myHttp.post("/client_api/v1/payment_methods/paypal_accounts.json", params, function(statusCode, body) {
              let { nonce } = JSON.parse(body).paypalAccounts[0];

              return specHelper.defaultGateway.customer.create({}, function(err, response) {
                let transactionParams = {
                  paymentMethodNonce: nonce,
                  amount: '100.00'
                };

                return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
                  assert.isNull(err);
                  assert.isTrue(response.success);
                  assert.equal(response.transaction.type, 'sale');
                  assert.isNull(response.transaction.paypalAccount.token);
                  assert.isString(response.transaction.paypalAccount.payerEmail);
                  assert.isString(response.transaction.paypalAccount.authorizationId);
                  assert.isString(response.transaction.paypalAccount.debugId);

                  return specHelper.defaultGateway.paypalAccount.find(paymentMethodToken, function(err, paypalAccount) {
                    assert.equal(err.type, braintree.errorTypes.notFoundError);

                    return done();
                  });
                });
              });
            });
          });
        });

        return it("vaults when explicitly asked", function(done) {
          let paymentMethodToken = `PAYPAL_ACCOUNT_${specHelper.randomId()}`;

          let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig));
          return specHelper.defaultGateway.clientToken.generate({}, function(err, result) {
            let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
            let { authorizationFingerprint } = clientToken;
            let params = {
              authorizationFingerprint,
              paypalAccount: {
                consentCode: 'PAYPAL_CONSENT_CODE',
                token: paymentMethodToken
              }
            };

            return myHttp.post("/client_api/v1/payment_methods/paypal_accounts.json", params, function(statusCode, body) {
              let { nonce } = JSON.parse(body).paypalAccounts[0];

              return specHelper.defaultGateway.customer.create({}, function(err, response) {
                let transactionParams = {
                  paymentMethodNonce: nonce,
                  amount: '100.00',
                  options: {
                    storeInVault: true
                  }
                };

                return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
                  assert.isNull(err);
                  assert.isTrue(response.success);
                  assert.equal(response.transaction.type, 'sale');
                  assert.equal(response.transaction.paypalAccount.token, paymentMethodToken);
                  assert.isString(response.transaction.paypalAccount.payerEmail);
                  assert.isString(response.transaction.paypalAccount.authorizationId);
                  assert.isString(response.transaction.paypalAccount.debugId);

                  return specHelper.defaultGateway.paypalAccount.find(paymentMethodToken, function(err, paypalAccount) {
                    assert.isNull(err);

                    return done();
                  });
                });
              });
            });
          });
        });
      });

      return context("as a payment method nonce authorized for one-time use", function() {
        it("successfully creates a transaction", function(done) {
          let nonce = Nonces.PayPalOneTimePayment;

          return specHelper.defaultGateway.customer.create({}, function(err, response) {
            let transactionParams = {
              paymentMethodNonce: nonce,
              amount: '100.00'
            };

            return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);
              assert.equal(response.transaction.type, 'sale');
              assert.isNull(response.transaction.paypalAccount.token);
              assert.isString(response.transaction.paypalAccount.payerEmail);
              assert.isString(response.transaction.paypalAccount.authorizationId);
              assert.isString(response.transaction.paypalAccount.debugId);

              return done();
            });
          });
        });

        it("successfully creates a transaction with a payee email", function(done) {
          let nonce = Nonces.PayPalOneTimePayment;

          return specHelper.defaultGateway.customer.create({}, function(err, response) {
            let transactionParams = {
              paymentMethodNonce: nonce,
              amount: '100.00',
              paypalAccount: {
                payeeEmail: 'payee@example.com'
              }
            };

            return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);
              assert.equal(response.transaction.type, 'sale');
              assert.isNull(response.transaction.paypalAccount.token);
              assert.isString(response.transaction.paypalAccount.payerEmail);
              assert.isString(response.transaction.paypalAccount.authorizationId);
              assert.isString(response.transaction.paypalAccount.debugId);
              assert.equal(response.transaction.paypalAccount.payeeEmail, 'payee@example.com');

              return done();
            });
          });
        });

        it("successfully creates a transaction with a payee email in the options params", function(done) {
          let nonce = Nonces.PayPalOneTimePayment;

          return specHelper.defaultGateway.customer.create({}, function(err, response) {
            let transactionParams = {
              paymentMethodNonce: nonce,
              amount: '100.00',
              paypalAccount: {},
              options: {
                payeeEmail: 'payee@example.com'
              }
            };

            return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);
              assert.equal(response.transaction.type, 'sale');
              assert.isNull(response.transaction.paypalAccount.token);
              assert.isString(response.transaction.paypalAccount.payerEmail);
              assert.isString(response.transaction.paypalAccount.authorizationId);
              assert.isString(response.transaction.paypalAccount.debugId);
              assert.equal(response.transaction.paypalAccount.payeeEmail, 'payee@example.com');

              return done();
            });
          });
        });

        it("successfully creates a transaction with a payee email in transaction.options.paypal", function(done) {
          let nonce = Nonces.PayPalOneTimePayment;

          return specHelper.defaultGateway.customer.create({}, function(err, response) {
            let transactionParams = {
              paymentMethodNonce: nonce,
              amount: '100.00',
              paypalAccount: {},
              options: {
                paypal: {
                  payeeEmail: 'payee@example.com'
                }
              }
            };

            return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);
              assert.equal(response.transaction.type, 'sale');
              assert.isNull(response.transaction.paypalAccount.token);
              assert.isString(response.transaction.paypalAccount.payerEmail);
              assert.isString(response.transaction.paypalAccount.authorizationId);
              assert.isString(response.transaction.paypalAccount.debugId);
              assert.equal(response.transaction.paypalAccount.payeeEmail, 'payee@example.com');

              return done();
            });
          });
        });

        it("successfully creates a transaction with a PayPal custom field", function(done) {
          let nonce = Nonces.PayPalOneTimePayment;

          return specHelper.defaultGateway.customer.create({}, function(err, response) {
            let transactionParams = {
              paymentMethodNonce: nonce,
              amount: '100.00',
              paypalAccount: {},
              options: {
                paypal: {
                  customField: 'custom field junk'
                }
              }
            };

            return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);
              assert.equal(response.transaction.type, 'sale');
              assert.isNull(response.transaction.paypalAccount.token);
              assert.isString(response.transaction.paypalAccount.payerEmail);
              assert.isString(response.transaction.paypalAccount.authorizationId);
              assert.isString(response.transaction.paypalAccount.debugId);
              assert.equal(response.transaction.paypalAccount.customField, 'custom field junk');

              return done();
            });
          });
        });

        it("successfully creates a transaction with PayPal supplementary data", function(done) {
          let nonce = Nonces.PayPalOneTimePayment;

          return specHelper.defaultGateway.customer.create({}, function(err, response) {
            let transactionParams = {
              paymentMethodNonce: nonce,
              amount: '100.00',
              paypalAccount: {},
              options: {
                paypal: {
                  supplementaryData: {
                    key1: 'value1',
                    key2: 'value2'
                  }
                }
              }
            };

            // note - supplementary data is not returned in response
            return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);

              return done();
            });
          });
        });

        it("successfully creates a transaction with a PayPal description", function(done) {
          let nonce = Nonces.PayPalOneTimePayment;

          return specHelper.defaultGateway.customer.create({}, function(err, response) {
            let transactionParams = {
              paymentMethodNonce: nonce,
              amount: '100.00',
              paypalAccount: {},
              options: {
                paypal: {
                  description: 'product description'
                }
              }
            };

            return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);
              assert.equal(response.transaction.paypalAccount.description, 'product description');

              return done();
            });
          });
        });

        return it("does not vault even when explicitly asked", function(done) {
          let nonce = Nonces.PayPalOneTimePayment;

          return specHelper.defaultGateway.customer.create({}, function(err, response) {
            let transactionParams = {
              paymentMethodNonce: nonce,
              amount: '100.00',
              options: {
                storeInVault: true
              }
            };

            return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);
              assert.equal(response.transaction.type, 'sale');
              assert.isNull(response.transaction.paypalAccount.token);
              assert.isString(response.transaction.paypalAccount.payerEmail);
              assert.isString(response.transaction.paypalAccount.authorizationId);
              assert.isString(response.transaction.paypalAccount.debugId);

              return done();
            });
          });
        });
      });
    });

    it("allows submitting for settlement", function(done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        },
        options: {
          submitForSettlement: true
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.transaction.status, 'submitted_for_settlement');

        return done();
      });
    });

    it("allows storing in the vault", function(done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        },
        options: {
          storeInVault: true
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.match(response.transaction.customer.id, /^\d+$/);
        assert.match(response.transaction.creditCard.token, /^\w+$/);

        return done();
      });
    });

    it("can create transactions with custom fields", function(done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        },
        customFields: {
          storeMe: 'custom value'
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.transaction.customFields.storeMe, 'custom value');

        return done();
      });
    });

    it("allows specifying transactions as 'recurring'", function(done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        },
        recurring: true
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.transaction.recurring, true);

        return done();
      });
    });

    it("allows specifying transactions with transaction source as 'recurring'", function(done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        },
        transactionSource: 'recurring'
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.transaction.recurring, true);

        return done();
      });
    });

    it("allows specifying transactions with transaction source as 'moto'", function(done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        },
        transactionSource: 'moto'
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.transaction.recurring, false);

        return done();
      });
    });

    it("sets card type indicators on the transaction", function(done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: CreditCardNumbers.CardTypeIndicators.Unknown,
          expirationDate: '05/12'
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
        assert.equal(response.transaction.creditCard.prepaid, CreditCard.Prepaid.Unknown);
        assert.equal(response.transaction.creditCard.durbinRegulated, CreditCard.DurbinRegulated.Unknown);
        assert.equal(response.transaction.creditCard.commercial, CreditCard.Commercial.Unknown);
        assert.equal(response.transaction.creditCard.healthcare, CreditCard.Healthcare.Unknown);
        assert.equal(response.transaction.creditCard.debit, CreditCard.Debit.Unknown);
        assert.equal(response.transaction.creditCard.payroll, CreditCard.Payroll.Unknown);
        assert.equal(response.transaction.creditCard.countryOfIssuance, CreditCard.CountryOfIssuance.Unknown);
        assert.equal(response.transaction.creditCard.issuingBank, CreditCard.IssuingBank.Unknown);
        assert.equal(response.transaction.creditCard.productId, CreditCard.ProductId.Unknown);

        return done();
      });
    });

    it("handles processor declines", function(done) {
      let transactionParams = {
        amount: '2000.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
        assert.isFalse(response.success);
        assert.equal(response.transaction.amount, '2000.00');
        assert.equal(response.transaction.status, 'processor_declined');
        assert.equal(response.transaction.additionalProcessorResponse, '2000 : Do Not Honor');

        return done();
      });
    });

    it("handles risk data returned by the gateway", function(done) {
      let transactionParams = {
        amount: '10.0',
        creditCard: {
          number: "4111111111111111",
          expirationDate: '05/16'
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
        assert.isTrue(response.success);
        assert.equal(response.transaction.riskData.decision, "Not Evaluated");
        assert.equal(response.transaction.riskData.id, null);
        return done();
      });
    });

    it("handles fraud rejection", function(done) {
      let transactionParams = {
        amount: '10.0',
        creditCard: {
          number: CreditCardNumbers.CardTypeIndicators.Fraud,
          expirationDate: '05/16'
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
        assert.isFalse(response.success);
        assert.equal(response.transaction.status, Transaction.Status.GatewayRejected);
        assert.equal(response.transaction.gatewayRejectionReason, Transaction.GatewayRejectionReason.Fraud);
        return done();
      });
    });

    it("allows fraud params", function(done) {
      let transactionParams = {
        amount: '10.0',
        deviceSessionId: "123456789",
        fraudMerchantId: "0000000031",
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/16'
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        return done();
      });
    });

    it("allows risk data params", function(done) {
      let transactionParams = {
        amount: '10.0',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/16'
        },
        riskData: {
          customerBrowser: 'Edge',
          customerIp: "127.0.0.0"
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        return done();
      });
    });


    it("handles validation errors", function(done) {
      let transactionParams = {
        creditCard: {
          number: '5105105105105100'
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
        assert.isFalse(response.success);
        assert.equal(response.message, 'Amount is required.\nExpiration date is required.');
        assert.equal(
          response.errors.for('transaction').on('amount')[0].code,
          '81502'
        );
        assert.equal(
          response.errors.for('transaction').on('amount')[0].attribute,
          'amount'
        );
        assert.equal(
          response.errors.for('transaction').for('creditCard').on('expirationDate')[0].code,
          '81709'
        );
        let errorCodes = (Array.from(response.errors.deepErrors()).map((error) => error.code));
        assert.equal(errorCodes.length, 2);
        assert.include(errorCodes, '81502');
        assert.include(errorCodes, '81709');

        return done();
      });
    });

    it("handles descriptors", function(done) {
      let transactionParams = {
        amount: '10.0',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/16'
        },
        descriptor: {
          name: 'abc*def',
          phone: '1234567890',
          url: 'ebay.com'
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
        assert.isTrue(response.success);
        assert.equal(response.transaction.descriptor.name, 'abc*def');
        assert.equal(response.transaction.descriptor.phone, '1234567890');
        assert.equal(response.transaction.descriptor.url, 'ebay.com');

        return done();
      });
    });

    it("handles descriptor validations", function(done) {
      let transactionParams = {
        amount: '10.0',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/16'
        },
        descriptor: {
          name: 'abc',
          phone: '1234567',
          url: '12345678901234'
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
        assert.isFalse(response.success);
        assert.equal(
          response.errors.for('transaction').for('descriptor').on('name')[0].code,
          ValidationErrorCodes.Descriptor.NameFormatIsInvalid
        );
        assert.equal(
          response.errors.for('transaction').for('descriptor').on('phone')[0].code,
          ValidationErrorCodes.Descriptor.PhoneFormatIsInvalid
        );
        assert.equal(
          response.errors.for('transaction').for('descriptor').on('url')[0].code,
          ValidationErrorCodes.Descriptor.UrlFormatIsInvalid
        );
        return done();
      });
    });

    it("handles lodging industry data", function(done) {
      let transactionParams = {
        amount: '10.0',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/16'
        },
        industry: {
          industryType: Transaction.IndustryData.Lodging,
          data: {
            folioNumber: 'aaa',
            checkInDate: '2014-07-07',
            checkOutDate: '2014-08-08',
            roomRate: '239.00'
          }
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
        assert.isTrue(response.success);

        return done();
      });
    });

    it("handles lodging industry data validations", function(done) {
      let transactionParams = {
        amount: '10.0',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/16'
        },
        industry: {
          industryType: Transaction.IndustryData.Lodging,
          data: {
            folioNumber: 'aaa',
            checkInDate: '2014-07-07',
            checkOutDate: '2014-06-06',
            roomRate: '239.00'
          }
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
        assert.isFalse(response.success);
        assert.equal(
          response.errors.for('transaction').for('industry').on('checkOutDate')[0].code,
          ValidationErrorCodes.Transaction.IndustryData.Lodging.CheckOutDateMustFollowCheckInDate
        );

        return done();
      });
    });

    it("handles travel cruise industry data", function(done) {
      let transactionParams = {
        amount: '10.0',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/16'
        },
        industry: {
          industryType: Transaction.IndustryData.TravelAndCruise,
          data: {
            travelPackage: 'flight',
            departureDate: '2014-07-07',
            lodgingCheckInDate: '2014-07-07',
            lodgingCheckOutDate: '2014-08-08',
            lodgingName: 'Disney'
          }
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
        assert.isTrue(response.success);

        return done();
      });
    });

    it("handles lodging industry data validations", function(done) {
      let transactionParams = {
        amount: '10.0',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/16'
        },
        industry: {
          industryType: Transaction.IndustryData.TravelAndCruise,
          data: {
            travelPackage: 'onfoot',
            departureDate: '2014-07-07',
            lodgingCheckInDate: '2014-07-07',
            lodgingCheckOutDate: '2014-08-08',
            lodgingName: 'Disney'
          }
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
        assert.isFalse(response.success);
        assert.equal(
          response.errors.for('transaction').for('industry').on('travelPackage')[0].code,
          ValidationErrorCodes.Transaction.IndustryData.TravelCruise.TravelPackageIsInvalid
        );

        return done();
      });
    });

    context("with a service fee", function() {
      it("persists the service fee", function(done) {
        let transactionParams = {
          merchantAccountId: specHelper.nonDefaultSubMerchantAccountId,
          amount: '5.00',
          creditCard: {
            number: '5105105105105100',
            expirationDate: '05/12'
          },
          serviceFeeAmount: '1.00'
        };

        return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.serviceFeeAmount, '1.00');

          return done();
        });
      });

      it("handles validation errors on service fees", function(done) {
        let transactionParams = {
          merchantAccountId: specHelper.nonDefaultSubMerchantAccountId,
          amount: '1.00',
          creditCard: {
            number: '5105105105105100',
            expirationDate: '05/12'
          },
          serviceFeeAmount: '5.00'
        };

        return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
          assert.isNull(err);
          assert.isFalse(response.success);
          assert.equal(
            response.errors.for('transaction').on('serviceFeeAmount')[0].code,
            ValidationErrorCodes.Transaction.ServiceFeeAmountIsTooLarge
          );

          return done();
        });
      });

      return it("sub merchant accounts must provide a service fee", function(done) {
        let transactionParams = {
          merchantAccountId: specHelper.nonDefaultSubMerchantAccountId,
          amount: '1.00',
          creditCard: {
            number: '5105105105105100',
            expirationDate: '05/12'
          }
        };

        return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
          assert.isNull(err);
          assert.isFalse(response.success);
          assert.equal(
            response.errors.for('transaction').on('merchantAccountId')[0].code,
            ValidationErrorCodes.Transaction.SubMerchantAccountRequiresServiceFeeAmount
          );

          return done();
        });
      });
    });

    context("with escrow status", function() {
      it("can specify transactions to be held for escrow", function(done) {
        let transactionParams = {
          merchantAccountId: specHelper.nonDefaultSubMerchantAccountId,
          amount: '10.00',
          serviceFeeAmount: '1.00',
          creditCard: {
            number: "4111111111111111",
            expirationDate: '05/12'
          },
          options: {
            holdInEscrow: true
          }
        };
        return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(
            response.transaction.escrowStatus,
            Transaction.EscrowStatus.HoldPending
          );
          return done();
        });
      });

      return it("can not be held for escrow if not a submerchant", function(done) {
        let transactionParams = {
          merchantAccountId: specHelper.defaultMerchantAccountId,
          amount: '10.00',
          serviceFeeAmount: '1.00',
          creditCard: {
            number: "4111111111111111",
            expirationDate: '05/12'
          },
          options: {
            holdInEscrow: true
          }
        };
        return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
          assert.isNull(err);
          assert.isFalse(response.success);
          assert.equal(
            response.errors.for('transaction').on('base')[0].code,
            ValidationErrorCodes.Transaction.CannotHoldInEscrow
          );
          return done();
        });
      });
    });

    context("releaseFromEscrow", function() {
      it("can release an escrowed transaction", done =>
        specHelper.createEscrowedTransaction(transaction =>
          specHelper.defaultGateway.transaction.releaseFromEscrow(transaction.id, function(err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.equal(response.transaction.escrowStatus, Transaction.EscrowStatus.ReleasePending);
            return done();
          })
        )
      );

      return it("cannot submit a non-escrowed transaction for release", function(done) {
        let transactionParams = {
          merchantAccountId: specHelper.nonDefaultSubMerchantAccountId,
          amount: '10.00',
          serviceFeeAmount: '1.00',
          creditCard: {
            number: "4111111111111111",
            expirationDate: '05/12'
          },
          options: {
            holdInEscrow: true
          }
        };
        return specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
          specHelper.defaultGateway.transaction.releaseFromEscrow(response.transaction.id, function(err, response) {
            assert.isNull(err);
            assert.isFalse(response.success);
            assert.equal(
              response.errors.for('transaction').on('base')[0].code,
              ValidationErrorCodes.Transaction.CannotReleaseFromEscrow
            );
            return done();
          })
        );
      });
    });

    context("cancelRelease", function() {
      it("can cancel release for a transaction that has been submitted for release", done =>
        specHelper.createEscrowedTransaction(transaction =>
          specHelper.defaultGateway.transaction.releaseFromEscrow(transaction.id, (err, response) =>
            specHelper.defaultGateway.transaction.cancelRelease(transaction.id, function(err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);
              assert.equal(
                response.transaction.escrowStatus,
                Transaction.EscrowStatus.Held
              );
              return done();
            })
          )
        )
      );

      return it("cannot cancel release a transaction that has not been submitted for release", done =>
        specHelper.createEscrowedTransaction(transaction =>
          specHelper.defaultGateway.transaction.cancelRelease(transaction.id, function(err, response) {
            assert.isNull(err);
            assert.isFalse(response.success);
            assert.equal(
              response.errors.for('transaction').on('base')[0].code,
              ValidationErrorCodes.Transaction.CannotCancelRelease
            );
            return done();
          })
        )
      );
    });

    context("holdInEscrow", function() {
      it("can hold authorized or submitted for settlement transactions for escrow", function(done) {
        let transactionParams = {
          merchantAccountId: specHelper.nonDefaultSubMerchantAccountId,
          amount: '10.00',
          serviceFeeAmount: '1.00',
          creditCard: {
            number: "4111111111111111",
            expirationDate: '05/12'
          }
        };
        return specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
          specHelper.defaultGateway.transaction.holdInEscrow(response.transaction.id, function(err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.equal(
              response.transaction.escrowStatus,
              Transaction.EscrowStatus.HoldPending
            );
            return done();
          })
        );
      });

      return it("cannot hold settled transactions for escrow", function(done) {
        let transactionParams = {
          merchantAccountId: specHelper.nonDefaultSubMerchantAccountId,
          amount: '10.00',
          serviceFeeAmount: '1.00',
          creditCard: {
            number: "4111111111111111",
            expirationDate: '05/12'
          },
          options: {
            submitForSettlement: true
          }
        };
        return specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
          specHelper.defaultGateway.testing.settle(response.transaction.id, (err, response) =>
            specHelper.defaultGateway.transaction.holdInEscrow(response.transaction.id, function(err, response) {
              assert.isFalse(response.success);
              assert.equal(
                response.errors.for('transaction').on('base')[0].code,
                ValidationErrorCodes.Transaction.CannotHoldInEscrow
              );
              return done();
            })
          )
        );
      });
    });

    it("can use venmo sdk payment method codes", function(done) {
      let transactionParams = {
        amount: '1.00',
        venmoSdkPaymentMethodCode: VenmoSdk.VisaPaymentMethodCode
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.transaction.creditCard.bin, "411111");

        return done();
      });
    });

    it("can use venmo sdk session", function(done) {
      let transactionParams = {
        amount: '1.00',
        creditCard: {
          number: "4111111111111111",
          expirationDate: '05/12'
        },
        options: {
          venmoSdkSession: VenmoSdk.Session
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.isTrue(response.transaction.creditCard.venmoSdk);

        return done();
      });
    });

    it("can use vaulted credit card nonce", function(done) {
      let customerParams = {
        firstName: 'Adam',
        lastName: 'Jones'
      };

      return specHelper.defaultGateway.customer.create(customerParams, function(err, response) {
        let customerId = response.customer.id;
        let paymentMethodParams = {
          creditCard: {
            number: "4111111111111111",
            expirationMonth: "12",
            expirationYear: "2099"
          }
        };
        return specHelper.generateNonceForNewPaymentMethod(paymentMethodParams, customerId, function(nonce) {
          let transactionParams = {
            amount: '1.00',
            paymentMethodNonce: nonce
          };

          return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);

            return done();
        });});
      });
    });

    it("can use vaulted PayPal account nonce", function(done) {
      let customerParams = {
        firstName: 'Adam',
        lastName: 'Jones'
      };

      return specHelper.defaultGateway.customer.create(customerParams, function(err, response) {
        let customerId = response.customer.id;
        let paymentMethodParams = {
          paypalAccount: {
            consent_code: "PAYPAL_CONSENT_CODE"
          }
        };
        return specHelper.generateNonceForNewPaymentMethod(paymentMethodParams, customerId, function(nonce) {
          let transactionParams = {
            amount: '1.00',
            paymentMethodNonce: nonce
          };

          return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);

            return done();
        });});
      });
    });

    it("can use params nonce", function(done) {
      let paymentMethodParams = {
        creditCard: {
          number: "4111111111111111",
          expirationMonth: "12",
          expirationYear: "2099"
        }
      };
      return specHelper.generateNonceForNewPaymentMethod(paymentMethodParams, null, function(nonce) {
        let transactionParams = {
          amount: '1.00',
          paymentMethodNonce: nonce
        };

        return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);

          return done();
      });});
    });

    it("works with an unknown payment instrument", function(done) {
      let transactionParams = {
        amount: '1.00',
        paymentMethodNonce: Nonces.AbstractTransactable
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);

        return done();
      });
    });

    context("amex rewards", function(done) {
      it("succeeds", function(done) {
        let transactionParams = {
          merchantAccountId: specHelper.fakeAmexDirectMerchantAccountId,
          amount: "10.00",
          creditCard: {
            number: CreditCardNumbers.AmexPayWithPoints.Success,
            expirationDate: "12/2020"
          },
          options: {
            submitForSettlement: true,
            amexRewards: {
              requestId: "ABC123",
              points: "1000",
              currencyAmount: "10.00",
              currencyIsoCode: "USD"
            }
          }
        };

        return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, Transaction.Status.SubmittedForSettlement);

          return done();
        });
      });

      it("succeeds even if the card is ineligible", function(done) {
        let transactionParams = {
          merchantAccountId: specHelper.fakeAmexDirectMerchantAccountId,
          amount: "10.00",
          creditCard: {
            number: CreditCardNumbers.AmexPayWithPoints.IneligibleCard,
            expirationDate: "12/2020"
          },
          options: {
            submitForSettlement: true,
            amexRewards: {
              requestId: "ABC123",
              points: "1000",
              currencyAmount: "10.00",
              currencyIsoCode: "USD"
            }
          }
        };

        return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, Transaction.Status.SubmittedForSettlement);

          return done();
        });
      });

      return it("succeeds even if the card's balance is insufficient", function(done) {
        let transactionParams = {
          merchantAccountId: specHelper.fakeAmexDirectMerchantAccountId,
          amount: "10.00",
          creditCard: {
            number: CreditCardNumbers.AmexPayWithPoints.InsufficientPoints,
            expirationDate: "12/2020"
          },
          options: {
            submitForSettlement: true,
            amexRewards: {
              requestId: "ABC123",
              points: "1000",
              currencyAmount: "10.00",
              currencyIsoCode: "USD"
            }
          }
        };

        return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, Transaction.Status.SubmittedForSettlement);

          return done();
        });
      });
    });

    return context("us bank account nonce", function(done) {
      it("succeeds and vaults a us bank account nonce", done =>
        specHelper.generateValidUsBankAccountNonce(function(nonce) {
          let transactionParams = {
            merchantAccountId: "us_bank_merchant_account",
            amount: "10.00",
            paymentMethodNonce: nonce,
            options: {
              submitForSettlement: true,
              storeInVault: true
            }
          };

          return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
            assert.isTrue(response.success);
            assert.equal(response.transaction.status, Transaction.Status.SettlementPending);
            assert.equal(response.transaction.usBankAccount.last4, "1234");
            assert.equal(response.transaction.usBankAccount.accountHolderName, "Dan Schulman");
            assert.equal(response.transaction.usBankAccount.routingNumber, "021000021");
            assert.equal(response.transaction.usBankAccount.accountType, "checking");
            assert.match(response.transaction.usBankAccount.bankName, /CHASE/);
            assert.equal(response.transaction.usBankAccount.achMandate.text, "cl mandate text");
            assert.isTrue(response.transaction.usBankAccount.achMandate.acceptedAt instanceof Date);

            return done();
          });
        })
      );

      it("succeeds and vaults a us bank account nonce and can transact on vaulted token", done =>
        specHelper.generateValidUsBankAccountNonce(function(nonce) {
          let transactionParams = {
            merchantAccountId: "us_bank_merchant_account",
            amount: "10.00",
            paymentMethodNonce: nonce,
            options: {
              submitForSettlement: true,
              storeInVault: true
            }
          };

          return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
            assert.isTrue(response.success);
            assert.equal(response.transaction.status, Transaction.Status.SettlementPending);
            assert.equal(response.transaction.usBankAccount.last4, "1234");
            assert.equal(response.transaction.usBankAccount.accountHolderName, "Dan Schulman");
            assert.equal(response.transaction.usBankAccount.routingNumber, "021000021");
            assert.equal(response.transaction.usBankAccount.accountType, "checking");
            assert.match(response.transaction.usBankAccount.bankName, /CHASE/);
            assert.equal(response.transaction.usBankAccount.achMandate.text, "cl mandate text");
            assert.isTrue(response.transaction.usBankAccount.achMandate.acceptedAt instanceof Date);
            let { token } = response.transaction.usBankAccount;

            transactionParams = {
              merchantAccountId: "us_bank_merchant_account",
              amount: "10.00",
              paymentMethodToken: token,
              options: {
                submitForSettlement: true
              }
            };

            return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
              assert.isTrue(response.success);
              assert.equal(response.transaction.status, Transaction.Status.SettlementPending);
              assert.equal(response.transaction.usBankAccount.last4, "1234");
              assert.equal(response.transaction.usBankAccount.accountHolderName, "Dan Schulman");
              assert.equal(response.transaction.usBankAccount.routingNumber, "021000021");
              assert.equal(response.transaction.usBankAccount.accountType, "checking");
              assert.match(response.transaction.usBankAccount.bankName, /CHASE/);
              assert.equal(response.transaction.usBankAccount.achMandate.text, "cl mandate text");
              assert.isTrue(response.transaction.usBankAccount.achMandate.acceptedAt instanceof Date);

              return done();
            });
          });
        })
      );

      return it("fails when us bank account nonce is not found", function(done) {
        let transactionParams = {
          merchantAccountId: "us_bank_merchant_account",
          amount: "10.00",
          paymentMethodNonce: specHelper.generateInvalidUsBankAccountNonce(),
          options: {
            submitForSettlement: true,
            storeInVault: true
          }
        };

        return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
          assert.isFalse(response.success);
          assert.equal(
            response.errors.for('transaction').on('paymentMethodNonce')[0].code,
            ValidationErrorCodes.Transaction.PaymentMethodNonceUnknown
          );

          return done();
        });
      });
    });
  });



  describe("credit", function() {
    it("creates a credit", function(done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      return specHelper.defaultGateway.transaction.credit(transactionParams, function(err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.transaction.type, 'credit');
        assert.equal(response.transaction.amount, '5.00');
        assert.equal(response.transaction.creditCard.maskedNumber, '510510******5100');

        return done();
      });
    });

    it("handles validation errors", function(done) {
      let transactionParams = {
        creditCard: {
          number: '5105105105105100'
        }
      };

      return specHelper.defaultGateway.transaction.credit(transactionParams, function(err, response) {
        assert.isFalse(response.success);
        assert.equal(response.message, 'Amount is required.\nExpiration date is required.');
        assert.equal(
          response.errors.for('transaction').on('amount')[0].code,
          '81502'
        );
        assert.equal(
          response.errors.for('transaction').on('amount')[0].attribute,
          'amount'
        );
        assert.equal(
          response.errors.for('transaction').for('creditCard').on('expirationDate')[0].code,
          '81709'
        );
        let errorCodes = (Array.from(response.errors.deepErrors()).map((error) => error.code));
        assert.equal(errorCodes.length, 2);
        assert.include(errorCodes, '81502');
        assert.include(errorCodes, '81709');

        return done();
      });
    });

    return context("three d secure", function(done) {
      it("creates a transaction with threeDSecureToken", function(done) {
        let threeDVerificationParams = {
          number: '4111111111111111',
          expirationMonth: '05',
          expirationYear: '2009'
        };
        return specHelper.create3DSVerification(specHelper.threeDSecureMerchantAccountId, threeDVerificationParams, function(threeDSecureToken) {
          let transactionParams = {
            merchantAccountId: specHelper.threeDSecureMerchantAccountId,
            amount: '5.00',
            creditCard: {
              number: '4111111111111111',
              expirationDate: '05/2009'
            },
            threeDSecureToken
          };

          return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);

            return done();
          });
        });
      });

      it("returns an error if sent null threeDSecureToken", function(done) {
        let transactionParams = {
          merchantAccountId: specHelper.threeDSecureMerchantAccountId,
          amount: '5.00',
          creditCard: {
            number: '4111111111111111',
            expirationDate: '05/2009'
          },
          threeDSecureToken: null
        };

        return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
          assert.isFalse(response.success);
          assert.equal(
            response.errors.for('transaction').on('threeDSecureToken')[0].code,
            ValidationErrorCodes.Transaction.ThreeDSecureTokenIsInvalid
          );

          return done();
        });
      });

      it("returns an error if 3ds lookup data doesn't match txn data", function(done) {
        let threeDVerificationParams = {
          number: '4111111111111111',
          expirationMonth: '05',
          expirationYear: '2009'
        };
        return specHelper.create3DSVerification(specHelper.threeDSecureMerchantAccountId, threeDVerificationParams, function(threeDSecureToken) {
          let transactionParams = {
            merchantAccountId: specHelper.threeDSecureMerchantAccountId,
            amount: '5.00',
            creditCard: {
              number: '5105105105105100',
              expirationDate: '05/2009'
            },
            threeDSecureToken
          };

          return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
            assert.isFalse(response.success);
            assert.equal(
              response.errors.for('transaction').on('threeDSecureToken')[0].code,
              ValidationErrorCodes.Transaction.ThreeDSecureTransactionDataDoesntMatchVerify
            );

            return done();
          });
        });
      });

      it("gateway rejects if 3ds is specified as required but not supplied", function(done) {
        let nonceParams = {
          creditCard: {
            number: '4111111111111111',
            expirationMonth: '05',
            expirationYear: '2009'
          }
        };

        return specHelper.generateNonceForNewPaymentMethod(nonceParams, null, function(nonce) {
          let transactionParams = {
            merchantAccountId: specHelper.threeDSecureMerchantAccountId,
            amount: '5.00',
            paymentMethodNonce: nonce,
            options: {
              threeDSecure: {
                required: true
              }
            }
          };

          return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
            assert.isFalse(response.success);
            assert.equal(response.transaction.status, Transaction.Status.GatewayRejected);
            assert.equal(response.transaction.gatewayRejectionReason, Transaction.GatewayRejectionReason.ThreeDSecure);

            return done();
          });
        });
      });

      it("works for transaction with threeDSecurePassThru", function(done) {
        let transactionParams = {
          merchantAccountId: specHelper.threeDSecureMerchantAccountId,
          amount: '5.00',
          creditCard: {
            number: '5105105105105100',
            expirationDate: '05/2009'
          },
          threeDSecurePassThru: {
            eciFlag: "02",
            cavv: "some_cavv",
            xid: "some_xid"
          }
        };

        return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, Transaction.Status.Authorized);

          return done();
        });
      });

      it("returns an error for transaction with threeDSecurePassThru when the merchant account does not support that card type", function(done) {
        let transactionParams = {
          merchantAccountId: "adyen_ma",
          amount: '5.00',
          creditCard: {
            number: '5105105105105100',
            expirationDate: '05/2009'
          },
          threeDSecurePassThru: {
            eciFlag: "02",
            cavv: "some_cavv",
            xid: "some_xid"
          }
        };

        return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
          assert.isFalse(response.success);
          assert.equal(
            response.errors.for('transaction').on("merchantAccountId")[0].code,
            ValidationErrorCodes.Transaction.ThreeDSecureMerchantAccountDoesNotSupportCardType
          );

          return done();
        });
      });

      it("returns an error for transaction when the threeDSecurePassThru eciFlag is missing", function(done) {
        let transactionParams = {
          merchantAccountId: specHelper.threeDSecureMerchantAccountId,
          amount: '5.00',
          creditCard: {
            number: '5105105105105100',
            expirationDate: '05/2009'
          },
          threeDSecurePassThru: {
            eciFlag: "",
            cavv: "some_cavv",
            xid: "some_xid"
          }
        };

        return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
          assert.isFalse(response.success);
          assert.equal(
            response.errors.for('transaction').for('threeDSecurePassThru').on("eciFlag")[0].code,
            ValidationErrorCodes.Transaction.ThreeDSecureEciFlagIsRequired
          );

          return done();
        });
      });

      it("returns an error for transaction when the threeDSecurePassThru cavv or xid is missing", function(done) {
        let transactionParams = {
          merchantAccountId: specHelper.threeDSecureMerchantAccountId,
          amount: '5.00',
          creditCard: {
            number: '5105105105105100',
            expirationDate: '05/2009'
          },
          threeDSecurePassThru: {
            eciFlag: "06",
            cavv: "",
            xid: ""
          }
        };

        return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
          assert.isFalse(response.success);
          assert.equal(
            response.errors.for('transaction').for('threeDSecurePassThru').on("cavv")[0].code,
            ValidationErrorCodes.Transaction.ThreeDSecureCavvIsRequired
          );
          assert.equal(
            response.errors.for('transaction').for('threeDSecurePassThru').on("xid")[0].code,
            ValidationErrorCodes.Transaction.ThreeDSecureXidIsRequired
          );

          return done();
        });
      });

      return it("returns an error for transaction when the threeDSecurePassThru eciFlag is invalid", function(done) {
        let transactionParams = {
          merchantAccountId: specHelper.threeDSecureMerchantAccountId,
          amount: '5.00',
          creditCard: {
            number: '5105105105105100',
            expirationDate: '05/2009'
          },
          threeDSecurePassThru: {
            eciFlag: "bad_eci_flag",
            cavv: "some_cavv",
            xid: "some_xid"
          }
        };

        return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
          assert.isFalse(response.success);
          assert.equal(
            response.errors.for('transaction').for('threeDSecurePassThru').on("eciFlag")[0].code,
            ValidationErrorCodes.Transaction.ThreeDSecureEciFlagIsInvalid
          );

          return done();
        });
      });
    });
  });

  describe("find", function() {
    it("finds a transaction", function(done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.find(response.transaction.id, function(err, transaction) {
          assert.equal(transaction.amount, '5.00');

          return done();
        })
      );
    });

    it("exposes disbursementDetails", function(done) {
      let transactionId = "deposittransaction";

      return specHelper.defaultGateway.transaction.find(transactionId, function(err, transaction) {
        assert.equal(transaction.isDisbursed(), true);

        let { disbursementDetails } = transaction;
        assert.equal(disbursementDetails.settlementAmount, '100.00');
        assert.equal(disbursementDetails.settlementCurrencyIsoCode, 'USD');
        assert.equal(disbursementDetails.settlementCurrencyExchangeRate, '1');
        assert.equal(disbursementDetails.disbursementDate, '2013-04-10');
        assert.equal(disbursementDetails.success, true);
        assert.equal(disbursementDetails.fundsHeld, false);

        return done();
      });
    });

    it("exposes disputes", function(done) {
      let transactionId = "disputedtransaction";

      return specHelper.defaultGateway.transaction.find(transactionId, function(err, transaction) {

        let dispute = transaction.disputes[0];
        assert.equal(dispute.amount, '250.00');
        assert.equal(dispute.currencyIsoCode, 'USD');
        assert.equal(dispute.status, Dispute.Status.Won);
        assert.equal(dispute.receivedDate, '2014-03-01');
        assert.equal(dispute.replyByDate, '2014-03-21');
        assert.equal(dispute.reason, Dispute.Reason.Fraud);
        assert.equal(dispute.transactionDetails.id, transactionId);
        assert.equal(dispute.transactionDetails.amount, '1000.00');
        assert.equal(dispute.kind, Dispute.Kind.Chargeback);
        assert.equal(dispute.dateOpened, '2014-03-01');
        assert.equal(dispute.dateWon, '2014-03-07');

        return done();
      });
    });

    it("exposes retrievals", function(done) {
      let transactionId = "retrievaltransaction";

      return specHelper.defaultGateway.transaction.find(transactionId, function(err, transaction) {

        let dispute = transaction.disputes[0];
        assert.equal(dispute.amount, '1000.00');
        assert.equal(dispute.currencyIsoCode, 'USD');
        assert.equal(dispute.status, Dispute.Status.Open);
        assert.equal(dispute.reason, Dispute.Reason.Retrieval);
        assert.equal(dispute.transactionDetails.id, transactionId);
        assert.equal(dispute.transactionDetails.amount, '1000.00');

        return done();
      });
    });

    it("returns a not found error if given a bad id", done =>
      specHelper.defaultGateway.transaction.find('nonexistent_transaction', function(err, response) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);

        return done();
      })
    );

    it("handles whitespace ids", done =>
      specHelper.defaultGateway.transaction.find(' ', function(err, response) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);

        return done();
      })
    );

    it("returns all the required paypal fields", done =>
      specHelper.defaultGateway.transaction.find("settledtransaction", function(err, transaction) {
        assert.isString(transaction.paypalAccount.debugId);
        assert.isString(transaction.paypalAccount.payerEmail);
        assert.isString(transaction.paypalAccount.authorizationId);
        assert.isString(transaction.paypalAccount.payerId);
        assert.isString(transaction.paypalAccount.payerFirstName);
        assert.isString(transaction.paypalAccount.payerLastName);
        assert.isString(transaction.paypalAccount.payerStatus);
        assert.isString(transaction.paypalAccount.sellerProtectionStatus);
        assert.isString(transaction.paypalAccount.captureId);
        assert.isString(transaction.paypalAccount.refundId);
        assert.isString(transaction.paypalAccount.transactionFeeAmount);
        assert.isString(transaction.paypalAccount.transactionFeeCurrencyIsoCode);
        return done();
      })
    );

    return context("threeDSecureInfo", function() {
      it("returns three_d_secure_info if it's present", done =>
        specHelper.defaultGateway.transaction.find("threedsecuredtransaction", function(err, transaction) {
          let info = transaction.threeDSecureInfo;
          assert.isTrue(info.liabilityShifted);
          assert.isTrue(info.liabilityShiftPossible);
          assert.equal(info.enrolled, "Y");
          assert.equal(info.status, "authenticate_successful");
          return done();
        })
      );

      return it("returns null if it's empty", done =>
        specHelper.defaultGateway.transaction.find("settledtransaction", function(err, transaction) {
          assert.isNull(transaction.threeDSecureInfo);
          return done();
        })
      );
    });
  });

  describe("refund", function() {
    it("refunds a transaction", done =>
      specHelper.createTransactionToRefund(transaction =>
        specHelper.defaultGateway.transaction.refund(transaction.id, function(err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.type, 'credit');
          assert.equal(response.transaction.refundedTransactionId, transaction.id);

          return done();
        })
      )
    );

    it("refunds a paypal transaction", done =>
      specHelper.createPayPalTransactionToRefund(transaction =>
        specHelper.defaultGateway.transaction.refund(transaction.id, function(err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.type, 'credit');
          assert.equal(response.transaction.refundedTransactionId, transaction.id);

          return done();
        })
      )
    );

    it("allows refunding partial amounts", done =>
      specHelper.createTransactionToRefund(transaction =>
        specHelper.defaultGateway.transaction.refund(transaction.id, '1.00', function(err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.type, 'credit');
          assert.equal(response.transaction.refundedTransactionId, transaction.id);
          assert.equal(response.transaction.amount, '1.00');

          return done();
        })
      )
    );

    it("allows refunding with options param", done =>
      specHelper.createTransactionToRefund(function(transaction) {
        let options = {
          order_id: 'abcd',
          amount: '1.00'
        };

        return specHelper.defaultGateway.transaction.refund(transaction.id, options, function(err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.type, 'credit');
          assert.equal(response.transaction.refundedTransactionId, transaction.id);
          assert.equal(response.transaction.orderId, 'abcd');
          assert.equal(response.transaction.amount, '1.00');

          return done();
        });
      })
    );

    return it("handles validation errors", function(done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        },
        options: {
          submitForSettlement: true
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.refund(response.transaction.id, '5.00', function(err, response) {
          assert.isNull(err);
          assert.isFalse(response.success);
          assert.equal(response.errors.for('transaction').on('base')[0].code, '91506');

          return done();
        })
      );
    });
  });

  describe("submitForSettlement", function() {
    it("submits a transaction for settlement", function(done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.submitForSettlement(response.transaction.id, function(err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, 'submitted_for_settlement');
          assert.equal(response.transaction.amount, '5.00');

          return done();
        })
      );
    });

    it("submits a paypal transaction for settlement", done =>
      specHelper.defaultGateway.customer.create({}, function(err, response) {
        let paymentMethodParams = {
          customerId: response.customer.id,
          paymentMethodNonce: Nonces.PayPalFuturePayment
        };

        return specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function(err, response) {
          let transactionParams = {
            amount: '5.00',
            paymentMethodToken: response.paymentMethod.token
          };

          return specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
            specHelper.defaultGateway.transaction.submitForSettlement(response.transaction.id, function(err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);
              assert.equal(response.transaction.status, 'settling');
              assert.equal(response.transaction.amount, '5.00');

              return done();
            })
          );
        });
      })
    );

    it("allows submitting for a partial amount", function(done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.submitForSettlement(response.transaction.id, '3.00', function(err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, 'submitted_for_settlement');
          assert.equal(response.transaction.amount, '3.00');

          return done();
        })
      );
    });

    it("allows submitting with an order id", function(done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.submitForSettlement(response.transaction.id, '3.00', {orderId: "ABC123"}, function(err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, 'submitted_for_settlement');
          assert.equal(response.transaction.orderId, 'ABC123');

          return done();
        })
      );
    });

    it("allows submitting with an order id without specifying an amount", function(done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.submitForSettlement(response.transaction.id, null, {orderId: "ABC123"}, function(err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, 'submitted_for_settlement');
          assert.equal(response.transaction.orderId, 'ABC123');
          assert.equal(response.transaction.amount, '5.00');

          return done();
        })
      );
    });

    it("allows submitting with a descriptor", function(done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      let submitForSettlementParams = {
        descriptor: {
          name: 'abc*def',
          phone: '1234567890',
          url: 'ebay.com'
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.submitForSettlement(response.transaction.id, null, submitForSettlementParams, function(err, response) {
          assert.isTrue(response.success);
          assert.equal(response.transaction.descriptor.name, 'abc*def');
          assert.equal(response.transaction.descriptor.phone, '1234567890');
          assert.equal(response.transaction.descriptor.url, 'ebay.com');

          return done();
        })
      );
    });

    it("handles validation errors", function(done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        },
        options: {
          submitForSettlement: true
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.submitForSettlement(response.transaction.id, function(err, response) {
          assert.isNull(err);
          assert.isFalse(response.success);
          assert.equal(response.errors.for('transaction').on('base')[0].code, '91507');

          return done();
        })
      );
    });

    it("calls callback with an error when options object contains invalid keys", function(done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.submitForSettlement(response.transaction.id, '5.00', {"invalidKey": "1234"}, function(err, response) {
          assert.equal(err.type, "invalidKeysError");
          assert.equal(err.message, "These keys are invalid: invalidKey");

          return done();
        })
      );
    });

    return context("amex rewards", function(done) {
      it("succeeds", function(done) {
        let transactionParams = {
          merchantAccountId: specHelper.fakeAmexDirectMerchantAccountId,
          amount: "10.00",
          creditCard: {
            number: CreditCardNumbers.AmexPayWithPoints.Success,
            expirationDate: "12/2020"
          },
          options: {
            amexRewards: {
              requestId: "ABC123",
              points: "1000",
              currencyAmount: "10.00",
              currencyIsoCode: "USD"
            }
          }
        };

        return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, Transaction.Status.Authorized);

          return specHelper.defaultGateway.transaction.submitForSettlement(response.transaction.id, function(err, response) {
            assert.isTrue(response.success);

            return done();
          });
        });
      });

      it("succeeds even if the card is ineligible", function(done) {
        let transactionParams = {
          merchantAccountId: specHelper.fakeAmexDirectMerchantAccountId,
          amount: "10.00",
          creditCard: {
            number: CreditCardNumbers.AmexPayWithPoints.IneligibleCard,
            expirationDate: "12/2020"
          },
          options: {
            amexRewards: {
              requestId: "ABC123",
              points: "1000",
              currencyAmount: "10.00",
              currencyIsoCode: "USD"
            }
          }
        };

        return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, Transaction.Status.Authorized);

          return specHelper.defaultGateway.transaction.submitForSettlement(response.transaction.id, function(err, response) {
            assert.isTrue(response.success);

            return done();
          });
        });
      });

      return it("succeeds even if the card's balance is insufficient", function(done) {
        let transactionParams = {
          merchantAccountId: specHelper.fakeAmexDirectMerchantAccountId,
          amount: "10.00",
          creditCard: {
            number: CreditCardNumbers.AmexPayWithPoints.InsufficientPoints,
            expirationDate: "12/2020"
          },
          options: {
            amexRewards: {
              requestId: "ABC123",
              points: "1000",
              currencyAmount: "10.00",
              currencyIsoCode: "USD"
            }
          }
        };

        return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, Transaction.Status.Authorized);

          return specHelper.defaultGateway.transaction.submitForSettlement(response.transaction.id, function(err, response) {
            assert.isTrue(response.success);

            return done();
          });
        });
      });
    });
  });

  describe("updateDetails", function() {
    it("updates the transaction details", function(done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        },
        options: {
          submitForSettlement: true
        }
      };

      let updateParams = {
        amount: '4.00',
        orderId: '123',
        descriptor: {
          name: 'abc*def',
          phone: '1234567890',
          url: 'ebay.com'
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.updateDetails(response.transaction.id, updateParams, function(err, response) {

          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, 'submitted_for_settlement');
          assert.equal(response.transaction.amount, '4.00');
          assert.equal(response.transaction.orderId, '123');
          assert.equal(response.transaction.descriptor.name, 'abc*def');
          assert.equal(response.transaction.descriptor.phone, '1234567890');
          assert.equal(response.transaction.descriptor.url, 'ebay.com');

          return done();
        })
      );
    });

    it("returns an authorizationError and logs when a key is invalid", function(done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        },
        options: {
          submitForSettlement: true
        }
      };

      let updateParams = {
        amount: '4.00',
        invalidParam: "something invalid"
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.updateDetails(response.transaction.id, updateParams, function(err, response) {
          assert.equal(err.type, "invalidKeysError");
          assert.equal(err.message, "These keys are invalid: invalidParam");

          return done();
        })
      );
    });

    it("validates amount", function(done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        },
        options: {
          submitForSettlement: true
        }
      };

      let updateParams =
        {amount: '555.00'};

      return specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.updateDetails(response.transaction.id, updateParams, function(err, response) {

          assert.isNull(err);
          assert.isFalse(response.success);
          assert.equal(response.errors.for('transaction').on('amount')[0].code, '91522');

          return done();
        })
      );
    });

    it("validates descriptor", function(done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        },
        options: {
          submitForSettlement: true
        }
      };

      let updateParams = {
        amount: '4.00',
        orderId: '123',
        descriptor: {
          name: 'invalid name',
          phone: 'invalid phone',
          url: 'invalid url that is invalid because it is too long'
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.updateDetails(response.transaction.id, updateParams, function(err, response) {

          assert.isNull(err);
          assert.isFalse(response.success);
          assert.equal(response.errors.for('transaction').for('descriptor').on('name')[0].code, '92201');
          assert.equal(response.errors.for('transaction').for('descriptor').on('phone')[0].code, '92202');
          assert.equal(response.errors.for('transaction').for('descriptor').on('url')[0].code, '92206');

          return done();
        })
      );
    });

    it("validates orderId", function(done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        },
        options: {
          submitForSettlement: true
        }
      };

      let updateParams =
        {orderId: new Array(257).join('X')};

      return specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.updateDetails(response.transaction.id, updateParams, function(err, response) {

          assert.isNull(err);
          assert.isFalse(response.success);
          assert.equal(response.errors.for('transaction').on('orderId')[0].code, '91501');

          return done();
        })
      );
    });

    it("validates processor", function(done) {
      let transactionParams = {
        merchantAccountId: specHelper.fakeAmexDirectMerchantAccountId,
        amount: "10.00",
        creditCard: {
          number: CreditCardNumbers.AmexPayWithPoints.Success,
          expirationDate: "12/2020"
        },
        options: {
          submitForSettlement: true
        }
      };

      let updateParams = {
        amount: '4.00',
        orderId: '123',
        descriptor: {
          name: 'abc*def',
          phone: '1234567890',
          url: 'ebay.com'
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.updateDetails(response.transaction.id, updateParams, function(err, response) {

          assert.isNull(err);
          assert.isFalse(response.success);
          assert.equal(response.errors.for('transaction').on('base')[0].code, '915130');

          return done();
        })
      );
    });

    return it("validates status", function(done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      let updateParams = {
        amount: '4.00',
        orderId: '123',
        descriptor: {
          name: 'abc*def',
          phone: '1234567890',
          url: 'ebay.com'
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.updateDetails(response.transaction.id, updateParams, function(err, response) {

          assert.isNull(err);
          assert.isFalse(response.success);
          assert.equal(response.errors.for('transaction').on('base')[0].code, '915129');

          return done();
        })
      );
    });
  });

  describe("void", function() {
    it("voids a transaction", function(done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.void(response.transaction.id, function(err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, 'voided');

          return done();
        })
      );
    });

    it("voids a paypal transaction", done =>
      specHelper.defaultGateway.customer.create({}, function(err, response) {
        let paymentMethodParams = {
          customerId: response.customer.id,
          paymentMethodNonce: Nonces.PayPalFuturePayment
        };

        return specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function(err, response) {
          let transactionParams = {
            amount: '5.00',
            paymentMethodToken: response.paymentMethod.token
          };

          return specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
            specHelper.defaultGateway.transaction.void(response.transaction.id, function(err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);
              assert.equal(response.transaction.status, 'voided');

              return done();
            })
          );
        });
      })
    );

    return it("handles validation errors", function(done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.void(response.transaction.id, (err, response) =>
          specHelper.defaultGateway.transaction.void(response.transaction.id, function(err, response) {
            assert.isNull(err);
            assert.isFalse(response.success);
            assert.equal(response.errors.for('transaction').on('base')[0].code, '91504');

            return done();
          })
        )
      );
    });
  });

  describe("cloneTransaction", function() {
    it("clones a transaction", function(done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
        let cloneParams = {
          amount: '123.45',
          channel: 'MyShoppingCartProvider',
          options: {
            submitForSettlement: 'false'
          }
        };

        return specHelper.defaultGateway.transaction.cloneTransaction(response.transaction.id, cloneParams, function(err, response) {
          assert.isTrue(response.success);
          let { transaction } = response;
          assert.equal(transaction.amount, '123.45');
          assert.equal(transaction.channel, 'MyShoppingCartProvider');
          assert.equal(transaction.creditCard.maskedNumber, '510510******5100');
          assert.equal(transaction.creditCard.expirationDate, '05/2012');

          return done();
        });
      });
    });

    it("handles validation errors", function(done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      return specHelper.defaultGateway.transaction.credit(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.cloneTransaction(response.transaction.id, {amount: '123.45'}, function(err, response) {
          assert.isFalse(response.success);
          assert.equal(
            response.errors.for('transaction').on('base')[0].code,
            '91543'
          );

          return done();
        })
      );
    });

    return it("can submit for settlement", function(done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
        let cloneParams = {
          amount: '123.45',
          channel: 'MyShoppingCartProvider',
          options: {
            submitForSettlement: 'true'
          }
        };

        return specHelper.defaultGateway.transaction.cloneTransaction(response.transaction.id, cloneParams, function(err, response) {
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, 'submitted_for_settlement');
          return done();
        });
      });
    });
  });

  return describe("submitForPartialSettlement", function() {
    it("creates partial settlement transactions for an authorized transaction", function(done) {
      let transactionParams = {
        amount: '10.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        let authorizedTransaction = response.transaction;

        return specHelper.defaultGateway.transaction.submitForPartialSettlement(authorizedTransaction.id, '6.00', function(err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, 'submitted_for_settlement');
          assert.equal(response.transaction.amount, '6.00');

          return specHelper.defaultGateway.transaction.submitForPartialSettlement(authorizedTransaction.id, '4.00', function(err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.equal(response.transaction.status, 'submitted_for_settlement');
            assert.equal(response.transaction.amount, '4.00');

            return specHelper.defaultGateway.transaction.find(authorizedTransaction.id, function(err, transaction) {
              assert.isTrue(response.success);
              assert.equal(2, transaction.partialSettlementTransactionIds.length);
              return done();
            });
          });
        });
      });
    });

    it("allows submitting with an order id", function(done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.submitForPartialSettlement(response.transaction.id, '3.00', {orderId: "ABC123"}, function(err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, 'submitted_for_settlement');
          assert.equal(response.transaction.orderId, 'ABC123');

          return done();
        })
      );
    });

    it("allows submitting with a descriptor", function(done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      let submitForPartialSettlementParams = {
        descriptor: {
          name: 'abc*def',
          phone: '1234567890',
          url: 'ebay.com'
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.submitForPartialSettlement(response.transaction.id, '3.00', submitForPartialSettlementParams, function(err, response) {
          assert.isTrue(response.success);
          assert.equal(response.transaction.descriptor.name, 'abc*def');
          assert.equal(response.transaction.descriptor.phone, '1234567890');
          assert.equal(response.transaction.descriptor.url, 'ebay.com');

          return done();
        })
      );
    });

    it("handles validation errors", function(done) {
      let transactionParams = {
        amount: '5.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        },
        options: {
          submitForSettlement: true
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) =>
        specHelper.defaultGateway.transaction.submitForPartialSettlement(response.transaction.id, function(err, response) {
          assert.isNull(err);
          assert.isFalse(response.success);
          assert.equal(response.errors.for('transaction').on('base')[0].code, '91507');

          return done();
        })
      );
    });

    it("cannot create a partial settlement transaction on a partial settlement transaction", function(done) {
      let transactionParams = {
        amount: '10.00',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/12'
        }
      };

      return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        let authorizedTransaction = response.transaction;

        return specHelper.defaultGateway.transaction.submitForPartialSettlement(authorizedTransaction.id, '6.00', function(err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.transaction.status, 'submitted_for_settlement');
          assert.equal(response.transaction.amount, '6.00');

          return specHelper.defaultGateway.transaction.submitForPartialSettlement(response.transaction.id, '4.00', function(err, response) {
            assert.isFalse(response.success);
            let errorCode = response.errors.for('transaction').on('base')[0].code;
            assert.equal(errorCode, ValidationErrorCodes.Transaction.CannotSubmitForPartialSettlement);
            return done();
          });
        });
      });
    });

    return context("shared payment methods", function() {
      let address = null;
      let creditCard = null;
      let customer = null;
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
          ({ customer } = response);

          let creditCardParams = {
            customerId: customer.id,
            cardholderName: "Adam Davis",
            number: "4111111111111111",
            expirationDate: "05/2009",
            billingAddress: {
              postalCode: "95131"
            }
          };

          let addressParams = {
            customerId: customer.id,
            firstName: "Firsty",
            lastName: "Lasty",
          };

          return partnerMerchantGateway.address.create(addressParams, function(err, response) {
            ({ address } = response);

            return partnerMerchantGateway.creditCard.create(creditCardParams, function(err, response) {
              ({ creditCard } = response);

              let oauthGateway = braintree.connect({
                clientId: "client_id$development$integration_client_id",
                clientSecret: "client_secret$development$integration_client_secret",
                environment: Environment.Development
              });

              let accessTokenParams = {
                merchantPublicId: "integration_merchant_id",
                scope: "grant_payment_method,shared_vault_transactions"
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
      });

      it("returns oauth app details on transactions created via nonce granting", done =>
        grantingGateway.paymentMethod.grant(creditCard.token, false, function(err, response) {

          let transactionParams = {
            paymentMethodNonce: response.paymentMethodNonce.nonce,
            amount: Braintree.Test.TransactionAmounts.Authorize
          };

          return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
            assert.isTrue(response.success);
            assert.equal(response.transaction.facilitatorDetails.oauthApplicationClientId, "client_id$development$integration_client_id");
            assert.equal(response.transaction.facilitatorDetails.oauthApplicationName, "PseudoShop");
            assert.isNull(response.transaction.billing.postalCode);
            return done();
          });
        })
      );

      it("returns billing postal code in transactions created via nonce granting when requested during grant API", done =>
        grantingGateway.paymentMethod.grant(creditCard.token, { allow_vaulting: false, include_billing_postal_code: true }, function(err, response) {

          let transactionParams = {
            paymentMethodNonce: response.paymentMethodNonce.nonce,
            amount: Braintree.Test.TransactionAmounts.Authorize
          };

          return specHelper.defaultGateway.transaction.sale(transactionParams, function(err, response) {
            assert.isTrue(response.success);
            assert.equal(response.transaction.billing.postalCode, "95131");
            return done();
          });
        })
      );

      return it("allows transactions to be created with a shared payment method, customer, billing and shipping addresses", function(done) {
        let transactionParams = {
          sharedPaymentMethodToken: creditCard.token,
          sharedCustomerId: customer.id,
          sharedShippingAddressId: address.id,
          sharedBillingAddressId: address.id,
          amount: Braintree.Test.TransactionAmounts.Authorize
        };

        return grantingGateway.transaction.sale(transactionParams, function(err, response) {
          assert.isTrue(response.success);
          assert.equal(response.transaction.shipping.firstName, address.firstName);
          assert.equal(response.transaction.billing.firstName, address.firstName);
          return done();
        });
      });
    });
  });
});
