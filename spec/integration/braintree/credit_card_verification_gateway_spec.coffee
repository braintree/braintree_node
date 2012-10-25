require('../../spec_helper')

braintree = specHelper.braintree

vows
  .describe('CreditCardVerificationGateway')
  .addBatch
    'find':
      'when found':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            creditCard:
              cardholderName: "John Smith"
              number: '4000111111111115'
              expirationDate: '05/2014'
              options:
                verifyCard: true
          , (err, response) ->
            specHelper.defaultGateway.creditCardVerification.find(response.verification.id, callback)
          )
          undefined
        'does not have an error': (err, response) ->
          assert.isNull(err)
        'returns customer details': (err, verification) ->
          assert.equal(verification.creditCard.cardholderName, 'John Smith')
      'when not found':
        topic: ->
          specHelper.defaultGateway.creditCardVerification.find('nonexistent_verification', @callback)
          undefined
        'returns a not found error': (err, response) ->
          assert.equal(err.type, braintree.errorTypes.notFoundError)

      'when the id is whitespace':
        topic: ->
          specHelper.defaultGateway.creditCardVerification.find(' ', @callback)
          undefined
        'returns a not found error': (err, response) ->
          assert.equal(err.type, braintree.errorTypes.notFoundError)

  .export(module)
