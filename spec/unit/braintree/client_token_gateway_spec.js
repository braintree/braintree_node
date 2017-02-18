'use strict';

require('../../spec_helper');

let braintree = specHelper.braintree;

describe('ClientTokenGateway', () =>
  describe('generate', () =>
    it('returns an error when credit card options are supplied without a customer ID', function (done) {
      specHelper.defaultGateway.clientToken.generate({
        options: {makeDefault: true, verifyCard: true}
      }, function (err) {
        assert.equal(err.type, braintree.errorTypes.unexpectedError);
        assert.equal(err.message, 'A customer id is required for the following options: makeDefault, verifyCard');
        done();
      });
    })
  )
);
