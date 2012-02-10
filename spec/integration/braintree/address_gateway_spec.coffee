require('../../spec_helper')

{_} = require('underscore')
braintree = specHelper.braintree

vows
  .describe('AddressGateway')
  .addBatch
    'create':
      'adding an address to an existing customer':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.customer.create({}, (err, response) ->
            specHelper.defaultGateway.address.create(
              customerId: response.customer.id
              streetAddress: '123 Fake St'
              extendedAddress: 'Suite 403'
              locality: 'Chicago'
              region: 'IL'
              postalCode: '60607'
              countryName: 'United States of America'
            , callback)
          )
          undefined
        'is successful': (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
        'returns the address': (err, response) ->
          assert.equal(response.address.streetAddress, '123 Fake St')
          assert.equal(response.address.extendedAddress, 'Suite 403')
          assert.equal(response.address.locality, 'Chicago')
          assert.equal(response.address.region, 'IL')
          assert.equal(response.address.postalCode, '60607')
          assert.equal(response.address.countryName, 'United States of America')

      'with invalid params':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.customer.create({}, (err, response) ->
            specHelper.defaultGateway.address.create(
              customerId: response.customer.id
              countryName: 'invalid country'
            , callback)
          )
          undefined
        'is not successful': (err, response) ->
          assert.isNull(err)
          assert.isFalse(response.success)
        'returns an error message': (err, response) ->
          assert.equal(response.message, 'Country name is not an accepted country.')
        'has an error on countryName': (err, response) ->
          assert.equal(response.errors.for('address').on('countryName')[0].code, '91803')
          assert.equal(response.errors.for('address').on('countryName')[0].attribute, 'country_name')
        'returns deepErrors': (err, response) ->
          errorCodes = _.map(response.errors.deepErrors(), (error) ->
            error.code
          )
          assert.equal(errorCodes.length, 1)
          assert.include(errorCodes, '91803')
    'delete':
      'deleting an existing address':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.customer.create({}, (err, response) ->
            specHelper.defaultGateway.address.create(
              customerId: response.customer.id
              countryName: 'United States of America'
            , (err, response) ->
              specHelper.defaultGateway.address.delete(
                response.address.customerId,
                response.address.id,
                (err) ->
                  specHelper.defaultGateway.address.find(
                    response.address.customerId,
                    response.address.id,
                    callback
                  )
              )
            )
          )
          undefined
        'deletes the address': (err, address) ->
          assert.isNull(address)
          assert.equal(err.type, braintree.errorTypes.notFoundError)

    'find':
      'finding an existing address':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.customer.create({}, (err, response) ->
            specHelper.defaultGateway.address.create(
              customerId: response.customer.id
              streetAddress: '123 Fake St'
              extendedAddress: 'Suite 403'
              locality: 'Chicago'
              region: 'IL'
              postalCode: '60607'
              countryName: 'United States of America'
            , (err, response) ->
              specHelper.defaultGateway.address.find(
                response.address.customerId,
                response.address.id,
                callback
              )
            )
          )
          undefined
        'does not have an error': (err, address) ->
          assert.isNull(err)
        'returns the address': (err, address) ->
          assert.equal(address.streetAddress, '123 Fake St')
          assert.equal(address.extendedAddress, 'Suite 403')
          assert.equal(address.locality, 'Chicago')
          assert.equal(address.region, 'IL')
          assert.equal(address.postalCode, '60607')
          assert.equal(address.countryName, 'United States of America')

      'when the address cannot be found':
        topic: ->
          specHelper.defaultGateway.address.find('non-existent-customer', 'id', @callback)
          undefined
        'returns a not found error': (err, address) ->
          assert.equal(err.type, braintree.errorTypes.notFoundError)
        'does not return an address': (err, address) ->
          assert.isNull(address)

      'when the customer id is whitespace':
        topic: ->
          specHelper.defaultGateway.address.find(' ', 'id', @callback)
          undefined
        'returns a not found error': (err, address) ->
          assert.equal(err.type, braintree.errorTypes.notFoundError)

      'when the address id is whitespace':
        topic: ->
          specHelper.defaultGateway.address.find('blah', "\t ", @callback)
          undefined
        'returns a not found error': (err, address) ->
          assert.equal(err.type, braintree.errorTypes.notFoundError)

    'update':
      'update an existing address':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.customer.create({}, (err, response) ->
            specHelper.defaultGateway.address.create(
              customerId: response.customer.id
              streetAddress: '1 Old Street'
              extendedAddress: 'Old Extended'
              locality: 'Old City'
              region: 'Old State'
              postalCode: '60607'
              countryName: 'France'
            , (err, response) ->
              specHelper.defaultGateway.address.update(
                response.address.customerId,
                response.address.id,
                streetAddress: '1 New Street'
                extendedAddress: 'New Extended'
                locality: 'New City'
                region: 'New State'
                postalCode: '60630'
                countryName: 'United States of America'
              , callback)
            )
          )
          undefined
        'is successful': (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
        'returns the updated address': (err, response) ->
          assert.equal(response.address.streetAddress, '1 New Street')
          assert.equal(response.address.extendedAddress, 'New Extended')
          assert.equal(response.address.locality, 'New City')
          assert.equal(response.address.region, 'New State')
          assert.equal(response.address.postalCode, '60630')
          assert.equal(response.address.countryName, 'United States of America')

      'with invalid params':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.customer.create({}, (err, response) ->
            specHelper.defaultGateway.address.create(
              customerId: response.customer.id
              streetAddress: '1 Old Street'
              extendedAddress: 'Old Extended'
              locality: 'Old City'
              region: 'Old State'
              postalCode: '60607'
              countryName: 'France'
            , (err, response) ->
              specHelper.defaultGateway.address.update(
                response.address.customerId,
                response.address.id,
                {countryName: 'invalid country'},
                callback)
            )
          )
          undefined
        'is not successful': (err, response) ->
          assert.isNull(err)
          assert.isFalse(response.success)
        'returns an error message': (err, response) ->
          assert.equal(response.message, 'Country name is not an accepted country.')
        'has an error on countryName': (err, response) ->
          assert.equal(response.errors.for('address').on('countryName')[0].code, '91803')
          assert.equal(response.errors.for('address').on('countryName')[0].attribute, 'country_name')
        'returns deepErrors': (err, response) ->
          errorCodes = _.map(response.errors.deepErrors(), (error) ->
            error.code
          )
          assert.equal(errorCodes.length, 1)
          assert.include(errorCodes, '91803')

  .export(module)
