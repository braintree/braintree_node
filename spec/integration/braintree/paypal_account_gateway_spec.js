'use strict';

require('../../spec_helper');

let braintree = specHelper.braintree;
let Config = require('../../../lib/braintree/config').Config;
let Nonces = require('../../../lib/braintree/test/nonces').Nonces;

describe('PayPalGateway', function () {
  describe('find', function () {
    it('finds the paypal account', done =>
      specHelper.defaultGateway.customer.create({}, function (err, response) {
        let paymentMethodParams = {
          customerId: response.customer.id,
          paymentMethodNonce: Nonces.PayPalFuturePayment
        };

        specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function (err, response) {
          let paymentMethodToken = response.paymentMethod.token;

          specHelper.defaultGateway.paypalAccount.find(paymentMethodToken, function (err, paypalAccount) {
            assert.isNull(err);
            assert.isString(paypalAccount.email);
            assert.isString(paypalAccount.imageUrl);
            assert.isString(paypalAccount.createdAt);
            assert.isString(paypalAccount.updatedAt);

            done();
          });
        });
      })
    );

    it('returns the billing agreement id', done =>
      specHelper.defaultGateway.customer.create({}, function (err, response) {
        let paymentMethodParams = {
          customerId: response.customer.id,
          paymentMethodNonce: Nonces.PayPalBillingAgreement
        };

        specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function (err, response) {
          let paymentMethodToken = response.paymentMethod.token;

          specHelper.defaultGateway.paypalAccount.find(paymentMethodToken, function (err, paypalAccount) {
            assert.isNull(err);
            assert.isString(paypalAccount.billingAgreementId);
            done();
          });
        });
      })
    );

    it('handles not finding the paypal account', done =>
      specHelper.defaultGateway.paypalAccount.find('NONEXISTENT_TOKEN', function (err) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);

        done();
      })
    );

    it('handles whitespace', done =>
      specHelper.defaultGateway.paypalAccount.find(' ', function (err) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);

        done();
      })
    );

    it('returns subscriptions associated with a paypal account', done =>
      specHelper.defaultGateway.customer.create({}, function (err, response) {
        let paymentMethodParams = {
          customerId: response.customer.id,
          paymentMethodNonce: Nonces.PayPalFuturePayment
        };

        specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function (err, response) {
          let token = response.paymentMethod.token;

          let subscriptionParams = {
            paymentMethodToken: token,
            planId: specHelper.plans.trialless.id
          };

          specHelper.defaultGateway.subscription.create(subscriptionParams, function (err, response) {
            assert.isNull(err);
            assert.isTrue(response.success);

            let subscription1 = response.subscription;

            specHelper.defaultGateway.subscription.create(subscriptionParams, function (err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);

              let subscription2 = response.subscription;

              specHelper.defaultGateway.paypalAccount.find(token, function (err, paypalAccount) {
                assert.isNull(err);

                assert.equal(paypalAccount.subscriptions.length, 2);
                let subscriptionIds = [paypalAccount.subscriptions[0].id, paypalAccount.subscriptions[1].id];

                assert.include(subscriptionIds, subscription1.id);
                assert.include(subscriptionIds, subscription2.id);

                done();
              });
            });
          });
        });
      })
    );
  });

  describe('update', function () {
    let paymentMethodToken = null;
    let customerId = null;

    beforeEach(function (done) {
      paymentMethodToken = Math.floor(Math.random() * Math.pow(36, 3)).toString(36);

      specHelper.defaultGateway.customer.create({firstName: 'Jane', lastName: 'Doe'}, function (err, response) {
        customerId = response.customer.id;

        let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig)); // eslint-disable-line new-cap

        specHelper.defaultGateway.clientToken.generate({}, function (err, result) {
          let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
          let authorizationFingerprint = clientToken.authorizationFingerprint;

          let params = {
            authorizationFingerprint,
            paypalAccount: {
              consentCode: 'PAYPAL_CONSENT_CODE',
              token: paymentMethodToken
            }
          };

          return myHttp.post('/client_api/v1/payment_methods/paypal_accounts.json', params, function (statusCode, body) {
            let nonce = JSON.parse(body).paypalAccounts[0].nonce;
            let paypalAccountParams = {
              customerId,
              paymentMethodNonce: nonce
            };

            specHelper.defaultGateway.paymentMethod.create(paypalAccountParams, function (err, response) {
              paymentMethodToken = response.paymentMethod.token;

              done();
            }); });
        });
      });
    });

    it('updates the paypal account', function (done) {
      let updateParams =
        {token: paymentMethodToken + '123'};

      specHelper.defaultGateway.paypalAccount.update(paymentMethodToken, updateParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.paypalAccount.token, paymentMethodToken + '123');

        specHelper.defaultGateway.paypalAccount.find(paymentMethodToken, function (err) {
          assert.equal(err.type, braintree.errorTypes.notFoundError);

          done();
        });
      });
    });

    it('updates and makes an account the default', function (done) {
      let creditCardParams = {
        customerId,
        number: '5105105105105100',
        expirationDate: '05/2012',
        options: {
          makeDefault: true
        }
      };

      specHelper.defaultGateway.creditCard.create(creditCardParams, function (err, response) {
        assert.isTrue(response.success);
        assert.isTrue(response.creditCard.default);

        let updateParams = {
          token: paymentMethodToken,
          options: {
            makeDefault: true
          }
        };

        specHelper.defaultGateway.paypalAccount.update(paymentMethodToken, updateParams, function (err, response) {
          assert.isTrue(response.success);
          assert.isTrue(response.paypalAccount.default);
          done();
        });
      });
    });

    it('handles errors', function (done) {
      let paypalAccountParams = {
        customerId,
        paymentMethodNonce: Nonces.PayPalFuturePayment
      };

      specHelper.defaultGateway.paymentMethod.create(paypalAccountParams, function (err, response) {
        assert.isTrue(response.success);
        let originalToken = response.paymentMethod.token;

        specHelper.defaultGateway.paymentMethod.create(paypalAccountParams, function (err, response) {
          let newPaymentMethodToken = response.paymentMethod.token;

          let updateParams =
            {token: originalToken};

          specHelper.defaultGateway.paypalAccount.update(newPaymentMethodToken, updateParams, function (err, response) {
            assert.isFalse(response.success);
            assert.equal(
              response.errors.for('paypalAccount').on('token')[0].code,
              '92906'
            );

            done();
          });
        });
      });
    });
  });

  describe('delete', function () {
    let paymentMethodToken = null;

    before(done =>
      specHelper.defaultGateway.customer.create({firstName: 'Jane', lastName: 'Doe'}, function (err, response) {
        let customerId = response.customer.id;

        let myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig)); // eslint-disable-line new-cap

        specHelper.defaultGateway.clientToken.generate({}, function (err, result) {
          let clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken));
          let authorizationFingerprint = clientToken.authorizationFingerprint;

          let params = {
            authorizationFingerprint,
            paypalAccount: {
              consentCode: 'PAYPAL_CONSENT_CODE'
            }
          };

          return myHttp.post('/client_api/v1/payment_methods/paypal_accounts.json', params, function (statusCode, body) {
            let nonce = JSON.parse(body).paypalAccounts[0].nonce;
            let paypalAccountParams = {
              customerId,
              paymentMethodNonce: nonce
            };

            specHelper.defaultGateway.paymentMethod.create(paypalAccountParams, function (err, response) {
              paymentMethodToken = response.paymentMethod.token;

              done();
            }); });
        });
      })
    );

    it('deletes the paypal account', done =>
      specHelper.defaultGateway.paypalAccount.delete(paymentMethodToken, function (err) {
        assert.isNull(err);

        specHelper.defaultGateway.paypalAccount.find(paymentMethodToken, function (err) {
          assert.equal(err.type, braintree.errorTypes.notFoundError);
          done();
        });
      })
    );

    it('handles invalid tokens', done =>
      specHelper.defaultGateway.paypalAccount.delete('NON_EXISTENT_TOKEN', function (err) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);

        done();
      })
    );
  });
});

