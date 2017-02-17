'use strict';

require('../../spec_helper');
let _ = require('underscore')._;
let braintree = specHelper.braintree;
let util = require('util');
let Config = require('../../../lib/braintree/config').Config;
let Nonces = require('../../../lib/braintree/test/nonces').Nonces;

describe("PaymentMethodNonceGateway", function() {
  let paymentMethodToken = null;

  before(done =>
    specHelper.defaultGateway.customer.create({}, function(err, response) {
      let customerId = response.customer.id;
      let nonceParams = {
        creditCard: {
          number: '4111111111111111',
          expirationMonth: '05',
          expirationYear: '2009'
        }
      };

      return specHelper.generateNonceForNewPaymentMethod(nonceParams, customerId, function(nonce) {
        let paymentMethodParams = {
          customerId,
          paymentMethodNonce: nonce
        };
        return specHelper.defaultGateway.paymentMethod.create(paymentMethodParams, function(err, response) {
          paymentMethodToken = response.paymentMethod.token;
          return done();
        });
      });
    })
  );

  describe("create", function() {
    it('creates the nonce', done =>
      specHelper.defaultGateway.paymentMethodNonce.create(paymentMethodToken, function(err, response) {
        let paymentMethodNonce = response.paymentMethodNonce;
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.isNotNull(paymentMethodNonce.nonce);
        assert.isString(paymentMethodNonce.type);

        return done();
      })
    );

    return it("returns an error if unable to find the payment_method", done =>
      specHelper.defaultGateway.paymentMethodNonce.create('not-a-token-at-all', function(err, response) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);

        return done();
      })
    );
  });

  return describe("find", function() {
    it('find the nonce', function(done) {
      let nonceParams = {
        creditCard: {
          number: '4111111111111111',
          expirationMonth: '05',
          expirationYear: '2020'
        }
      };

      return specHelper.generate3DSNonce(nonceParams, function(nonce) {
        assert.isNotNull(nonce);

        return specHelper.defaultGateway.paymentMethodNonce.find(nonce, function(err, paymentMethodNonce) {
          assert.isNull(err);
          let info = paymentMethodNonce.threeDSecureInfo;
          assert.equal(paymentMethodNonce.nonce, nonce);
          assert.isTrue(info.liabilityShifted);
          assert.isTrue(info.liabilityShiftPossible);
          assert.equal(info.enrolled, "Y");
          assert.equal(info.status, "authenticate_successful");

          return done();
        });
      });
    });

    it("returns undefined threeDSecureInfo if there's none present", done =>
      specHelper.defaultGateway.customer.create({}, function(err, response) {
        let customerId = response.customer.id;
        let nonceParams = {
          creditCard: {
            number: '4111111111111111',
            expirationMonth: '05',
            expirationYear: '2009'
          }
        };

        return specHelper.generateNonceForNewPaymentMethod(nonceParams, customerId, nonce =>
          specHelper.defaultGateway.paymentMethodNonce.find(nonce, function(err, paymentMethodNonce) {
            assert.isNull(err);
            assert.isNull(paymentMethodNonce.threeDSecureInfo);
            return done();
          })
        );
      })
    );


    return it("returns an error if unable to find the payment_method", done =>
      specHelper.defaultGateway.paymentMethodNonce.find('not-a-nonce-at-all', function(err, nonce) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);

        return done();
      })
    );
  });
});
