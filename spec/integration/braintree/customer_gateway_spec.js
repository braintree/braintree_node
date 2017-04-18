'use strict';

let VenmoSdk = require('../../../lib/braintree/test/venmo_sdk').VenmoSdk;
let Nonces = require('../../../lib/braintree/test/nonces').Nonces;
let Config = require('../../../lib/braintree/config').Config;
let braintree = specHelper.braintree;

describe('CustomerGateway', function () {
  describe('create', function () {
    it('creates a customer', done =>
      specHelper.defaultGateway.customer.create({firstName: 'John', lastName: 'Smith'}, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.customer.firstName, 'John');
        assert.equal(response.customer.lastName, 'Smith');

        done();
      })
    );

    it('creates a customer using an access token', function (done) {
      let oauthGateway = braintree.connect({
        clientId: 'client_id$development$integration_client_id',
        clientSecret: 'client_secret$development$integration_client_secret'
      });

      specHelper.createToken(oauthGateway, {merchantPublicId: 'integration_merchant_id', scope: 'read_write'}, function (err, response) {
        let gateway = braintree.connect({
          accessToken: response.credentials.accessToken
        });

        return gateway.customer.create({firstName: 'John', lastName: 'Smith'}, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.customer.firstName, 'John');
          assert.equal(response.customer.lastName, 'Smith');

          done();
        });
      });
    });

    it('creates a customer with risk data', function (done) {
      let customerParams = {
        credit_card: { // eslint-disable-line camelcase
          number: '4111111111111111',
          expiration_month: '11', // eslint-disable-line camelcase
          expiration_year: '2099', // eslint-disable-line camelcase
          options: {
            verifyCard: true
          }
        },
        riskData: {
          customer_browser: 'IE6', // eslint-disable-line camelcase
          customer_ip: '127.0.0.0' // eslint-disable-line camelcase
        }
      };

      specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);

        done();
      });
    });

    it('handles uft8 characters', done =>
      specHelper.defaultGateway.customer.create({firstName: 'Jöhn', lastName: 'Smith'}, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.customer.firstName, 'Jöhn');
        assert.equal(response.customer.lastName, 'Smith');

        done();
      })
    );

    it('creates blank customers', done =>
      specHelper.defaultGateway.customer.create({}, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);

        done();
      })
    );

    it('stores custom fields', function (done) {
      let customerParams = {
        customFields: {
          storeMe: 'custom value'
        }
      };

      specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.customer.customFields.storeMe, 'custom value');

        done();
      });
    });

    context('and vaults a payment method', function () {
      it('creates customers with credit cards', function (done) {
        let customerParams = {
          firstName: 'John',
          lastName: 'Smith',
          creditCard: {
            number: '5105105105105100',
            expirationDate: '05/2012'
          }
        };

        specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.customer.firstName, 'John');
          assert.equal(response.customer.lastName, 'Smith');
          assert.equal(response.customer.creditCards.length, 1);
          assert.equal(response.customer.creditCards[0].expirationMonth, '05');
          assert.equal(response.customer.creditCards[0].expirationYear, '2012');
          assert.equal(response.customer.creditCards[0].maskedNumber, '510510******5100');
          assert.isTrue(/^\w{32}$/.test(response.customer.creditCards[0].uniqueNumberIdentifier));

          done();
        });
      });

      it('creates a customer with a payment method nonce backed by a credit card', function (done) {
        let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig)); // eslint-disable-line new-cap

        specHelper.defaultGateway.clientToken.generate({}, function (err, result) {
          let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
          let authorizationFingerprint = clientToken.authorizationFingerprint;
          let params = {
            authorizationFingerprint,
            sharedCustomerIdentifierType: 'testing',
            sharedCustomerIdentifier: 'testing-identifier',
            share: true,
            credit_card: { // eslint-disable-line camelcase
              number: '4111111111111111',
              expiration_month: '11', // eslint-disable-line camelcase
              expiration_year: '2099' // eslint-disable-line camelcase
            }
          };

          return myHttp.post('/client_api/v1/payment_methods/credit_cards.json', params, function (statusCode, body) {
            let nonce = JSON.parse(body).creditCards[0].nonce;
            let customerParams = {
              creditCard: {
                paymentMethodNonce: nonce
              }
            };

            specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);
              assert.equal(response.customer.creditCards[0].bin, '411111');
              assert.equal(response.customer.paymentMethods[0].bin, '411111');

              done();
            }); });
        });
      });

      it('creates a customer with an Apple Pay payment method nonce', function (done) {
        let customerParams =
          {paymentMethodNonce: Nonces.ApplePayAmEx};

        specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.isNotNull(response.customer.applePayCards[0]);
          let applePayCard = response.customer.applePayCards[0];

          assert.isNotNull(applePayCard.token);
          assert.isNotNull(applePayCard.payment_instrument_name);

          done();
        });
      });

      it('creates a customer with an Android Pay proxy card nonce', function (done) {
        let customerParams =
          {paymentMethodNonce: Nonces.AndroidPayDiscover};

        specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.isNotNull(response.customer.androidPayCards[0]);
          let androidPayCard = response.customer.androidPayCards[0];

          assert.isNotNull(androidPayCard.token);
          assert.isNotNull(androidPayCard.googleTransactionId);
          assert.equal(androidPayCard.cardType, specHelper.braintree.CreditCard.CardType.Discover);
          assert.equal(androidPayCard.last4, '1117');

          done();
        });
      });

      it('creates a customer with an Android Pay network token nonce', function (done) {
        let customerParams =
          {paymentMethodNonce: Nonces.AndroidPayMasterCard};

        specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.isNotNull(response.customer.androidPayCards[0]);
          let androidPayCard = response.customer.androidPayCards[0];

          assert.isNotNull(androidPayCard.token);
          assert.isNotNull(androidPayCard.googleTransactionId);
          assert.equal(androidPayCard.cardType, specHelper.braintree.CreditCard.CardType.MasterCard);
          assert.equal(androidPayCard.last4, '4444');

          done();
        });
      });

      it('creates a customer with an Amex Express Checkout card nonce', function (done) {
        let customerParams =
          {paymentMethodNonce: Nonces.AmexExpressCheckout};

        specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.isNotNull(response.customer.amexExpressCheckoutCards[0]);
          let amexExpressCheckoutCard = response.customer.amexExpressCheckoutCards[0];

          assert.isNotNull(amexExpressCheckoutCard.token);
          assert.equal(amexExpressCheckoutCard.cardType, specHelper.braintree.CreditCard.CardType.AmEx);
          assert.match(amexExpressCheckoutCard.cardMemberNumber, /^\d{4}$/);
          assert.equal(response.customer.paymentMethods[0], amexExpressCheckoutCard);

          done();
        });
      });

      it('creates a customer with an Venmo Account nonce', function (done) {
        let customerParams =
          {paymentMethodNonce: Nonces.VenmoAccount};

        specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.isNotNull(response.customer.venmoAccounts[0]);
          let venmoAccount = response.customer.venmoAccounts[0];

          assert.isNotNull(venmoAccount.token);
          assert.equal(venmoAccount.username, 'venmojoe');
          assert.equal(venmoAccount.venmoUserId, 'Venmo-Joe-1');
          assert.equal(response.customer.paymentMethods[0], venmoAccount);

          done();
        });
      });

      it('creates a customer with a Us Bank Account nonce', done =>
        specHelper.generateValidUsBankAccountNonce(function (token) {
          let customerParams =
            {paymentMethodNonce: token};

          specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.isNotNull(response.customer.usBankAccounts[0]);
            let usBankAccount = response.customer.usBankAccounts[0];

            assert.isNotNull(usBankAccount.token);
            assert.equal(usBankAccount.routingNumber, '021000021');
            assert.equal(usBankAccount.last4, '1234');
            assert.equal(usBankAccount.accountType, 'checking');
            assert.equal(usBankAccount.accountHolderName, 'Dan Schulman');
            assert.match(usBankAccount.bankName, /CHASE/);
            assert.equal(response.customer.paymentMethods[0], usBankAccount);

            done();
          }); })
      );

      it('creates a customer with a Coinbase account payment method nonce', function (done) {
        let customerParams =
          {paymentMethodNonce: Nonces.Coinbase};

        specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.isNotNull(response.customer.coinbaseAccounts[0]);

          done();
        });
      });

      it('creates a customer with a paypal account payment method nonce', function (done) {
        let customerParams =
          {paymentMethodNonce: Nonces.PayPalFuturePayment};

        specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.isString(response.customer.paypalAccounts[0].email);

          done();
        });
      });

      it('creates a customer with a paypal account payment method nonce with intent=order', function (done) {
        specHelper.defaultGateway.clientToken.generate({}, function (err, result) {
          let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
          let authorizationFingerprint = clientToken.authorizationFingerprint;
          let nonceParams = {
            authorizationFingerprint: authorizationFingerprint,
            paypalAccount: {
              intent: 'order',
              paymentToken: 'paypal-payment-token',
              payerId: 'paypal-payer-id'
            }
          };
          let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig)); // eslint-disable-line new-cap

          myHttp.post('/client_api/v1/payment_methods/paypal_accounts.json', nonceParams, function (statusCode, body) {
            let nonce = JSON.parse(body).paypalAccounts[0].nonce;
            let customerParams = {paymentMethodNonce: nonce};

            specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);
              assert.isString(response.customer.paypalAccounts[0].email);

              done();
            });
          });
        });
      });

      it('creates a customer with a paypal account payment method nonce with intent=order and paypal options', function (done) {
        specHelper.defaultGateway.clientToken.generate({}, function (err, result) {
          let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
          let authorizationFingerprint = clientToken.authorizationFingerprint;
          let nonceParams = {
            authorizationFingerprint: authorizationFingerprint,
            paypalAccount: {
              intent: 'order',
              paymentToken: 'paypal-payment-token',
              payerId: 'paypal-payer-id'
            }
          };
          let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig)); // eslint-disable-line new-cap

          myHttp.post('/client_api/v1/payment_methods/paypal_accounts.json', nonceParams, function (statusCode, body) {
            let nonce = JSON.parse(body).paypalAccounts[0].nonce;
            let customerParams = {
              paymentMethodNonce: nonce,
              options: {
                paypal: {
                  payeeEmail: 'payee@example.com',
                  orderId: 'merchant-order-id',
                  customField: 'custom merchant field',
                  description: 'merchant description'
                }
              }
            };

            specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);
              assert.isString(response.customer.paypalAccounts[0].email);

              done();
            });
          });
        });
      });

      it('does not vault a paypal account only authorized for one-time use', function (done) {
        let customerParams =
          {paymentMethodNonce: Nonces.PayPalOneTimePayment};

        specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
          assert.isNull(err);
          assert.isFalse(response.success);
          assert.equal(
            response.errors.for('customer').for('paypalAccount').on('base')[0].code,
            '82902'
          );
        });

        done();
      });
    });

    it('fails on duplicate payment methods when provided the option to do so', function (done) {
      let customerParams = {
        firstName: 'John',
        lastName: 'Smith',
        creditCard: {
          number: '5555555555554444',
          expirationDate: '05/2012',
          options: {
            failOnDuplicatePaymentMethod: true
          }
        }
      };

      specHelper.defaultGateway.customer.create(customerParams, () =>
        specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
          assert.isFalse(response.success);
          assert.equal(
            response.errors.for('customer').for('creditCard').on('number')[0].code,
            '81724'
          );

          done();
        })
      );
    });

    it('allows verifying cards', function (done) {
      let customerParams = {
        firstName: 'John',
        lastName: 'Smith',
        creditCard: {
          number: '5555555555554444',
          expirationDate: '05/2012',
          options: {
            verifyCard: true
          }
        }
      };

      specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);

        done();
      });
    });

    it('allows verifying cards with a verification_amount', function (done) {
      let customerParams = {
        firstName: 'John',
        lastName: 'Smith',
        creditCard: {
          number: '5555555555554444',
          expirationDate: '05/2012',
          options: {
            verifyCard: true,
            verificationAmount: '2.00'
          }
        }
      };

      specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);

        done();
      });
    });

    it('handles unsuccessful verifications', function (done) {
      let customerParams = {
        firstName: 'John',
        lastName: 'Smith',
        creditCard: {
          number: '6011000990139424',
          expirationDate: '05/2012',
          options: {
            verifyCard: true
          }
        }
      };

      specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
        assert.isNull(err);
        assert.isFalse(response.success);
        assert.equal(response.verification.status, 'processor_declined');
        assert.equal(response.verification.processorResponseCode, '2000');
        assert.equal(response.verification.processorResponseText, 'Do Not Honor');

        done();
      });
    });

    it('handles validation errors', function (done) {
      let customerParams = {
        creditCard: {
          number: 'invalid card number',
          expirationDate: '05/2012'
        }
      };

      specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
        assert.isFalse(response.success);
        assert.equal(response.message, 'Credit card number is invalid.');
        assert.equal(
          response.errors.for('customer').for('creditCard').on('number')[0].code,
          '81715'
        );
        let errorCodes = Array.from(response.errors.deepErrors()).map((error) => error.code);

        assert.equal(errorCodes.length, 1);
        assert.include(errorCodes, '81715');

        done();
      });
    });

    it('allows creating a customer with a billing addres', function (done) {
      let customerParams = {
        firstName: 'John',
        lastName: 'Smith',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/2012',
          billingAddress: {
            streetAddress: '123 Fake St',
            extendedAddress: 'Suite 403',
            locality: 'Chicago',
            region: 'IL',
            postalCode: '60607',
            countryName: 'United States of America'
          }
        }
      };

      specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.customer.firstName, 'John');
        assert.equal(response.customer.lastName, 'Smith');
        assert.equal(response.customer.creditCards.length, 1);
        assert.equal(response.customer.creditCards[0].expirationMonth, '05');
        assert.equal(response.customer.creditCards[0].expirationYear, '2012');
        assert.equal(response.customer.creditCards[0].maskedNumber, '510510******5100');
        assert.equal(response.customer.creditCards.length, 1);
        let billingAddress = response.customer.creditCards[0].billingAddress;

        assert.equal(billingAddress.streetAddress, '123 Fake St');
        assert.equal(billingAddress.extendedAddress, 'Suite 403');
        assert.equal(billingAddress.locality, 'Chicago');
        assert.equal(billingAddress.region, 'IL');
        assert.equal(billingAddress.postalCode, '60607');
        assert.equal(billingAddress.countryName, 'United States of America');

        done();
      });
    });

    it('handles validation errors on nested billing addresses', function (done) {
      let customerParams = {
        creditCard: {
          number: 'invalid card number',
          expirationDate: '05/2012',
          billingAddress: {
            countryName: 'invalid country'
          }
        }
      };

      specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
        assert.isFalse(response.success);
        assert.equal(response.message, 'Credit card number is invalid.\nCountry name is not an accepted country.');
        assert.equal(
          response.errors.for('customer').for('creditCard').on('number')[0].code,
          '81715'
        );
        assert.equal(
          response.errors.for('customer').for('creditCard').for('billingAddress').on('countryName')[0].code,
          '91803'
        );
        let errorCodes = Array.from(response.errors.deepErrors()).map((error) => error.code);

        assert.equal(errorCodes.length, 2);
        assert.include(errorCodes, '81715');
        assert.include(errorCodes, '91803');
        assert.equal(response.params.customer.creditCard.expirationDate, '05/2012');
        assert.equal(response.params.customer.creditCard.billingAddress.countryName, 'invalid country');

        done();
      });
    });

    it('creates a customer with venmo sdk payment method code', function (done) {
      let customerParams = {
        creditCard: {
          venmoSdkPaymentMethodCode: VenmoSdk.VisaPaymentMethodCode
        }
      };

      specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.customer.creditCards[0].bin, '411111');

        done();
      });
    });

    it('creates a customer with venmo sdk session', function (done) {
      let customerParams = {
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/2012',
          options: {
            venmoSdkSession: VenmoSdk.Session
          }
        }
      };

      specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.isTrue(response.customer.creditCards[0].venmoSdk);

        done();
      });
    });

    it('creates a customer with a params nonce', function (done) {
      let paymentMethodParams = {
        creditCard: {
          number: '4111111111111111',
          expirationMonth: '12',
          expirationYear: '2099'
        }
      };

      specHelper.generateNonceForNewPaymentMethod(paymentMethodParams, null, function (nonce) {
        let customerParams = {
          firstName: 'Bob',
          lastName: 'Fisher',
          paymentMethodNonce: nonce
        };

        specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.customer.creditCards[0].bin, '411111');

          done();
        }); });
    });
  });

  describe('find', function () {
    it('finds a custoemr', function (done) {
      let customerParams = {
        firstName: 'John',
        lastName: 'Smith',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/2014',
          billingAddress: {
            company: '',
            streetAddress: '123 E Fake St',
            locality: 'Chicago',
            region: 'IL',
            postalCode: '60607'
          }
        }
      };

      specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
        assert.isNull(err);
        specHelper.defaultGateway.customer.find(response.customer.id, function (err, customer) {
          assert.isNull(err);
          assert.equal(customer.firstName, 'John');
          assert.equal(customer.lastName, 'Smith');
          let billingAddress = customer.creditCards[0].billingAddress;

          assert.equal(billingAddress.streetAddress, '123 E Fake St');
          assert.equal(billingAddress.company, '');

          done();
        });
      });
    });

    it('returns both credit cards and paypal accounts for a given customer', function (done) {
      let customerParams = {
        firstName: 'John',
        lastName: 'Smith',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/2014',
          billingAddress: {
            company: '',
            streetAddress: '123 E Fake St',
            locality: 'Chicago',
            region: 'IL',
            postalCode: '60607'
          }
        }
      };

      specHelper.defaultGateway.customer.create(customerParams, function (err, customerResponse) {
        assert.isNull(err);
        assert.equal(customerResponse.success, true);

        let paypalAccountParams = {
          customerId: customerResponse.customer.id,
          paymentMethodNonce: Nonces.PayPalFuturePayment
        };

        specHelper.defaultGateway.paymentMethod.create(paypalAccountParams, function (err, paypalResponse) {
          assert.isNull(err);
          assert.equal(paypalResponse.success, true);

          specHelper.defaultGateway.customer.find(customerResponse.customer.id, function (err, customer) {
            assert.isNull(err);
            assert.equal(customer.firstName, 'John');
            assert.equal(customer.lastName, 'Smith');
            assert.equal(customer.creditCards.length, 1);
            assert.equal(customer.paypalAccounts.length, 1);

            done();
          });
        });
      });
    });

    it('returns us bank account for a given customer', done =>
      specHelper.generateValidUsBankAccountNonce(function (token) {
        let customerParams =
          {paymentMethodNonce: token};

        specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);

          specHelper.defaultGateway.customer.find(response.customer.id, function (err, customer) {
            assert.isNull(err);
            assert.isNotNull(customer);
            assert.isNotNull(customer.usBankAccounts[0]);
            let usBankAccount = customer.usBankAccounts[0];

            assert.isNotNull(usBankAccount.token);
            assert.equal(usBankAccount.routingNumber, '021000021');
            assert.equal(usBankAccount.last4, '1234');
            assert.equal(usBankAccount.accountType, 'checking');
            assert.equal(usBankAccount.accountHolderName, 'Dan Schulman');
            assert.match(usBankAccount.bankName, /CHASE/);
            assert.equal(customer.paymentMethods[0], usBankAccount);

            done();
          });
        });
      })
    );

    it('returns an error if unable to find the customer', done =>
      specHelper.defaultGateway.customer.find('nonexistent_customer', function (err) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);

        done();
      })
    );

    it('handles whitespace ids', done =>
      specHelper.defaultGateway.customer.find(' ', function (err) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);

        done();
      })
    );
  });

  describe('update', function () {
    let customerId = null;

    beforeEach(function (done) {
      let customerParams = {
        firstName: 'Old First Name',
        lastName: 'Old Last Name'
      };

      specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
        customerId = response.customer.id;
        done();
      });
    });

    it('updates a customer', function (done) {
      let customerParams = {
        firstName: 'New First Name',
        lastName: 'New Last Name'
      };

      specHelper.defaultGateway.customer.update(customerId, customerParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.customer.firstName, 'New First Name');
        assert.equal(response.customer.lastName, 'New Last Name');

        done();
      });
    });

    it('updates default payment method in options', function (done) {
      let token1 = specHelper.randomId();
      let paymentMethodParams = {
        customerId,
        paymentMethodNonce: Nonces.TransactableVisa,
        token: token1
      };

      specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.paymentMethod.default);

        let token2 = specHelper.randomId();

        paymentMethodParams = {
          customerId,
          paymentMethodNonce: Nonces.TransactableMasterCard,
          token: token2
        };

        specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function (err, response) {
          assert.isNull(err);
          assert.isFalse(response.paymentMethod.default);

          let customerParams = {
            creditCard: {
              options: {
                updateExistingToken: token2,
                makeDefault: true
              }
            }
          };

          specHelper.defaultGateway.customer.update(customerId, customerParams, function (err, response) {
            assert.isTrue(response.success);

            specHelper.defaultGateway.paymentMethod.find(token2, function (err, creditCard) {
              assert.isTrue(creditCard.default);
              assert.equal(creditCard.token, token2);

              done();
            });
          });
        });
      });
    });

    it('updates default payment method', function (done) {
      let token1 = specHelper.randomId();
      let paymentMethodParams = {
        customerId,
        paymentMethodNonce: Nonces.TransactableVisa,
        token: token1
      };

      specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.paymentMethod.default);

        let token2 = specHelper.randomId();

        paymentMethodParams = {
          customerId,
          paymentMethodNonce: Nonces.TransactableMasterCard,
          token: token2
        };

        specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function (err, response) {
          assert.isNull(err);
          assert.isFalse(response.paymentMethod.default);

          let customerParams =
            {defaultPaymentMethodToken: token2};

          specHelper.defaultGateway.customer.update(customerId, customerParams, function (err, response) {
            assert.isTrue(response.success);

            specHelper.defaultGateway.paymentMethod.find(token2, function (err, creditCard) {
              assert.isTrue(creditCard.default);
              assert.equal(creditCard.token, token2);

              done();
            });
          });
        });
      });
    });

    it('can add a new card to a customer', function (done) {
      let customerParams = {
        firstName: 'New First Name',
        lastName: 'New Last Name',
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/2014'
        }
      };

      specHelper.defaultGateway.customer.update(customerId, customerParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.customer.firstName, 'New First Name');
        assert.equal(response.customer.lastName, 'New Last Name');
        assert.equal(response.customer.creditCards[0].maskedNumber, '510510******5100');

        done();
      });
    });

    it('fails to add a new card to a customer with failOnDuplicatePaymentMethod', function (done) {
      let customerParams = {
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/2014'
        }
      };

      specHelper.defaultGateway.customer.create(customerParams, function (err, createResponse) {
        assert.isTrue(createResponse.success);

        customerParams.creditCard.options =
            {failOnDuplicatePaymentMethod: true};

        specHelper.defaultGateway.customer.update(createResponse.customer.id, customerParams, function (err, updateResponse) {
          assert.isFalse(updateResponse.success);
          assert.equal(
            updateResponse.errors.for('customer').for('creditCard').on('number')[0].code,
            '81724'
          );

          done();
        });
      });
    });

    it('can add a new card to a customer with a verification_amount specified', function (done) {
      let customerParams = {
        firstName: 'New First Name',
        lastName: 'New Last Name',
        creditCard: {
          number: '5555555555554444',
          expirationDate: '05/2014',
          options: {
            verifyCard: true,
            verificationAmount: '2.00'
          }
        }
      };

      specHelper.defaultGateway.customer.update(customerId, customerParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);

        done();
      });
    });

    context('vaulting a payment method', function () {
      it('can add a new card and billing address', function (done) {
        let customerParams = {
          firstName: 'New First Name',
          lastName: 'New Last Name',
          creditCard: {
            number: '5105105105105100',
            expirationDate: '05/2014',
            billingAddress: {
              streetAddress: '123 E Fake St',
              locality: 'Chicago',
              region: 'IL',
              postalCode: '60607'
            }
          }
        };

        specHelper.defaultGateway.customer.update(customerId, customerParams, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.customer.firstName, 'New First Name');
          assert.equal(response.customer.lastName, 'New Last Name');
          assert.equal(response.customer.creditCards[0].maskedNumber, '510510******5100');
          let billingAddress = response.customer.creditCards[0].billingAddress;

          assert.equal(billingAddress.streetAddress, '123 E Fake St');
          assert.equal(billingAddress.locality, 'Chicago');
          assert.equal(billingAddress.region, 'IL');
          assert.equal(billingAddress.postalCode, '60607');
          assert.equal(response.customer.addresses[0].streetAddress, '123 E Fake St');
          assert.equal(response.customer.addresses[0].locality, 'Chicago');
          assert.equal(response.customer.addresses[0].region, 'IL');
          assert.equal(response.customer.addresses[0].postalCode, '60607');

          done();
        });
      });

      it('vaults a paypal account', done =>
        specHelper.defaultGateway.clientToken.generate({}, function (err, result) {
          let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
          let authorizationFingerprint = clientToken.authorizationFingerprint;

          let params = {
            authorizationFingerprint,
            paypalAccount: {
              consentCode: 'PAYPAL_CONSENT_CODE'
            }
          };

          let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig)); // eslint-disable-line new-cap

          return myHttp.post('/client_api/v1/payment_methods/paypal_accounts.json', params, function (statusCode, body) {
            let nonce = JSON.parse(body).paypalAccounts[0].nonce;

            specHelper.defaultGateway.customer.create({}, function (err, response) {
              let paypalCustomerId = response.customer.id;

              let customerParams = {
                firstName: 'New First Name',
                lastName: 'New Last Name',
                paymentMethodNonce: nonce
              };

              specHelper.defaultGateway.customer.update(paypalCustomerId, customerParams, function (err, response) {
                assert.isNull(err);
                assert.isTrue(response.success);
                assert.isString(response.customer.paypalAccounts[0].email);
                assert.equal(response.customer.firstName, 'New First Name');
                assert.equal(response.customer.lastName, 'New Last Name');

                done();
              });
            });
          });
        })
      );

      it('vaults a paypal account from a payment method nonce with intent=order', done =>
        specHelper.defaultGateway.clientToken.generate({}, function (err, result) {
          let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
          let authorizationFingerprint = clientToken.authorizationFingerprint;

          let params = {
            authorizationFingerprint: authorizationFingerprint,
            paypalAccount: {
              intent: 'order',
              paymentToken: 'paypal-payment-token',
              payerId: 'paypal-payer-id'
            }
          };

          let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig)); // eslint-disable-line new-cap

          return myHttp.post('/client_api/v1/payment_methods/paypal_accounts.json', params, function (statusCode, body) {
            let nonce = JSON.parse(body).paypalAccounts[0].nonce;

            specHelper.defaultGateway.customer.create({}, function (err, response) {
              let paypalCustomerId = response.customer.id;

              let customerParams = {
                firstName: 'New First Name',
                lastName: 'New Last Name',
                paymentMethodNonce: nonce
              };

              specHelper.defaultGateway.customer.update(paypalCustomerId, customerParams, function (err, response) {
                assert.isNull(err);
                assert.isTrue(response.success);
                assert.isString(response.customer.paypalAccounts[0].email);
                assert.equal(response.customer.firstName, 'New First Name');
                assert.equal(response.customer.lastName, 'New Last Name');

                done();
              });
            });
          });
        })
      );

      it('vaults a paypal account from a payment method nonce with intent=order and payeeEmail', done =>
        specHelper.defaultGateway.clientToken.generate({}, function (err, result) {
          let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
          let authorizationFingerprint = clientToken.authorizationFingerprint;

          let params = {
            authorizationFingerprint: authorizationFingerprint,
            paypalAccount: {
              intent: 'order',
              paymentToken: 'paypal-payment-token',
              payerId: 'paypal-payer-id'
            }
          };

          let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig)); // eslint-disable-line new-cap

          return myHttp.post('/client_api/v1/payment_methods/paypal_accounts.json', params, function (statusCode, body) {
            let nonce = JSON.parse(body).paypalAccounts[0].nonce;

            specHelper.defaultGateway.customer.create({}, function (err, response) {
              let paypalCustomerId = response.customer.id;

              let customerParams = {
                firstName: 'New First Name',
                lastName: 'New Last Name',
                paymentMethodNonce: nonce,
                options: {
                  paypal: {
                    payeeEmail: 'payee@example.com'
                  }
                }
              };

              specHelper.defaultGateway.customer.update(paypalCustomerId, customerParams, function (err, response) {
                assert.isNull(err);
                assert.isTrue(response.success);
                assert.isString(response.customer.paypalAccounts[0].email);
                assert.equal(response.customer.firstName, 'New First Name');
                assert.equal(response.customer.lastName, 'New Last Name');

                done();
              });
            });
          });
        })
      );

      it('does not vault a one-time use paypal account', function (done) {
        let paymentMethodToken = specHelper.randomId();

        specHelper.defaultGateway.customer.create({}, function (err, response) {
          let paypalCustomerId = response.customer.id;

          let customerParams = {
            firstName: 'New First Name',
            lastName: 'New Last Name',
            paypalAccount: {
              accessToken: 'PAYPAL_ACCESS_TOKEN',
              token: paymentMethodToken
            }
          };

          specHelper.defaultGateway.customer.update(paypalCustomerId, customerParams, function (err, response) {
            assert.isNull(err);
            assert.isFalse(response.success);
            assert.equal(
              response.errors.for('customer').for('paypalAccount').on('base')[0].code,
              '82902'
            );

            specHelper.defaultGateway.paymentMethod.find(paymentMethodToken, (err) => assert.equal(err.type, braintree.errorTypes.notFoundError));

            done();
          });
        });
      });
    });

    it('returns an error when not found', done =>
      specHelper.defaultGateway.customer.update('nonexistent_customer', {}, function (err) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);

        done();
      })
    );

    it('handles validation errors', done =>
      specHelper.defaultGateway.customer.update(customerId, {email: 'invalid_email_address'}, function (err, response) {
        assert.isFalse(response.success);
        assert.equal(response.message, 'Email is an invalid format.');
        assert.equal(
          response.errors.for('customer').on('email')[0].code,
          '81604'
        );
        assert.equal(
          response.errors.for('customer').on('email')[0].attribute,
          'email'
        );

        done();
      })
    );

    context('with existing card and billing address', function () {
      let creditCardToken = null;

      beforeEach(function (done) {
        let customerParams = {
          firstName: 'Old First Name',
          lastName: 'Old Last Name',
          creditCard: {
            cardholderName: 'Old Cardholder Name',
            number: '4111111111111111',
            expirationDate: '04/2014',
            billingAddress: {
              streetAddress: '123 Old St',
              locality: 'Old City'
            }
          }
        };

        specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
          customerId = response.customer.id;
          creditCardToken = response.customer.creditCards[0].token;
          done();
        });
      });

      it('udpates an existing card', function (done) {
        let customerParams = {
          firstName: 'New First Name',
          lastName: 'New Last Name',
          creditCard: {
            cardholderName: 'New Cardholder Name',
            number: '5105105105105100',
            expirationDate: '05/2014',
            options: {
              updateExistingToken: creditCardToken
            }
          }
        };

        specHelper.defaultGateway.customer.update(customerId, customerParams, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.customer.firstName, 'New First Name');
          assert.equal(response.customer.lastName, 'New Last Name');
          assert.equal(response.customer.creditCards[0].maskedNumber, '510510******5100');
          assert.equal(response.customer.creditCards[0].cardholderName, 'New Cardholder Name');
          assert.equal(response.customer.creditCards[0].expirationDate, '05/2014');

          done();
        });
      });

      it('updates an existing card and billing address', function (done) {
        let customerParams = {
          firstName: 'New First Name',
          lastName: 'New Last Name',
          creditCard: {
            cardholderName: 'New Cardholder Name',
            number: '5105105105105100',
            expirationDate: '05/2014',
            options: {
              updateExistingToken: creditCardToken
            },
            billingAddress: {
              streetAddress: '123 New St',
              locality: 'New City',
              options: {
                updateExisting: true
              }
            }
          }
        };

        specHelper.defaultGateway.customer.update(customerId, customerParams, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          assert.equal(response.customer.firstName, 'New First Name');
          assert.equal(response.customer.lastName, 'New Last Name');
          assert.equal(response.customer.creditCards[0].maskedNumber, '510510******5100');
          assert.equal(response.customer.creditCards[0].cardholderName, 'New Cardholder Name');
          assert.equal(response.customer.creditCards[0].expirationDate, '05/2014');
          assert.equal(response.customer.addresses.length, 1);
          let billingAddress = response.customer.creditCards[0].billingAddress;

          assert.equal(billingAddress.streetAddress, '123 New St');
          assert.equal(billingAddress.locality, 'New City');

          done();
        });
      });

      it("doesn't serialize nulls as empty objects", function (done) {
        let customerParams = {
          creditCard: {
            number: '4111111111111111',
            expirationDate: '05/2014',
            billingAddress: {
              streetAddress: null,
              extendedAddress: 'asd'
            }
          }
        };

        specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          let billingAddress = response.customer.creditCards[0].billingAddress;

          assert.equal(billingAddress.streetAddress, null);

          done();
        });
      });
    });
  });

  describe('delete', function () {
    it('deletes a customer', done =>
      specHelper.defaultGateway.customer.create({}, (err, response) =>
        specHelper.defaultGateway.customer.delete(response.customer.id, function (err) {
          assert.isNull(err);

          specHelper.defaultGateway.customer.find(response.customer.id, function (err) {
            assert.equal(err.type, braintree.errorTypes.notFoundError);

            done();
          });
        })
      )
    );

    it('handles invalid customer ids', done =>
      specHelper.defaultGateway.customer.delete('nonexistent_customer', function (err) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);

        done();
      })
    );
  });
});
