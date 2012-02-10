require('../../spec_helper')

{_} = require('underscore')
braintree = specHelper.braintree

vows
  .describe('TransparentRedirectGateway')
  .addBatch
    'createCustomerData':
      'generating data to create a customer':
        topic: ->
          callback = @callback
          specHelper.simulateTrFormPost(
            specHelper.defaultGateway.transparentRedirect.url,
            specHelper.defaultGateway.transparentRedirect.createCustomerData(
              redirectUrl: 'http://www.example.com/'
              customer:
                firstName: 'Dan'
            ),
            customer:
              last_name: 'Smith'
            , (err, result) ->
              specHelper.defaultGateway.transparentRedirect.confirm(result, callback)
          )
          undefined
        'is successful': (err, result) ->
          assert.isNull(err)
          assert.isTrue(result.success)
        'uses data submitted in tr_data': (err, result) ->
          assert.equal(result.customer.firstName, 'Dan')
        'uses data submitted in form params': (err, result) ->
          assert.equal(result.customer.lastName, 'Smith')

      'creating a customer with credit card and billing address':
        topic: ->
          callback = @callback
          specHelper.simulateTrFormPost(
            specHelper.defaultGateway.transparentRedirect.url,
            specHelper.defaultGateway.transparentRedirect.createCustomerData(
              redirectUrl: 'http://www.example.com/'
              customer:
                firstName: 'Dan'
                creditCard:
                  cardholderName: 'Cardholder'
                  billingAddress:
                    streetAddress: '123 E Fake St'
            ),
            customer:
              last_name: 'Smith'
              creditCard:
                number: '5105105105105100'
                expirationMonth: '05'
                expirationYear: '2017'
                billingAddress:
                  extendedAddress: '5th Floor'
            , (err, result) ->
              specHelper.defaultGateway.transparentRedirect.confirm(result, callback)
          )
          undefined
        'is successful': (err, result) ->
          assert.isNull(err)
          assert.isTrue(result.success)
        'uses data submitted in tr_data': (err, result) ->
          assert.equal(result.customer.firstName, 'Dan')
          assert.equal(result.customer.creditCards[0].cardholderName, 'Cardholder')
          assert.equal(result.customer.creditCards[0].billingAddress.streetAddress, '123 E Fake St')
        'uses data submitted in form params': (err, result) ->
          assert.equal(result.customer.lastName, 'Smith')
          assert.equal(result.customer.creditCards[0].maskedNumber, '510510******5100')
          assert.equal(result.customer.creditCards[0].expirationMonth, '05')
          assert.equal(result.customer.creditCards[0].expirationYear, '2017')
          assert.equal(result.customer.creditCards[0].billingAddress.extendedAddress, '5th Floor')

    'updateCustomerData':
      'updating a customer':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            firstName: 'Old First Name'
            lastName: 'Old Last Name'
          , (err, result) ->
            specHelper.simulateTrFormPost(
              specHelper.defaultGateway.transparentRedirect.url,
              specHelper.defaultGateway.transparentRedirect.updateCustomerData(
                redirectUrl: 'http://www.example.com/'
                customerId: result.customer.id
                customer:
                  firstName: 'New First Name'
              ),
              customer:
                lastName: 'New Last Name'
              , (err, result) ->
                specHelper.defaultGateway.transparentRedirect.confirm(result, callback)
            )
          )
          undefined
        'is successful': (err, result) ->
          assert.isNull(err)
          assert.isTrue(result.success)
        'uses data submitted in tr_data': (err, result) ->
          assert.equal(result.customer.firstName, 'New First Name')
        'uses data submitted in form params': (err, result) ->
          assert.equal(result.customer.lastName, 'New Last Name')

    'transactionData':
      'generating data to create a transaction':
        topic: ->
          callback = @callback
          specHelper.simulateTrFormPost(
            specHelper.defaultGateway.transparentRedirect.url,
            specHelper.defaultGateway.transparentRedirect.transactionData(
              redirectUrl: 'http://www.example.com/'
              transaction:
                amount: 50.00
                type: 'sale'
            ),
            transaction:
              creditCard:
                number: '5105105105105100'
                expirationDate: '05/2012'
            , (err, result) ->
              specHelper.defaultGateway.transparentRedirect.confirm(result, callback)
          )
          undefined
        'is successful': (err, result) ->
          assert.isNull(err)
          assert.isTrue(result.success)
        'creates a transaction': (err, result) ->
          assert.equal(result.transaction.status, 'authorized')
        'uses data submitted in tr_data': (err, result) ->
          assert.equal(result.transaction.amount, '50.00')
        'uses data submitted in form params': (err, result) ->
          assert.equal(result.transaction.creditCard.maskedNumber, '510510******5100')

    'createCreditCard':
      'generating data to create a credit card':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            firstName: 'Customer First Name'
            , (err, result) ->
              specHelper.simulateTrFormPost(
                specHelper.defaultGateway.transparentRedirect.url,
                specHelper.defaultGateway.transparentRedirect.createCreditCardData(
                  redirectUrl: 'http://www.example.com/'
                  creditCard:
                    customerId: result.customer.id
                    cardholderName: 'Dan'
                ),
                creditCard:
                  number: '5105105105105100'
                  expirationDate: '05/2017'
                , (err, result) ->
                  specHelper.defaultGateway.transparentRedirect.confirm(result, callback)
              )
          )
          undefined
        'is successful': (err, result) ->
          assert.isNull(err)
          assert.isTrue(result.success)
        'uses data submitted in tr_data': (err, result) ->
          assert.equal(result.creditCard.cardholderName, 'Dan')
        'uses data submitted in form params': (err, result) ->
          assert.equal(result.creditCard.maskedNumber, '510510******5100')

    'updateCreditCard':
      'generating data to update a credit card':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            firstName: 'Customer First Name'
            creditCard:
              cardholderName: 'Old Cardholder Name'
              number: '5105105105105100'
              expirationDate: '05/2017'
          , (err, result) ->
            specHelper.simulateTrFormPost(
              specHelper.defaultGateway.transparentRedirect.url,
              specHelper.defaultGateway.transparentRedirect.updateCreditCardData(
                redirectUrl: 'http://www.example.com/'
                paymentMethodToken: result.customer.creditCards[0].token
                creditCard:
                  cardholderName: 'New Cardholder Name'
              ),
              creditCard:
                number: '4111111111111111'
              , (err, result) ->
                specHelper.defaultGateway.transparentRedirect.confirm(result, callback)
            )
          )
          undefined
        'is successful': (err, result) ->
          assert.isNull(err)
          assert.isTrue(result.success)
        'uses data submitted in tr_data': (err, result) ->
          assert.equal(result.creditCard.cardholderName, 'New Cardholder Name')
        'uses data submitted in form params': (err, result) ->
          assert.equal(result.creditCard.maskedNumber, '411111******1111')

    'confirm':
      'when the hash is not the expected value':
        topic: ->
          specHelper.defaultGateway.transparentRedirect.confirm('a=b&hash=invalid', @callback)
          undefined
        'calls the callback with an error': (err, result) ->
          assert.equal(err.type, braintree.errorTypes.invalidTransparentRedirectHashError)

      'on http status 401':
        topic: ->
          specHelper.defaultGateway.transparentRedirect.confirm('http_status=401&hash=none', @callback)
          undefined
        'returns an authentication error': (err, result) ->
          assert.equal(err.type, braintree.errorTypes.authenticationError)

      'on http status 403':
        topic: ->
          specHelper.defaultGateway.transparentRedirect.confirm('http_status=403&hash=irrelevant', @callback)
          undefined
        'returns an authorization error': (err, result) ->
          assert.equal(err.type, braintree.errorTypes.authorizationError)

      'on http status 426':
        topic: ->
          specHelper.defaultGateway.transparentRedirect.confirm('http_status=426&hash=irrelevant', @callback)
          undefined
        'returns an upgrade required error': (err, result) ->
          assert.equal(err.type, braintree.errorTypes.upgradeRequired)

      'on http status 500':
        topic: ->
          specHelper.defaultGateway.transparentRedirect.confirm('http_status=500&hash=irrelevant', @callback)
          undefined
        'returns a server error': (err, result) ->
          assert.equal(err.type, braintree.errorTypes.serverError)

      'on http status 503':
        topic: ->
          specHelper.defaultGateway.transparentRedirect.confirm('http_status=503&hash=irrelevant', @callback)
          undefined
        'returns a down for maintenance error': (err, result) ->
          assert.equal(err.type, braintree.errorTypes.downForMaintenanceError)


  .export(module)
