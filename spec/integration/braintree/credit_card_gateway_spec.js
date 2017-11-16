'use strict';

let braintree = specHelper.braintree;
let CreditCard = require('../../../lib/braintree/credit_card').CreditCard;
let CreditCardNumbers = require('../../../lib/braintree/test/credit_card_numbers').CreditCardNumbers;
let CreditCardDefaults = require('../../../lib/braintree/test/credit_card_defaults').CreditCardDefaults;
let VenmoSdk = require('../../../lib/braintree/test/venmo_sdk').VenmoSdk;
let Config = require('../../../lib/braintree/config').Config;

describe('CreditCardGateway', function () {
  describe('create', function () {
    let customerId;

    before(done =>
      specHelper.defaultGateway.customer.create({firstName: 'John', lastName: 'Smith'}, function (err, response) {
        customerId = response.customer.id;
        done();
      })
    );

    it('works for a simple create', function (done) {
      let creditCardParams = {
        customerId,
        number: '5105105105105100',
        expirationDate: '05/2012'
      };

      specHelper.defaultGateway.creditCard.create(creditCardParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.creditCard.maskedNumber, '510510******5100');
        assert.equal(response.creditCard.expirationDate, '05/2012');
        assert.isTrue(response.creditCard.uniqueNumberIdentifier.length === 32);
        assert.match(response.creditCard.imageUrl, /png/);

        done();
      });
    });

    it('verifies card if verifyCard is set to true', function (done) {
      let creditCardParams = {
        customerId,
        number: '4000111111111115',
        expirationDate: '05/2012',
        options: {
          verifyCard: 'true'
        }
      };

      specHelper.defaultGateway.creditCard.create(creditCardParams, function (err, response) {
        assert.isNull(err);
        assert.isFalse(response.success);

        assert.equal(response.verification.status, 'processor_declined');
        assert.equal(response.verification.processorResponseCode, '2000');
        assert.equal(response.verification.processorResponseText, 'Do Not Honor');

        done();
      });
    });

    it('includes the verification on the credit card with risk data', function (done) {
      let creditCardParams = {
        customerId,
        number: '4111111111111111',
        expirationDate: '05/2020',
        options: {
          verifyCard: 'true'
        },
        deviceSessionId: 'abc123'
      };

      specHelper.defaultGateway.creditCard.create(creditCardParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);

        assert.equal(response.creditCard.verification.riskData.decision, 'Not Evaluated');
        assert.isDefined(response.creditCard.verification.riskData.id);

        done();
      });
    });

    it('verifies card with custom verification amount', function (done) {
      let creditCardParams = {
        customerId,
        number: '4000111111111115',
        expirationDate: '05/2012',
        options: {
          verifyCard: 'true',
          verificationAmount: '1.03'
        }
      };

      specHelper.defaultGateway.creditCard.create(creditCardParams, function (err, response) {
        assert.isNull(err);
        assert.isFalse(response.success);

        assert.equal(response.verification.status, 'processor_declined');
        assert.equal(response.verification.processorResponseCode, '2000');
        assert.equal(response.verification.processorResponseText, 'Do Not Honor');

        done();
      });
    });

    it('accepts a billing address', function (done) {
      let creditCardParams = {
        customerId,
        number: '5105105105105100',
        expirationDate: '05/2012',
        billingAddress: {
          streetAddress: '123 Fake St',
          locality: 'Chicago',
          region: 'IL',
          postalCode: '60607'
        }
      };

      specHelper.defaultGateway.creditCard.create(creditCardParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.creditCard.maskedNumber, '510510******5100');
        assert.equal(response.creditCard.expirationDate, '05/2012');
        assert.equal(response.creditCard.billingAddress.streetAddress, '123 Fake St');
        assert.equal(response.creditCard.billingAddress.locality, 'Chicago');
        assert.equal(response.creditCard.billingAddress.region, 'IL');
        assert.equal(response.creditCard.billingAddress.postalCode, '60607');

        done();
      });
    });

    it('handles errors', function (done) {
      let creditCardParams = {
        customerId,
        number: 'invalid',
        expirationDate: '05/2012'
      };

      specHelper.defaultGateway.creditCard.create(creditCardParams, function (err, response) {
        assert.isFalse(response.success);
        assert.equal(response.message, 'Credit card number must be 12-19 digits.');
        assert.equal(
          response.errors.for('creditCard').on('number')[0].code,
          '81716'
        );
        assert.equal(
          response.errors.for('creditCard').on('number')[0].attribute,
          'number'
        );
        let errorCodes = Array.from(response.errors.deepErrors()).map((error) => error.code);

        assert.equal(1, errorCodes.length);
        assert.include(errorCodes, '81716');

        done();
      });
    });

    it('accepts a venmo sdk payment method code', function (done) {
      let creditCardParams = {
        customerId,
        venmoSdkPaymentMethodCode: VenmoSdk.VisaPaymentMethodCode
      };

      specHelper.defaultGateway.creditCard.create(creditCardParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.creditCard.maskedNumber, '411111******1111');
        assert.isTrue(response.creditCard.venmoSdk);

        done();
      });
    });

    it('rejects a bad venmo sdk payment method code', function (done) {
      let creditCardParams = {
        customerId,
        venmoSdkPaymentMethodCode: VenmoSdk.InvalidPaymentMethodCode
      };

      specHelper.defaultGateway.creditCard.create(creditCardParams, function (err, response) {
        assert.isNull(err);
        assert.isFalse(response.success);
        let errorCodes = Array.from(response.errors.deepErrors()).map((error) => error.code);

        assert.equal(1, errorCodes.length);
        assert.include(errorCodes, '91727');
        assert.equal(response.message, 'Invalid VenmoSDK payment method code');

        done();
      });
    });

    it('venmo sdk is true for card created with a venmo sdk session', function (done) {
      let creditCardParams = {
        customerId,
        number: '5105105105105100',
        expirationDate: '05/2012',
        options: {
          venmoSdkSession: VenmoSdk.Session
        }
      };

      specHelper.defaultGateway.creditCard.create(creditCardParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.creditCard.maskedNumber, '510510******5100');
        assert.isTrue(response.creditCard.venmoSdk);

        done();
      });
    });

    it('venmo sdk is false for card created with an invalid venmo sdk session', function (done) {
      let creditCardParams = {
        customerId,
        number: '5105105105105100',
        expirationDate: '05/2012',
        options: {
          venmoSdkSession: VenmoSdk.InvalidSession
        }
      };

      specHelper.defaultGateway.creditCard.create(creditCardParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.creditCard.maskedNumber, '510510******5100');
        assert.isFalse(response.creditCard.venmoSdk);

        done();
      });
    });

    it('accepts a payment method nonce', function (done) {
      let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig)); // eslint-disable-line new-cap

      specHelper.defaultGateway.clientToken.generate({}, function (err, result) {
        assert.isTrue(result.success);
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
          let creditCardParams = {
            customerId,
            paymentMethodNonce: nonce
          };

          specHelper.defaultGateway.creditCard.create(creditCardParams, function (err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);
            assert.equal(response.creditCard.maskedNumber, '411111******1111');

            done();
          }); });
      });
    });

    context('card type indicators', function () {
      it('handles prepaid cards', function (done) {
        let creditCardParams = {
          customerId,
          number: CreditCardNumbers.CardTypeIndicators.Prepaid,
          expirationDate: '05/2012',
          options: {
            verifyCard: true
          }
        };

        specHelper.defaultGateway.creditCard.create(creditCardParams, function (err, response) {
          assert.equal(response.creditCard.prepaid, CreditCard.Prepaid.Yes);

          done();
        });
      });

      it('handles commercial cards', function (done) {
        let creditCardParams = {
          customerId,
          number: CreditCardNumbers.CardTypeIndicators.Commercial,
          expirationDate: '05/2012',
          options: {
            verifyCard: true
          }
        };

        specHelper.defaultGateway.creditCard.create(creditCardParams, function (err, response) {
          assert.equal(response.creditCard.commercial, CreditCard.Commercial.Yes);

          done();
        });
      });

      it('handles payroll cards', function (done) {
        let creditCardParams = {
          customerId,
          number: CreditCardNumbers.CardTypeIndicators.Payroll,
          expirationDate: '05/2012',
          options: {
            verifyCard: true
          }
        };

        specHelper.defaultGateway.creditCard.create(creditCardParams, function (err, response) {
          assert.equal(response.creditCard.payroll, CreditCard.Payroll.Yes);
          assert.equal(response.creditCard.productId, 'MSA');

          done();
        });
      });

      it('handles healthcare cards', function (done) {
        let creditCardParams = {
          customerId,
          number: CreditCardNumbers.CardTypeIndicators.Healthcare,
          expirationDate: '05/2012',
          options: {
            verifyCard: true
          }
        };

        specHelper.defaultGateway.creditCard.create(creditCardParams, function (err, response) {
          assert.equal(response.creditCard.healthcare, CreditCard.Healthcare.Yes);
          assert.equal(response.creditCard.productId, 'J3');

          done();
        });
      });

      it('handles durbin regulated cards', function (done) {
        let creditCardParams = {
          customerId,
          number: CreditCardNumbers.CardTypeIndicators.DurbinRegulated,
          expirationDate: '05/2012',
          options: {
            verifyCard: true
          }
        };

        specHelper.defaultGateway.creditCard.create(creditCardParams, function (err, response) {
          assert.equal(response.creditCard.durbinRegulated, CreditCard.DurbinRegulated.Yes);

          done();
        });
      });

      it('handles debit cards', function (done) {
        let creditCardParams = {
          customerId,
          number: CreditCardNumbers.CardTypeIndicators.Debit,
          expirationDate: '05/2012',
          options: {
            verifyCard: true
          }
        };

        specHelper.defaultGateway.creditCard.create(creditCardParams, function (err, response) {
          assert.equal(response.creditCard.debit, CreditCard.Debit.Yes);

          done();
        });
      });

      it('sets the country of issuance', function (done) {
        let creditCardParams = {
          customerId,
          number: CreditCardNumbers.CardTypeIndicators.CountryOfIssuance,
          expirationDate: '05/2012',
          options: {
            verifyCard: true
          }
        };

        specHelper.defaultGateway.creditCard.create(creditCardParams, function (err, response) {
          assert.equal(response.creditCard.countryOfIssuance, CreditCardDefaults.CountryOfIssuance);

          done();
        });
      });

      it('sets the issuing bank', function (done) {
        let creditCardParams = {
          customerId,
          number: CreditCardNumbers.CardTypeIndicators.IssuingBank,
          expirationDate: '05/2012',
          options: {
            verifyCard: true
          }
        };

        specHelper.defaultGateway.creditCard.create(creditCardParams, function (err, response) {
          assert.equal(response.creditCard.issuingBank, CreditCardDefaults.IssuingBank);

          done();
        });
      });
    });

    context('negative card type indicators', function () {
      let createResponse;

      before(function (done) {
        let creditCardParams = {
          customerId,
          number: CreditCardNumbers.CardTypeIndicators.No,
          expirationDate: '05/2012',
          options: {
            verifyCard: true
          }
        };

        specHelper.defaultGateway.creditCard.create(creditCardParams, function (err, response) {
          createResponse = response;
          done();
        });
      });

      it('sets the prepaid field to No', () => assert.equal(createResponse.creditCard.prepaid, CreditCard.Prepaid.No));

      it('sets the payroll field to No', () => assert.equal(createResponse.creditCard.payroll, CreditCard.Payroll.No));

      it('sets the debit field to No', () => assert.equal(createResponse.creditCard.debit, CreditCard.Debit.No));

      it('sets the commercial field to No', () => assert.equal(createResponse.creditCard.commercial, CreditCard.Commercial.No));

      it('sets the durbin regulated field to No', () => assert.equal(createResponse.creditCard.durbinRegulated, CreditCard.DurbinRegulated.No));

      it('sets the heathcare field to No', () => assert.equal(createResponse.creditCard.healthcare, CreditCard.Healthcare.No));

      it('sets the product id field to MSB', () => assert.equal(createResponse.creditCard.productId, 'MSB'));
    });

    context('unknown card type indicators', function () {
      let createResponse;

      before(function (done) {
        let creditCardParams = {
          customerId,
          number: CreditCardNumbers.CardTypeIndicators.Unknown,
          expirationDate: '05/2012',
          options: {
            verifyCard: true
          }
        };

        specHelper.defaultGateway.creditCard.create(creditCardParams, function (err, response) {
          createResponse = response;
          done();
        });
      });

      it('sets the prepaid field to Unknown', () => assert.equal(createResponse.creditCard.prepaid, CreditCard.Prepaid.Unknown));

      it('sets the payroll field to Unknown', () => assert.equal(createResponse.creditCard.payroll, CreditCard.Payroll.Unknown));

      it('sets the debit field to Unknown', () => assert.equal(createResponse.creditCard.debit, CreditCard.Debit.Unknown));

      it('sets the commercial field to Unknown', () => assert.equal(createResponse.creditCard.commercial, CreditCard.Commercial.Unknown));

      it('sets the durbin regulated field to Unknown', () => assert.equal(createResponse.creditCard.durbinRegulated, CreditCard.DurbinRegulated.Unknown));

      it('sets the heathcare field to Unknown', () => assert.equal(createResponse.creditCard.healthcare, CreditCard.Healthcare.Unknown));

      it('sets the country of issuance field to Unknown', () => assert.equal(createResponse.creditCard.countryOfIssuance, CreditCard.CountryOfIssuance.Unknown));

      it('sets the issuing bank field to Unknown', () => assert.equal(createResponse.creditCard.issuingBank, CreditCard.IssuingBank.Unknown));

      it('sets the product id field to Unknown', () => assert.equal(createResponse.creditCard.productId, CreditCard.ProductId.Unknown));
    });
  });

  describe('delete', function () {
    let customerToken;

    before(function (done) {
      let customerParams = {
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/2014'
        }
      };

      specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
        customerToken = response.customer.creditCards[0].token;
        done();
      });
    });

    it('deletes the credit card', done =>
      specHelper.defaultGateway.creditCard.delete(customerToken, function (err) {
        assert.isNull(err);

        specHelper.defaultGateway.creditCard.find(customerToken, function (err) {
          assert.equal(err.type, braintree.errorTypes.notFoundError);
          done();
        });
      })
    );

    it('handles invalid tokens', done =>
      specHelper.defaultGateway.creditCard.delete('nonexistent_token', function (err) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);

        done();
      })
    );
  });

  describe('expired', () =>
    it('returns expired cards', function (done) {
      let customerParams = {
        creditCard: {
          number: '5105105105105100',
          expirationDate: '01/2015'
        }
      };

      specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
        let testCard = response.customer.creditCards[0];

        specHelper.defaultGateway.creditCard.expired(function (err, result) {
          assert.include(result.ids, testCard.token);

          done();
        });
      });
    })
  );

  describe('expiringBetween', () =>
    it('returns card expiring between the given dates', function (done) {
      let customerParams = {
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/2016'
        }
      };

      specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
        let testCard = response.customer.creditCards[0];

        let before = new Date('2016-04-31');
        let after = new Date('2016-10-01');

        specHelper.defaultGateway.creditCard.expiringBetween(before, after, function (err, result) {
          assert.isNull(err);
          assert.include(result.ids, testCard.token);

          done();
        });
      });
    })
  );

  describe('find', function () {
    let customerToken;

    before(function (done) {
      let customerParams = {
        creditCard: {
          number: '5105105105105100',
          expirationDate: '05/2014'
        }
      };

      specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
        customerToken = response.customer.creditCards[0].token;
        done();
      });
    });

    it('finds the card', done =>
      specHelper.defaultGateway.creditCard.find(customerToken, function (err, creditCard) {
        assert.isNull(err);
        assert.equal(creditCard.maskedNumber, '510510******5100');
        assert.equal(creditCard.expirationDate, '05/2014');

        done();
      })
    );

    it('handles not finding the card', done =>
      specHelper.defaultGateway.creditCard.find('nonexistent_token', function (err) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);

        done();
      })
    );

    it('handles whitespace', done =>
      specHelper.defaultGateway.creditCard.find(' ', function (err) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);

        done();
      })
    );
  });

  describe('fromNonce', function () {
    let customerId;

    before(done =>
      specHelper.defaultGateway.customer.create({firstName: 'John', lastName: 'Smith'}, function (err, response) {
        customerId = response.customer.id;
        done();
      })
    );

    it('returns a credit card for the supplied nonce', function (done) {
      let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig)); // eslint-disable-line new-cap

      specHelper.defaultGateway.clientToken.generate({customerId}, function (err, result) {
        let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
        let authorizationFingerprint = clientToken.authorizationFingerprint;

        let params = {
          authorizationFingerprint,
          sharedCustomerIdentifierType: 'testing',
          sharedCustomerIdentifier: 'testing-identifier',
          credit_card: { // eslint-disable-line camelcase
            number: '4111111111111111',
            expiration_month: '11', // eslint-disable-line camelcase
            expiration_year: '2099' // eslint-disable-line camelcase
          }
        };

        return myHttp.post('/client_api/v1/payment_methods/credit_cards.json', params, function (statusCode, body) {
          let nonce = JSON.parse(body).creditCards[0].nonce;

          specHelper.defaultGateway.creditCard.fromNonce(nonce, function (err, creditCard) {
            assert.isNull(err);
            assert.equal(creditCard.maskedNumber, '411111******1111');
            assert.equal(creditCard.expirationDate, '11/2099');

            done();
          });
        });
      });
    });

    it('returns an error if the supplied nonce points to a shared card', function (done) {
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

          specHelper.defaultGateway.creditCard.fromNonce(nonce, function (err, creditCard) {
            assert.isUndefined(creditCard);
            assert.equal(err.type, 'notFoundError');
            assert.include(err.message, 'not found');

            done();
          });
        });
      });
    });

    it('returns an error if the supplied nonce is consumed', function (done) {
      let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig)); // eslint-disable-line new-cap

      specHelper.defaultGateway.clientToken.generate({customerId}, function (err, result) {
        let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
        let authorizationFingerprint = clientToken.authorizationFingerprint;

        let params = {
          authorizationFingerprint,
          sharedCustomerIdentifierType: 'testing',
          sharedCustomerIdentifier: 'testing-identifier',
          credit_card: { // eslint-disable-line camelcase
            number: '4111111111111111',
            expiration_month: '11', // eslint-disable-line camelcase
            expiration_year: '2099' // eslint-disable-line camelcase
          }
        };

        return myHttp.post('/client_api/v1/payment_methods/credit_cards.json', params, function (statusCode, body) {
          let nonce = JSON.parse(body).creditCards[0].nonce;

          specHelper.defaultGateway.creditCard.fromNonce(nonce, function (err) {
            assert.isNull(err);
            specHelper.defaultGateway.creditCard.fromNonce(nonce, function (err, creditCard) {
              assert.isUndefined(creditCard);
              assert.equal(err.type, 'notFoundError');
              assert.include(err.message, 'consumed');

              done();
            });
          });
        });
      });
    });
  });

  describe('update', function () {
    let creditCardToken;

    before(function (done) {
      let customerParams = {
        creditCard: {
          cardholderName: 'Old Cardholder Name',
          number: '5105105105105100',
          expirationDate: '05/2014',
          billingAddress: {
            streetAddress: '123 Old St',
            locality: 'Old City',
            region: 'Old Region'
          }
        }
      };

      specHelper.defaultGateway.customer.create(customerParams, function (err, response) {
        creditCardToken = response.customer.creditCards[0].token;
        done();
      });
    });

    it('updates the card', function (done) {
      let updateParams = {
        cardholderName: 'New Cardholder Name',
        number: '4111111111111111',
        expirationDate: '12/2015'
      };

      specHelper.defaultGateway.creditCard.update(creditCardToken, updateParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.creditCard.cardholderName, 'New Cardholder Name');
        assert.equal(response.creditCard.maskedNumber, '411111******1111');
        assert.equal(response.creditCard.expirationDate, '12/2015');

        done();
      });
    });

    it('updates the billing address', function (done) {
      let updateParams = {
        cardholderName: 'New Cardholder Name',
        number: '4111111111111111',
        expirationDate: '12/2015',
        billingAddress: {
          streetAddress: '123 New St',
          locality: 'New City',
          region: 'New Region',
          options: {
            updateExisting: true
          }
        }
      };

      specHelper.defaultGateway.creditCard.update(creditCardToken, updateParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.creditCard.cardholderName, 'New Cardholder Name');
        assert.equal(response.creditCard.maskedNumber, '411111******1111');
        assert.equal(response.creditCard.expirationDate, '12/2015');
        let billingAddress = response.creditCard.billingAddress;

        assert.equal(billingAddress.streetAddress, '123 New St');
        assert.equal(billingAddress.locality, 'New City');
        assert.equal(billingAddress.region, 'New Region');

        done();
      });
    });

    it('handles errors', function (done) {
      let updateParams =
        {number: 'invalid'};

      specHelper.defaultGateway.creditCard.update(creditCardToken, updateParams, function (err, response) {
        assert.isFalse(response.success);
        assert.equal(response.message, 'Credit card number must be 12-19 digits.');
        assert.equal(
          response.errors.for('creditCard').on('number')[0].code,
          '81716'
        );
        assert.equal(
          response.errors.for('creditCard').on('number')[0].attribute,
          'number'
        );
        let errorCodes = Array.from(response.errors.deepErrors()).map((error) => error.code);

        assert.equal(1, errorCodes.length);
        assert.include(errorCodes, '81716');

        done();
      });
    });
  });
});
