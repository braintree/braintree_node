'use strict';

require('../../spec_helper');
let PaymentMethodGateway = require('../../../lib/braintree/payment_method_gateway').PaymentMethodGateway;
let errorTypes = require('../../../lib/braintree/error_types').errorTypes;

describe('PaymentMethodGateway', function () {
  describe('find', () =>
    it('handles unknown payment methods', function (done) {
      let response = {
        unknownPaymentMethod: {
          token: 1234,
          'default': true,
          key: 'value'
        }
      };

      let paymentMethod = PaymentMethodGateway.parsePaymentMethod(response);

      assert.equal(paymentMethod.token, 1234);
      assert.isTrue(paymentMethod.default);

      done();
    })
  );

  describe('delete', function () {
    let fakeGateway = {
      config: {
        baseMerchantPath() {
          return '';
        }
      },
      http: {
        delete(url, callback) {
          callback(url);
        }
      }
    };

    it('accepts revokeAllGrants option with value true', function (done) {
      let paymentMethodGateway = new PaymentMethodGateway(fakeGateway);
      let expectedURL = '/payment_methods/any/some_token?revoke_all_grants=true';
      let deleteOptions = {revokeAllGrants: 'true'};
      let assertRequestUrl = url => assert.equal(expectedURL, url); // eslint-disable-line func-style

      paymentMethodGateway.delete('some_token', deleteOptions, assertRequestUrl);
      done();
    });

    it('accepts revokeAllGrants option with value false', function (done) {
      let paymentMethodGateway = new PaymentMethodGateway(fakeGateway);
      let expectedURL = '/payment_methods/any/some_token?revoke_all_grants=false';
      let deleteOptions = {revokeAllGrants: 'false'};
      let assertRequestUrl = url => assert.equal(expectedURL, url); // eslint-disable-line func-style

      paymentMethodGateway.delete('some_token', deleteOptions, assertRequestUrl);
      done();
    });

    it('accepts just the token, revokeAllGrants is optional', function (done) {
      let paymentMethodGateway = new PaymentMethodGateway(fakeGateway);
      let expectedURL = '/payment_methods/any/some_token';
      let assertRequestUrl = url => assert.equal(expectedURL, url); // eslint-disable-line func-style

      paymentMethodGateway.delete('some_token', assertRequestUrl);
      done();
    });

    it('calls callback with error if keys are invalid', function (done) {
      let paymentMethodGateway = new PaymentMethodGateway(fakeGateway);
      let deleteOptions = {invalid_key: 'true'}; // eslint-disable-line camelcase

      return paymentMethodGateway.delete('some_token', deleteOptions, function (err) {
        assert.instanceOf(err, Error);
        assert.equal(err.type, errorTypes.invalidKeysError);
        assert.equal(err.message, 'These keys are invalid: invalid_key');
        done();
      });
    });
  });
});
