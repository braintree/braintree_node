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
        assert.equal(err.message, "Invalid keys: makeDefault,verifyCard")
        done()
      )
  describe "error responses", ->
    it "responds with a ErrorResponse successfully", (done) ->
      clientToken = specHelper.defaultGateway.clientToken.generate({
        customerId: 3
      }, (err, result) ->
        assert.equal(result.message, "Customer specified by customer_id does not exist")
        done()
      )
