require('../../spec_helper')
_ = require('underscore')._
braintree = specHelper.braintree
util = require('util')
{CreditCard} = require('../../../lib/braintree/credit_card')

vows
  .describe('CreditCardGateway')
  .addBatch
    'create':
      'for a minimal case':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            firstName: 'John',
            lastName: 'Smith'
          , (err, response) ->
            specHelper.defaultGateway.creditCard.create(
              customerId: response.customer.id,
              number: '5105105105105100',
              expirationDate: '05/2012'
            , callback))
          undefined
        'does not have an error': (err, response) ->
          assert.isNull(err)
        'is successful': (err, response) ->
          assert.isTrue(response.success)
        'has credit card attributes': (err, response) ->
          assert.equal(response.creditCard.maskedNumber, '510510******5100')
          assert.equal(response.creditCard.expirationDate, '05/2012')
          assert.isTrue(/^\w{32}$/.test(response.creditCard.uniqueNumberIdentifier))

      'with billing address':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
              firstName: 'John',
              lastName: 'Smith'
            , (err, response) ->
              specHelper.defaultGateway.creditCard.create
                customerId: response.customer.id,
                number: '5105105105105100',
                expirationDate: '05/2012',
                billingAddress:
                  streetAddress: '123 Fake St',
                  locality: 'Chicago',
                  region: 'IL',
                  postalCode: '60607'
              , callback)
          undefined
        'is successful': (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
        'has credit card attributes': (err, response) ->
          assert.equal(response.creditCard.maskedNumber, '510510******5100')
          assert.equal(response.creditCard.expirationDate, '05/2012')
        'creates a billing address': (err, response) ->
          assert.equal(response.creditCard.billingAddress.streetAddress, '123 Fake St')
          assert.equal(response.creditCard.billingAddress.locality, 'Chicago')
          assert.equal(response.creditCard.billingAddress.region, 'IL')
          assert.equal(response.creditCard.billingAddress.postalCode, '60607')

      'with errors':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.customer.create
              firstName: 'John',
              lastName: 'Smith'
            , (err, response) ->
              specHelper.defaultGateway.creditCard.create
                customerId: response.customer.id,
                number: 'invalid',
                expirationDate: '05/2012'
              , callback
          undefined
        'is unsuccessful': (err, response) ->
          assert.isFalse(response.success)
        'has a unified message': (err, response) ->
          assert.equal(response.message, 'Credit card number must be 12-19 digits.')
        'has an error on number': (err, response) ->
          assert.equal(
            response.errors.for('creditCard').on('number')[0].code,
            '81716')
        'has an attribute on ValidationError objects': (err, response) ->
          assert.equal(
            response.errors.for('creditCard').on('number')[0].attribute,
            'number')
        'returns deepErrors': (err, response) ->
          errorCodes = _.map(response.errors.deepErrors(), (error) ->
            return error.code )
          assert.equal(1, errorCodes.length)
          assert.include(errorCodes, '81716')

    'delete':
      'the delete response':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
              creditCard:
                number: '5105105105105100',
                expirationDate: '05/2014'
            , (err, response) ->
              specHelper.defaultGateway.creditCard.delete(
                response.customer.creditCards[0].token, callback))
          undefined
        'does not have an error': (err) ->
          assert.isNull(err)

      'the creditCard':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
              creditCard:
                number: '5105105105105100',
                expirationDate: '05/2014'
            , (err, response) ->
              specHelper.defaultGateway.creditCard.delete(
                response.customer.creditCards[0].token,
                (err) ->
                  specHelper.defaultGateway.creditCard.find(
                    response.customer.creditCards[0].token, callback)))
          undefined
        'returning a not found error': (err, response) ->
          assert.equal(err.type, braintree.errorTypes.notFoundError)
      'when the credit card cannot be found':
        topic: ->
          specHelper.defaultGateway.creditCard.delete('nonexistent_token', @callback)
          undefined
        'returns a not found error': (err, response) ->
          assert.equal(err.type, braintree.errorTypes.notFoundError)

    'expired':
      'when a card is expired':
        topic: ->
          callback = @callback
          creditCard = null

          specHelper.defaultGateway.customer.create(
            creditCard:
              number: '5105105105105100',
              expirationDate: '01/2010'

          , (err, response) ->
            testCard = response.customer.creditCards[0]

            specHelper.defaultGateway.creditCard.expired((err, searchResult) ->
              callback(null, {testCard: testCard, search: searchResult})))

          undefined
        'includes a card' : (err, result) ->
          assert.includes(result.search.ids, result.testCard.token)

    'expiringBetween':
      'when there are results':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            creditCard:
              number: '5105105105105100',
              expirationDate: '05/2016'
          , (err, response) ->
            testCard = response.customer.creditCards[0]

            today = new Date
            before = new Date("2016-04-31")
            after = new Date("2016-10-01")

            specHelper.defaultGateway.creditCard.expiringBetween(before, after, (err, searchResult) ->
              callback(err, {testCard: testCard, searchResult: searchResult})))

          undefined
        'has no errors': (err, result) ->
          assert.isNull(err)
        'includes the card': (err, result) ->
          assert.includes(result.searchResult.ids, result.testCard.token)

    'find':
      'when found':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
              creditCard:
                number: '5105105105105100',
                expirationDate: '05/2014'
            , (err, response) ->
              specHelper.defaultGateway.creditCard.find(
                response.customer.creditCards[0].token,
                callback))
          undefined
        'does not have an error': (err, response) ->
          assert.isNull(err)
        'returns credit card details': (err, creditCard) ->
          assert.equal(creditCard.maskedNumber, '510510******5100')
          assert.equal(creditCard.expirationDate, '05/2014')
      'when not found':
        topic: () ->
          specHelper.defaultGateway.creditCard.find('nonexistent_token', @callback)
          undefined
        'returns a not found error': (err, response) ->
          assert.equal(err.type, braintree.errorTypes.notFoundError)
      'when the id is whitespace':
        topic: () ->
          specHelper.defaultGateway.creditCard.find(" ", @callback)
          undefined
        'returns a not found error': (err, address) ->
          assert.equal(err.type, braintree.errorTypes.notFoundError)

    'prepaid':
      'with a prepaid card':
        topic: () ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            firstName: 'John',
            lastName: 'Smith'
          , (err, response) ->
            specHelper.defaultGateway.creditCard.create(
              customerId: response.customer.id,
              number: '4500600000000061',
              expirationDate: '05/2012',
              options: {
                verifyCard: true
              }
            , callback))
          undefined
        'sets the prepaid field to Yes': (err, response) ->
          assert.equal(response.creditCard.prepaid, CreditCard.Prepaid.Yes)

      'with a non-prepaid card':
        topic: () ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            firstName: 'John',
            lastName: 'Smith'
          , (err, response) ->
            specHelper.defaultGateway.creditCard.create(
              customerId: response.customer.id,
              number: '4111111111111111',
              expirationDate: '05/2012',
              options: {
                verifyCard: true
              }
            , callback))
          undefined
        'sets the prepaid field to No': (err, response) ->
          assert.equal(response.creditCard.prepaid, CreditCard.Prepaid.No)

      'with an un-identified card':
        topic: () ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            firstName: 'John',
            lastName: 'Smith'
          , (err, response) ->
            specHelper.defaultGateway.creditCard.create(
              customerId: response.customer.id,
              number: '5555555555554444',
              expirationDate: '05/2012',
              options: {
                verifyCard: true
              }
            , callback))
          undefined
        'sets the prepaid field to Unknown': (err, response) ->
          assert.equal(response.creditCard.prepaid, CreditCard.Prepaid.Unknown)

    'update':
      'for a minimal case':
        topic: () ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            creditCard:
              cardholderName: 'Old Cardholder Name',
              number: '5105105105105100',
              expirationDate: '05/2014'
            , (err, response) ->
              specHelper.defaultGateway.creditCard.update(
                response.customer.creditCards[0].token,
                  cardholderName: 'New Cardholder Name',
                  number: '4111111111111111',
                  expirationDate: '12/2015'
                , callback))
          undefined

        'does not have an error': (err, response) -> assert.isNull(err)
        'is successful': (err, response) -> assert.isTrue(response.success)
        'has updated credit card attributes': (err, response) ->
          assert.equal(response.creditCard.cardholderName, 'New Cardholder Name')
          assert.equal(response.creditCard.maskedNumber, '411111******1111')
          assert.equal(response.creditCard.expirationDate, '12/2015')


      'with updating the billing address':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            creditCard:
              cardholderName: 'Old Cardholder Name',
              number: '5105105105105100',
              expirationDate: '05/2014',
              billingAddress:
                streetAddress: '123 Old St',
                locality: 'Old City',
                region: 'Old Region'
            , (err, response) ->
              specHelper.defaultGateway.creditCard.update(
                response.customer.creditCards[0].token,
                  cardholderName: 'New Cardholder Name',
                  number: '4111111111111111',
                  expirationDate: '12/2015',
                  billingAddress:
                    streetAddress: '123 New St',
                    locality: 'New City',
                    region: 'New Region',
                    options: { updateExisting: true }
              , callback))
          undefined
        'is successful': (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
        'has updated credit card attributes': (err, response) ->
          assert.equal(response.creditCard.cardholderName, 'New Cardholder Name')
          assert.equal(response.creditCard.maskedNumber, '411111******1111')
          assert.equal(response.creditCard.expirationDate, '12/2015')
        'updates the billing address': (err, response) ->
          billingAddress = response.creditCard.billingAddress
          assert.equal(billingAddress.streetAddress, '123 New St')
          assert.equal(billingAddress.locality, 'New City')
          assert.equal(billingAddress.region, 'New Region')

      'with errors':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            creditCard:
              number: '5105105105105100',
              expirationDate: '05/2014'
            , (err, response) ->
              specHelper.defaultGateway.creditCard.update(
                response.customer.creditCards[0].token,
                  number: 'invalid'
                callback))
          undefined
        'is unsuccessful': (err, response) -> assert.isFalse(response.success)
        'has a unified message': (err, response) ->
          assert.equal(response.message, 'Credit card number must be 12-19 digits.')
        'has an error on number': (err, response) ->
          assert.equal(
            response.errors.for('creditCard').on('number')[0].code,
            '81716'
          )
        'has an attribute on ValidationError objects': (err, response) ->
          assert.equal(
            response.errors.for('creditCard').on('number')[0].attribute,
            'number'
          )
        'returns deepErrors': (err, response) ->
          errorCodes = _.map(response.errors.deepErrors(), (error) -> error.code )
          assert.equal(1, errorCodes.length)
          assert.include(errorCodes, '81716')

  .export(module)
