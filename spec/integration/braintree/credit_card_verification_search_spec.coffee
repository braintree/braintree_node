require("../../spec_helper")
{CreditCardVerificationSearch} = require('../../../lib/braintree/credit_card_verification_search')

vows
  .describe("CreditCardVerificationSearch")
  .addBatch
    "credit card verification search":
      "when no results are found":
        topic: ->
          specHelper.defaultGateway.creditCardVerification.search((search) ->
            search.creditCardCardholderName().is(specHelper.randomId() + " Smith")
          , @callback)
          undefined

        'does not have error': (err, response) ->
          assert.isNull(err)

        'returns no results': (err, response) ->
          assert.equal(response.length(), 0)
      "when the search yields a single result":
        topic: ->
          callback = @callback
          name = specHelper.randomId() + ' Smith'
          specHelper.defaultGateway.customer.create(
            creditCard:
              cardholderName: name,
              number: '4000111111111115',
              expirationDate: '12/2016',
              options:
                verifyCard: true

            , (err, response) ->
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

        'returns the first verification': (err, result) ->
          assert.equal(result.verification.creditCard.bin, '400011')
          assert.equal(result.verification.creditCard.cardholderName, result.name)

      "when the seach returns multiple values":
        topic: ->
          callback = @callback
          name = specHelper.randomId() + ' Smith'
          specHelper.defaultGateway.customer.create({
            creditCard:
              cardholderName: name,
              number: '4000111111111115',
              expirationDate: '12/2016',
              options:
                verifyCard: true

            }, (err, response) ->
            specHelper.defaultGateway.customer.create({
              creditCard:
                cardholderName: name,
                number: '4000111111111115',
                expirationDate: '12/2016',
                options:
                  verifyCard: true
              }, (err, response) ->
                specHelper.defaultGateway.creditCardVerification.search((search) ->
                  search.creditCardCardholderName().is(name)
                , (err, response) ->
                  verifications = []
                  response.each( (err, verification) ->
                    verifications.push(verification)
                    if(verifications.length == 2)
                      callback(null, {verifications: verifications, cardholderName: name})
                    else if verifications.length > 2
                      callback("TOO Many Results", null)
                  )
                )
              )
            )
          undefined
        "2 results should be returned": (err, results) ->
          assert.isNull(err)
          assert.notEqual(results.verifications[0].id, results.verifications[1].id)
          assert.equal(results.verifications[0].creditCard.cardholderName, results.cardholderName)
          assert.equal(results.verifications[1].creditCard.cardholderName, results.cardholderName)

  .export(module)

