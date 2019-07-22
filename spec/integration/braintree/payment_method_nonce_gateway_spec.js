'use strict';

let braintree = specHelper.braintree;

describe('PaymentMethodNonceGateway', function () {
  let paymentMethodToken;

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
});
