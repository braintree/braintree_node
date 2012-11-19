require('../../spec_helper')
{CreditCardNumbers} = require('../../../lib/braintree/test/credit_card_numbers')
{CreditCard} = require('../../../lib/braintree/credit_card')

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

      'when using a card with card type indicators':
        topic: ->
          callback = @callback
          name = specHelper.randomId() + ' Smith'
          specHelper.defaultGateway.customer.create({
            creditCard:
              cardholderName: name,
              number: CreditCardNumbers.CardTypeIndicators.Unknown,
              expirationDate: '05/12',
              options:
                verifyCard: true
            }, (err, response) ->
              specHelper.defaultGateway.creditCardVerification.search((search) ->
                search.creditCardCardholderName().is(name)
              , (err, response) ->
                response.first((err, result) ->
                  callback(err,
                    verification: result
                    name: name
                  )
                )
              )
            )
          undefined
        'card details card type indicator should be prepaid': (err, result) ->
          assert.isNull(err)
          assert.equal(result.verification.creditCard.cardholderName, result.name)
          assert.equal(result.verification.creditCard.prepaid, CreditCard.Prepaid.Unknown)
          assert.equal(result.verification.creditCard.durbinRegulated, CreditCard.DurbinRegulated.Unknown)
          assert.equal(result.verification.creditCard.commercial, CreditCard.Commercial.Unknown)
          assert.equal(result.verification.creditCard.healthcare, CreditCard.Healthcare.Unknown)
          assert.equal(result.verification.creditCard.debit, CreditCard.Debit.Unknown)
          assert.equal(result.verification.creditCard.payroll, CreditCard.Payroll.Unknown)

  .export(module)
