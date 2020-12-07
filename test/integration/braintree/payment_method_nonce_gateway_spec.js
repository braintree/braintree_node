'use strict';

let braintree = specHelper.braintree;

describe('PaymentMethodNonceGateway', function () {
  let paymentMethodToken;
  const INDIAN_PAYMENT_TOKEN = 'india_visa_credit';
  const EUROPEAN_PAYMENT_TOKEN = 'european_visa_credit';
  const INDIAN_MERCHANT_TOKEN = 'india_three_d_secure_merchant_account';
  const EUROPEAN_MERCHANT_TOKEN = 'european_three_d_secure_merchant_account';
  const AMOUNT_THRESHOLD_FOR_RBI = 2000;

  before(done =>
    specHelper.defaultGateway.customer.create({}, function (err, response) {
      let customerId = response.customer.id;
      let nonceParams = {
        creditCard: {
          number: '4111111111111111',
          expirationMonth: '05',
          expirationYear: '2009'
        }
      };

      specHelper.generateNonceForNewPaymentMethod(nonceParams, customerId, function (nonce) {
        let paymentMethodParams = {
          customerId,
          paymentMethodNonce: nonce
        };

        specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function (err, response) {
          paymentMethodToken = response.paymentMethod.token;
          done();
        });
      });
    })
  );

  describe('create', function () {
    it('creates the nonce', done =>
      specHelper.defaultGateway.paymentMethodNonce.create(paymentMethodToken, function (err, response) {
        let paymentMethodNonce = response.paymentMethodNonce;

        assert.isNull(err);
        assert.isTrue(response.success);
        assert.isNotNull(paymentMethodNonce.nonce);
        assert.isString(paymentMethodNonce.type);

        done();
      })
    );

    it('returns an error if unable to find the payment_method', done =>
      specHelper.defaultGateway.paymentMethodNonce.create('not-a-token-at-all', function (err) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);

        done();
      })
    );

    describe('invalid params', function () {
      it('raises an exception if the hash includes invalid params', function (done) {
        let params = {
          paymentMethodNonce: {
            merchantAccountId: INDIAN_PAYMENT_TOKEN,
            authenticationInsight: true,
            invalidFooKey: 'foo'
          }
        };

        specHelper.defaultGateway.paymentMethodNonce.create(paymentMethodToken, params, function (err) {
          assert.equal(err.type, braintree.errorTypes.invalidKeysError);

          done();
        });
      });
    });

    describe('regulationEnvironment', function () {
      it('can return unregulated', function (done) {
        let params = getPaymentMethodNonceParams(EUROPEAN_MERCHANT_TOKEN, {amount: AMOUNT_THRESHOLD_FOR_RBI});

        specHelper.defaultGateway.paymentMethodNonce.create(INDIAN_PAYMENT_TOKEN, params, function (err, response) {
          let authenticationInsight = response.paymentMethodNonce.authenticationInsight;

          assert.equal('unregulated', authenticationInsight.regulationEnvironment);
          done();
        });
      });

      it('can return psd2', function (done) {
        let params = getPaymentMethodNonceParams(EUROPEAN_MERCHANT_TOKEN, {amount: AMOUNT_THRESHOLD_FOR_RBI});

        specHelper.defaultGateway.paymentMethodNonce.create(EUROPEAN_PAYMENT_TOKEN, params, function (err, response) {
          let authenticationInsight = response.paymentMethodNonce.authenticationInsight;

          assert.equal('psd2', authenticationInsight.regulationEnvironment);
          done();
        });
      });

      it('can return rbi', function (done) {
        let params = getPaymentMethodNonceParams(INDIAN_MERCHANT_TOKEN, {amount: AMOUNT_THRESHOLD_FOR_RBI});

        specHelper.defaultGateway.paymentMethodNonce.create(INDIAN_PAYMENT_TOKEN, params, function (err, response) {
          let authenticationInsight = response.paymentMethodNonce.authenticationInsight;

          assert.equal('rbi', authenticationInsight.regulationEnvironment);
          done();
        });
      });
    });

    describe('scaIndicator', function () {
      it('can return unavailable without an amount', function (done) {
        let params = getPaymentMethodNonceParams(INDIAN_MERCHANT_TOKEN, {});

        specHelper.defaultGateway.paymentMethodNonce.create(INDIAN_PAYMENT_TOKEN, params, function (err, response) {
          let authenticationInsight = response.paymentMethodNonce.authenticationInsight;

          assert.equal('unavailable', authenticationInsight.scaIndicator);
          done();
        });
      });

      it('can return sca_required with amount over the threshold', function (done) {
        let params = getPaymentMethodNonceParams(INDIAN_MERCHANT_TOKEN, {amount: AMOUNT_THRESHOLD_FOR_RBI + 1});

        specHelper.defaultGateway.paymentMethodNonce.create(INDIAN_PAYMENT_TOKEN, params, function (err, response) {
          let authenticationInsight = response.paymentMethodNonce.authenticationInsight;

          assert.equal('sca_required', authenticationInsight.scaIndicator);
          done();
        });
      });

      it('can return sca_optional with amount within threshold', function (done) {
        let params = getPaymentMethodNonceParams(INDIAN_MERCHANT_TOKEN, {amount: AMOUNT_THRESHOLD_FOR_RBI, recurringCustomerConsent: true, recurringMaxAmount: AMOUNT_THRESHOLD_FOR_RBI});

        specHelper.defaultGateway.paymentMethodNonce.create(INDIAN_PAYMENT_TOKEN, params, function (err, response) {
          let authenticationInsight = response.paymentMethodNonce.authenticationInsight;

          assert.equal('sca_optional', authenticationInsight.scaIndicator);
          done();
        });
      });
    });
  });

  describe('find', function () {
    it('find the nonce', function (done) {
      let nonceParams = {
        creditCard: {
          number: '4111111111111111',
          expirationMonth: '05',
          expirationYear: '2020'
        }
      };

      specHelper.generate3DSNonce(nonceParams, function (nonce) {
        assert.isNotNull(nonce);

        specHelper.defaultGateway.paymentMethodNonce.find(nonce, function (err, paymentMethodNonce) {
          assert.isNull(err);
          let info = paymentMethodNonce.threeDSecureInfo;

          assert.equal(paymentMethodNonce.nonce, nonce);
          assert.isTrue(info.liabilityShifted);
          assert.isTrue(info.liabilityShiftPossible);
          assert.equal(info.enrolled, 'Y');
          assert.equal(info.status, 'authenticate_successful');
          assert.equal(info.cavv, 'test_cavv');
          assert.equal(info.xid, 'test_xid');
          assert.equal(info.eciFlag, 'test_eci');
          assert.equal(info.threeDSecureVersion, '1.0.2');
          assert.isNull(info.dsTransactionId);

          assert.equal(paymentMethodNonce.details.bin, '411111');

          done();
        });
      });
    });

    it('returns paypal account details', function (done) {
      specHelper.defaultGateway.paymentMethodNonce.find('fake-google-pay-paypal-nonce', function (err, paymentMethodNonce) {
        assert.isNull(err);
        let details = paymentMethodNonce.details;

        assert.isNotNull(details.payerInfo.firstName);
        assert.isNotNull(details.payerInfo.lastName);
        assert.isNotNull(details.payerInfo.email);
        assert.isNotNull(details.payerInfo.payerId);

        done();
      });
    });

    it('returns venmo account details', function (done) {
      specHelper.defaultGateway.paymentMethodNonce.find('fake-venmo-account-nonce', function (err, paymentMethodNonce) {
        assert.isNull(err);
        let details = paymentMethodNonce.details;

        assert.equal(details.venmoUserId, 'Venmo-Joe-1');
        assert.equal(details.username, 'venmojoe');
        assert.equal(details.lastTwo, '99');

        done();
      });
    });

    it("returns undefined threeDSecureInfo if there's none present", done =>
      specHelper.defaultGateway.customer.create({}, function (err, response) {
        let customerId = response.customer.id;
        let nonceParams = {
          creditCard: {
            number: '4111111111111111',
            expirationMonth: '05',
            expirationYear: '2009'
          }
        };

        specHelper.generateNonceForNewPaymentMethod(nonceParams, customerId, nonce =>
          specHelper.defaultGateway.paymentMethodNonce.find(nonce, function (err, paymentMethodNonce) {
            assert.isNull(err);
            assert.isNull(paymentMethodNonce.threeDSecureInfo);
            done();
          })
        );
      })
    );

    it('returns an error if unable to find the payment_method', done =>
      specHelper.defaultGateway.paymentMethodNonce.find('not-a-nonce-at-all', function (err) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);

        done();
      })
    );
  });

  function getPaymentMethodNonceParams(merchantToken, options) {
    return {
      paymentMethodNonce: {
        merchantAccountId: merchantToken,
        authenticationInsight: true,
        authenticationInsightOptions: {
          amount: options.amount,
          recurringCustomerConsent: options.recurringCustomerConsent,
          recurringMaxAmount: options.recurringMaxAmount
        }
      }
    };
  }
});
