require('../../spec_helper')
{ClientTokenGateway} = require('../../../lib/braintree/client_token_gateway')
braintree = specHelper.braintree

describe "ClientTokenGateway", ->
  describe "generate", ->
    it "returns an error when credit card options are supplied without a customer ID", (done) ->
      clientToken = specHelper.defaultGateway.clientToken.generate({
        options: {makeDefault: true, verifyCard: true}
      }, (err, result) ->
        assert.equal(err.type, braintree.errorTypes.unexpectedError)
        assert.equal(err.message, "A customer id is required for the following options: makeDefault, verifyCard")
        done()
      )
