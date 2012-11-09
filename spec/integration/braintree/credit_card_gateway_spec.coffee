require('../../spec_helper')
_ = require('underscore')._
braintree = specHelper.braintree
util = require('util')
{CreditCard} = require('../../../lib/braintree/credit_card')
{CreditCardNumbers} = require('../../../lib/braintree/test/credit_card_numbers')
{CreditCardDefaults} = require('../../../lib/braintree/test/credit_card_defaults')

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
          assert.isTrue(response.creditCard.uniqueNumberIdentifier.length == 32)

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

    'card type indicator are set':
      'with a prepaid card':
        topic: () ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            firstName: 'John',
            lastName: 'Smith'
          , (err, response) ->
            specHelper.defaultGateway.creditCard.create(
              customerId: response.customer.id,
              number: CreditCardNumbers.CardTypeIndicators.Prepaid,
              expirationDate: '05/2012',
              options: {
                verifyCard: true
              }
            , callback))
          undefined
        'sets the prepaid field to Yes': (err, response) ->
          assert.equal(response.creditCard.prepaid, CreditCard.Prepaid.Yes)
      'with a commercial card':
        topic: () ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            firstName: 'John',
            lastName: 'Smith'
          , (err, response) ->
            specHelper.defaultGateway.creditCard.create(
              customerId: response.customer.id,
              number: CreditCardNumbers.CardTypeIndicators.Commercial,
              expirationDate: '05/2012',
              options: {
                verifyCard: true
              }
            , callback))
          undefined
        'sets the commercial field to Yes': (err, response) ->
          assert.equal(response.creditCard.commercial, CreditCard.Commercial.Yes)
      'with a payroll card':
        topic: () ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            firstName: 'John',
            lastName: 'Smith'
          , (err, response) ->
            specHelper.defaultGateway.creditCard.create(
              customerId: response.customer.id,
              number: CreditCardNumbers.CardTypeIndicators.Payroll,
              expirationDate: '05/2012',
              options: {
                verifyCard: true
              }
            , callback))
          undefined
        'sets the payroll field to Yes': (err, response) ->
          assert.equal(response.creditCard.payroll, CreditCard.Payroll.Yes)
      'with a heathcare card':
        topic: () ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            firstName: 'John',
            lastName: 'Smith'
          , (err, response) ->
            specHelper.defaultGateway.creditCard.create(
              customerId: response.customer.id,
              number: CreditCardNumbers.CardTypeIndicators.Healthcare,
              expirationDate: '05/2012',
              options: {
                verifyCard: true
              }
            , callback))
          undefined
        'sets the healthcare field to Yes': (err, response) ->
          assert.equal(response.creditCard.healthcare, CreditCard.Healthcare.Yes)
      'with a durbin regulated card':
        topic: () ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            firstName: 'John',
            lastName: 'Smith'
          , (err, response) ->
            specHelper.defaultGateway.creditCard.create(
              customerId: response.customer.id,
              number: CreditCardNumbers.CardTypeIndicators.DurbinRegulated,
              expirationDate: '05/2012',
              options: {
                verifyCard: true
              }
            , callback))
          undefined
        'sets the durbin regulated field to Yes': (err, response) ->
          assert.equal(response.creditCard.durbinRegulated, CreditCard.DurbinRegulated.Yes)
      'with a debit card':
        topic: () ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            firstName: 'John',
            lastName: 'Smith'
          , (err, response) ->
            specHelper.defaultGateway.creditCard.create(
              customerId: response.customer.id,
              number: CreditCardNumbers.CardTypeIndicators.Debit,
              expirationDate: '05/2012',
              options: {
                verifyCard: true
              }
            , callback))
          undefined
        'sets the debit field to Yes': (err, response) ->
          assert.equal(response.creditCard.debit, CreditCard.Debit.Yes)

      'it sets the country of issuance':
        topic: () ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            firstName: 'John',
            lastName: 'Smith'
          , (err, response) ->
            specHelper.defaultGateway.creditCard.create(
              customerId: response.customer.id,
              number: CreditCardNumbers.CardTypeIndicators.CountryOfIssuance,
              expirationDate: '05/2012',
              options: {
                verifyCard: true
              }
            , callback))
          undefined
        'sets the country of issuance field to the default': (err, response) ->
          assert.equal(response.creditCard.countryOfIssuance, CreditCardDefaults.CountryOfIssuance)

      'it sets the issuing bank':
        topic: () ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            firstName: 'John',
            lastName: 'Smith'
          , (err, response) ->
            specHelper.defaultGateway.creditCard.create(
              customerId: response.customer.id,
              number: CreditCardNumbers.CardTypeIndicators.IssuingBank,
              expirationDate: '05/2012',
              options: {
                verifyCard: true
              }
            , callback))
          undefined
        'sets the issuing bank field to the default': (err, response) ->
          assert.equal(response.creditCard.issuingBank, CreditCardDefaults.IssuingBank)

    'negative card type indicators':
      'with a negative card type indicator card':
        topic: () ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            firstName: 'John',
            lastName: 'Smith'
          , (err, response) ->
            specHelper.defaultGateway.creditCard.create(
              customerId: response.customer.id,
              number: CreditCardNumbers.CardTypeIndicators.No,
              expirationDate: '05/2012',
              options: {
                verifyCard: true
              }
            , callback))
          undefined
        'sets the prepaid field to No': (err, response) ->
          assert.equal(response.creditCard.prepaid, CreditCard.Prepaid.No)
        'sets the payroll field to No': (err, response) ->
          assert.equal(response.creditCard.payroll, CreditCard.Payroll.No)
        'sets the debit field to No': (err, response) ->
          assert.equal(response.creditCard.debit, CreditCard.Debit.No)
        'sets the commercial field to No': (err, response) ->
          assert.equal(response.creditCard.commercial, CreditCard.Commercial.No)
        'sets the durbin regulated field to No': (err, response) ->
          assert.equal(response.creditCard.durbinRegulated, CreditCard.DurbinRegulated.No)
        'sets the heathcare field to No': (err, response) ->
          assert.equal(response.creditCard.healthcare, CreditCard.Healthcare.No)

    'unknown card type indicators':
      'with an un-identified card':
        topic: () ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            firstName: 'John',
            lastName: 'Smith'
          , (err, response) ->
            specHelper.defaultGateway.creditCard.create(
              customerId: response.customer.id,
              number: CreditCardNumbers.CardTypeIndicators.Unknown,
              expirationDate: '05/2012',
              options: {
                verifyCard: true
              }
            , callback))
          undefined
        'sets the prepaid field to Unknown': (err, response) ->
          assert.equal(response.creditCard.prepaid, CreditCard.Prepaid.Unknown)
        'sets the payroll field to Unknown': (err, response) ->
          assert.equal(response.creditCard.payroll, CreditCard.Payroll.Unknown)
        'sets the debit field to Unknown': (err, response) ->
          assert.equal(response.creditCard.debit, CreditCard.Debit.Unknown)
        'sets the commercial field to Unknown': (err, response) ->
          assert.equal(response.creditCard.commercial, CreditCard.Commercial.Unknown)
        'sets the durbin regulated field to Unknown': (err, response) ->
          assert.equal(response.creditCard.durbinRegulated, CreditCard.DurbinRegulated.Unknown)
        'sets the heathcare field to Unknown': (err, response) ->
          assert.equal(response.creditCard.healthcare, CreditCard.Healthcare.Unknown)
        'sets the country of issuance field to Unknown': (err, response) ->
          assert.equal(response.creditCard.countryOfIssuance, CreditCard.CountryOfIssuance.Unknown)
        'sets the issuing bank field to Unknown': (err, response) ->
          assert.equal(response.creditCard.issuingBank, CreditCard.IssuingBank.Unknown)


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
