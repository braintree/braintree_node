require('../../spec_helper')

braintree = specHelper.braintree

vows
  .describe('Braintree')
  .addBatch
    'AuthenticationError':
      'for invalid credentials':
        topic: ->
          gateway = specHelper.braintree.connect(
            environment: specHelper.braintree.Environment.Development
            merchantId: 'invalid'
            publicKey: 'invalid'
            privateKey: 'invalid'
          )
          gateway.transaction.sale({}, @callback)
          undefined
        'returns the AuthenticationError': (err, response) ->
          assert.equal(err.type, braintree.errorTypes.authenticationError)

  .export(module)
