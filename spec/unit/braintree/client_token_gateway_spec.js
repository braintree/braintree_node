'use strict';

require('../../spec_helper');
let { ClientTokenGateway } = require('../../../lib/braintree/client_token_gateway');
let { braintree } = specHelper;

describe("ClientTokenGateway", () =>
  describe("generate", () =>
    it("returns an error when credit card options are supplied without a customer ID", function(done) {
      let clientToken;
      return clientToken = specHelper.defaultGateway.clientToken.generate({
        options: {makeDefault: true, verifyCard: true}
      }, function(err, result) {
        assert.equal(err.type, braintree.errorTypes.unexpectedError);
        assert.equal(err.message, "A customer id is required for the following options: makeDefault, verifyCard");
        return done();
      });
    })
  )
);
