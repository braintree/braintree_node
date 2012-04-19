require('../../spec_helper')

{_} = require('underscore')
braintree = specHelper.braintree

vows
  .describe('CustomerGateway')
  .addBatch
    'create':
      'for a minimal case':
        topic: ->
          specHelper.defaultGateway.customer.create(
            firstName: 'John'
            lastName: 'Smith'
          , @callback)
          undefined
        'does not have an error': (err, response) ->
          assert.isNull(err)
        'is successful': (err, response) ->
          assert.isTrue(response.success)
        'has customer attributes': (err, response) ->
          assert.equal(response.customer.firstName, 'John')
          assert.equal(response.customer.lastName, 'Smith')

      'for a minimal case with two-byte characters':
        topic: ->
          specHelper.defaultGateway.customer.create(
            firstName: 'Jöhn'
            lastName: 'Smith'
          , @callback)
          undefined
        'does not have an error': (err, response) ->
          assert.isNull(err)
        'is successful': (err, response) ->
          assert.isTrue(response.success)
        'has customer attributes': (err, response) ->
          assert.equal(response.customer.firstName, 'Jöhn')
          assert.equal(response.customer.lastName, 'Smith')

      'a blank customer':
        topic: ->
          specHelper.defaultGateway.customer.create({}, @callback)
          undefined
        'is successful': (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)

      'with a custom field':
        topic: ->
          specHelper.defaultGateway.customer.create(
            customFields:
              storeMe: 'custom value'
          , @callback)
          undefined
        'does not have an error': (err, response) ->
          assert.isNull(err)
        'is successful': (err, response) ->
          assert.isTrue(response.success)
        'has custom fields in response': (err, response) ->
          assert.equal(response.customer.customFields.storeMe, 'custom value')

      'with credit card':
        topic: ->
          specHelper.defaultGateway.customer.create(
            firstName: 'John'
            lastName: 'Smith'
            creditCard:
              number: '5105105105105100'
              expirationDate: '05/2012'
          , @callback)
          undefined
        'does not have an error': (err, response) ->
          assert.isNull(err)
        'is successful': (err, response) ->
          assert.isTrue(response.success)
        'has customer attributes': (err, response) ->
          assert.equal(response.customer.firstName, 'John')
          assert.equal(response.customer.lastName, 'Smith')
        'has credit card attributes': (err, response) ->
          assert.equal(response.customer.creditCards.length, 1)
          assert.equal(response.customer.creditCards[0].expirationMonth, '05')
          assert.equal(response.customer.creditCards[0].expirationYear, '2012')
          assert.equal(response.customer.creditCards[0].maskedNumber, '510510******5100')
          assert.isTrue(/^\w{32}$/.test(response.customer.creditCards[0].uniqueNumberIdentifier))

      'with failOnDuplicatePaymentMethod option':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
              firstName: 'John',
              lastName: 'Smith'
              creditCard:
                number: '5555555555554444'
                expirationDate: '05/2012'
                options:
                  failOnDuplicatePaymentMethod: true
            , (err, response) ->
              specHelper.defaultGateway.customer.create
                firstName: 'John',
                lastName: 'Smith'
                creditCard:
                  number: '5555555555554444'
                  expirationDate: '05/2012'
                  options:
                    failOnDuplicatePaymentMethod: true
              , callback)
          undefined
        'is not successful': (err, response) ->
          assert.isFalse(response.success)
        'has a card duplicated error on creditCard.number': (err, response) ->
          assert.equal(
            response.errors.for('customer').for('creditCard').on('number')[0].code,
            '81724'
          )

      'with a successful verification':
        topic: ->
          specHelper.defaultGateway.customer.create(
            firstName: 'John'
            lastName: 'Smith'
            creditCard:
              number: '5555555555554444'
              expirationDate: '05/2012'
              options:
                verifyCard: true
          , @callback)
          undefined
        'is successful': (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)

      'with an unsuccessful verification':
        topic: ->
          specHelper.defaultGateway.customer.create(
            firstName: 'John'
            lastName: 'Smith'
            creditCard:
              number: '6011000990139424'
              expirationDate: '05/2012'
              options:
                verifyCard: true
          , @callback)
          undefined
        'is not successful': (err, response) ->
          assert.isNull(err)
          assert.isFalse(response.success)
        'returns the verification': (err, response) ->
          assert.equal(response.verification.status, 'processor_declined')
          assert.equal(response.verification.processorResponseCode, '2000')
          assert.equal(response.verification.processorResponseText, 'Do Not Honor')

      'with credit card with errors':
        topic: ->
          specHelper.defaultGateway.customer.create(
            creditCard:
              number: 'invalid card number'
              expirationDate: '05/2012'
          , @callback)
          undefined
        'is unsuccessful': (err, response) ->
          assert.isFalse(response.success)
        'has a unified message': (err, response) ->
          assert.equal(response.message, 'Credit card number is invalid.')
        'has a nested error on creditCard.number': (err, response) ->
          assert.equal(
            response.errors.for('customer').for('creditCard').on('number')[0].code,
            '81715'
          )
        'returns deepErrors': (err, response) ->
          errorCodes = _.map(response.errors.deepErrors(), (error) ->
            error.code
          )
          assert.equal(errorCodes.length, 1)
          assert.include(errorCodes, '81715')

      'with credit card and billing address':
        topic: ->
          specHelper.defaultGateway.customer.create(
            firstName: 'John'
            lastName: 'Smith'
            creditCard:
              number: '5105105105105100'
              expirationDate: '05/2012'
              billingAddress:
                streetAddress: '123 Fake St'
                extendedAddress: 'Suite 403'
                locality: 'Chicago'
                region: 'IL'
                postalCode: '60607'
                countryName: 'United States of America'
          , @callback)
          undefined
        'does not have an error': (err, response) ->
          assert.isNull(err)
        'is successful': (err, response) ->
          assert.isTrue(response.success)
        'has customer attributes': (err, response) ->
          assert.equal(response.customer.firstName, 'John')
          assert.equal(response.customer.lastName, 'Smith')
        'has credit card attributes': (err, response) ->
          assert.equal(response.customer.creditCards.length, 1)
          assert.equal(response.customer.creditCards[0].expirationMonth, '05')
          assert.equal(response.customer.creditCards[0].expirationYear, '2012')
          assert.equal(response.customer.creditCards[0].maskedNumber, '510510******5100')
        'has billing address attributes': (err, response) ->
          assert.equal(response.customer.creditCards.length, 1)
          billingAddress = response.customer.creditCards[0].billingAddress
          assert.equal(billingAddress.streetAddress, '123 Fake St')
          assert.equal(billingAddress.extendedAddress, 'Suite 403')
          assert.equal(billingAddress.locality, 'Chicago')
          assert.equal(billingAddress.region, 'IL')
          assert.equal(billingAddress.postalCode, '60607')
          assert.equal(billingAddress.countryName, 'United States of America')

      'with credit card and billing address with errors':
        topic: ->
          specHelper.defaultGateway.customer.create(
            creditCard:
              number: 'invalid card number'
              expirationDate: '05/2012'
              billingAddress:
                countryName: 'invalid country'
          , @callback)
          undefined
        'is unsuccessful': (err, response) ->
          assert.isFalse(response.success)
        'has a unified message': (err, response) ->
          assert.equal(response.message, 'Credit card number is invalid.\nCountry name is not an accepted country.')
        'has a nested error on creditCard.number': (err, response) ->
          assert.equal(
            response.errors.for('customer').for('creditCard').on('number')[0].code,
            '81715'
          )
        'has a nested error on creditCard.billingAddress.countryName': (err, response) ->
          assert.equal(
            response.errors.for('customer').for('creditCard').for('billingAddress').on('countryName')[0].code,
            '91803'
          )
        'returns deepErrors': (err, response) ->
          errorCodes = _.map(response.errors.deepErrors(), (error) ->
            error.code
          )
          assert.equal(errorCodes.length, 2)
          assert.include(errorCodes, '81715')
          assert.include(errorCodes, '91803')
        'returns params': (err, response) ->
          assert.equal(response.params.customer.creditCard.expirationDate, '05/2012')
          assert.equal(response.params.customer.creditCard.billingAddress.countryName, 'invalid country')

      'with errors':
        topic: ->
          specHelper.defaultGateway.customer.create(
            email: 'invalid_email_address'
          , @callback)
          undefined
        'is unsuccessful': (err, response) ->
          assert.isFalse(response.success)
        'has a unified message': (err, response) ->
          assert.equal(response.message, 'Email is an invalid format.')
        'has an error on email': (err, response) ->
          assert.equal(
            response.errors.for('customer').on('email')[0].code
            '81604'
          )
        'has an attribute on ValidationError objects': (err, response) ->
          assert.equal(
            response.errors.for('customer').on('email')[0].attribute,
            'email'
          )
        'returns deepErrors': (err, response) ->
          errorCodes = _.map(response.errors.deepErrors(), (error) ->
            error.code
          )
          assert.equal(errorCodes.length, 1)
          assert.include(errorCodes, '81604')

    'delete':
      'the delete response':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.customer.create({}, (err, response) ->
            specHelper.defaultGateway.customer.delete(response.customer.id, callback)
          )
          undefined
        'does not have an error': (err) ->
          assert.isNull(err)

      'deletes the customer':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.customer.create({}, (err, response) ->
            specHelper.defaultGateway.customer.delete(response.customer.id, (err) ->
              specHelper.defaultGateway.customer.find(response.customer.id, callback)
            )
          )
          undefined
        'find returns a not found error': (err, response) ->
          assert.equal(err.type, braintree.errorTypes.notFoundError)

      'when customer cannot be found':
        topic: ->
          specHelper.defaultGateway.customer.delete('nonexistent_customer', @callback)
          undefined
        'returns a not found error': (err, response) ->
          assert.equal(err.type, braintree.errorTypes.notFoundError)

    'find':
      'when found':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            firstName: 'John'
            lastName: 'Smith'
            creditCard:
              number: '5105105105105100'
              expirationDate: '05/2014'
              billingAddress:
                company: ''
                streetAddress: '123 E Fake St'
                locality: 'Chicago'
                region: 'IL'
                postalCode: '60607'
          , (err, response) ->
            specHelper.defaultGateway.customer.find(response.customer.id, callback)
          )
          undefined
        'does not have an error': (err, response) ->
          assert.isNull(err)
        'returns customer details': (err, customer) ->
          assert.equal(customer.firstName, 'John')
          assert.equal(customer.lastName, 'Smith')
        'returns the billing address details, including empty strings': (err, customer) ->
          billingAddress = customer.creditCards[0].billingAddress
          assert.equal(billingAddress.streetAddress, '123 E Fake St')
          assert.equal(billingAddress.company, '')

      'when not found':
        topic: ->
          specHelper.defaultGateway.customer.find('nonexistent_customer', @callback)
          undefined
        'returns a not found error': (err, response) ->
          assert.equal(err.type, braintree.errorTypes.notFoundError)

      'when the id is whitespace':
        topic: ->
          specHelper.defaultGateway.customer.find(' ', @callback)
          undefined
        'returns a not found error': (err, response) ->
          assert.equal(err.type, braintree.errorTypes.notFoundError)

    'update':
      'for a minimal case':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            firstName: 'Old First Name'
            lastName: 'Old Last Name'
          , (err, response) ->
            specHelper.defaultGateway.customer.update(
              response.customer.id,
              firstName: 'New First Name'
              lastName: 'New Last Name'
            , callback)
          )
          undefined
        'does not have an error': (err, response) ->
          assert.isNull(err)
        'is successful': (err, response) ->
          assert.isTrue(response.success)
        'has updated customer attributes': (err, response) ->
          assert.equal(response.customer.firstName, 'New First Name')
          assert.equal(response.customer.lastName, 'New Last Name')

      'with adding a new card':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            firstName: 'Old First Name'
            lastName: 'Old Last Name'
          , (err, response) ->
            specHelper.defaultGateway.customer.update(
              response.customer.id,
              firstName: 'New First Name'
              lastName: 'New Last Name'
              creditCard:
                number: '5105105105105100'
                expirationDate: '05/2014'
            , callback)
          )
          undefined
        'is successful': (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
        'updates the customer': (err, response) ->
          assert.equal(response.customer.firstName, 'New First Name')
          assert.equal(response.customer.lastName, 'New Last Name')
        'adds the credit card': (err, response) ->
          assert.equal(response.customer.creditCards[0].maskedNumber, '510510******5100')

      'with adding a new card and billing address':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            firstName: 'Old First Name'
            lastName: 'Old Last Name'
          , (err, response) ->
            specHelper.defaultGateway.customer.update(
              response.customer.id,
              firstName: 'New First Name'
              lastName: 'New Last Name'
              creditCard:
                number: '5105105105105100'
                expirationDate: '05/2014'
                billingAddress:
                  streetAddress: '123 E Fake St'
                  locality: 'Chicago'
                  region: 'IL'
                  postalCode: '60607'
            , callback)
          )
          undefined
        'is successful': (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
        'updates the customer': (err, response) ->
          assert.equal(response.customer.firstName, 'New First Name')
          assert.equal(response.customer.lastName, 'New Last Name')
        'adds the credit card': (err, response) ->
          assert.equal(response.customer.creditCards[0].maskedNumber, '510510******5100')
        'adds the billing address': (err, response) ->
          billingAddress = response.customer.creditCards[0].billingAddress
          assert.equal(billingAddress.streetAddress, '123 E Fake St')
          assert.equal(billingAddress.locality, 'Chicago')
          assert.equal(billingAddress.region, 'IL')
          assert.equal(billingAddress.postalCode, '60607')
          assert.equal(response.customer.addresses[0].streetAddress, '123 E Fake St')
          assert.equal(response.customer.addresses[0].locality, 'Chicago')
          assert.equal(response.customer.addresses[0].region, 'IL')
          assert.equal(response.customer.addresses[0].postalCode, '60607')

      'with updating an existing card':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            firstName: 'Old First Name'
            lastName: 'Old Last Name'
            creditCard:
              cardholderName: 'Old Cardholder Name'
              number: '4111111111111111'
              expirationDate: '04/2014'
          , (err, response) ->
            specHelper.defaultGateway.customer.update(
              response.customer.id,
              firstName: 'New First Name'
              lastName: 'New Last Name'
              creditCard:
                cardholderName: 'New Cardholder Name'
                number: '5105105105105100'
                expirationDate: '05/2014'
                options:
                  updateExistingToken: response.customer.creditCards[0].token
            , callback)
          )
          undefined
        'is successful': (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
        'updates the customer': (err, response) ->
          assert.equal(response.customer.firstName, 'New First Name')
          assert.equal(response.customer.lastName, 'New Last Name')
        'updates the credit card': (err, response) ->
          assert.equal(response.customer.creditCards[0].maskedNumber, '510510******5100')
          assert.equal(response.customer.creditCards[0].cardholderName, 'New Cardholder Name')
          assert.equal(response.customer.creditCards[0].expirationDate, '05/2014')

      'with updating an existing card and billing address':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            firstName: 'Old First Name'
            lastName: 'Old Last Name'
            creditCard:
              cardholderName: 'Old Cardholder Name'
              number: '4111111111111111'
              expirationDate: '04/2014'
              billingAddress:
                streetAddress: '123 Old St'
                locality: 'Old City'
          , (err, response) ->
            specHelper.defaultGateway.customer.update(
              response.customer.id,
              firstName: 'New First Name'
              lastName: 'New Last Name'
              creditCard:
                cardholderName: 'New Cardholder Name'
                number: '5105105105105100'
                expirationDate: '05/2014'
                options:
                  updateExistingToken: response.customer.creditCards[0].token
                billingAddress:
                  streetAddress: '123 New St'
                  locality: 'New City'
                  options:
                    updateExisting: true
            , callback)
          )
          undefined
        'is successful': (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
        'updates the customer': (err, response) ->
          assert.equal(response.customer.firstName, 'New First Name')
          assert.equal(response.customer.lastName, 'New Last Name')
        'updates the credit card': (err, response) ->
          assert.equal(response.customer.creditCards[0].maskedNumber, '510510******5100')
          assert.equal(response.customer.creditCards[0].cardholderName, 'New Cardholder Name')
          assert.equal(response.customer.creditCards[0].expirationDate, '05/2014')
        'updates the billing address': (err, response) ->
          assert.equal(response.customer.addresses.length, 1)
          billingAddress = response.customer.creditCards[0].billingAddress
          assert.equal(billingAddress.streetAddress, '123 New St')
          assert.equal(billingAddress.locality, 'New City')

      'when not found':
        topic: ->
          specHelper.defaultGateway.customer.update('nonexistent_customer', {}, @callback)
          undefined
        'returns a not found error': (err, response) ->
          assert.equal(err.type, braintree.errorTypes.notFoundError)

      'with errors':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.customer.create({}, (err, response) ->
            specHelper.defaultGateway.customer.update(
              response.customer.id,
              email: 'invalid_email_address'
            , callback)
          )
          undefined
        'is unsuccessful': (err, response) ->
          assert.isFalse(response.success)
        'has a unified message': (err, response) ->
          assert.equal(response.message, 'Email is an invalid format.')
        'has an error on email': (err, response) ->
          assert.equal(
            response.errors.for('customer').on('email')[0].code,
            '81604'
          )
        'has an attribute on ValidationError objects': (err, response) ->
          assert.equal(
            response.errors.for('customer').on('email')[0].attribute,
            'email'
          )

  .export(module)
