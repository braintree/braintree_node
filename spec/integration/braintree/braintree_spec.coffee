require('../../spec_helper')

braintree = specHelper.braintree

describe "Braintree", ->
  describe "AuthenticationError", ->
    it "is returned with invalid credentials", (done) ->
      gateway = specHelper.braintree.connect(
        environment: specHelper.braintree.Environment.Development
        merchantId: 'invalid'
        publicKey: 'invalid'
        privateKey: 'invalid'
      )

      gateway.transaction.sale {}, (err, response) ->
        assert.equal(err.type, braintree.errorTypes.authenticationError)

        done()
