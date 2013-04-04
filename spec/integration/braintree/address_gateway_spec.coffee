require("../../spec_helper")
braintree = specHelper.braintree

describe "AddressGateway", ->
  describe "create", ->
    it "handles a successful response", (done) ->
      specHelper.defaultGateway.customer.create {}, (err, response) ->
        addressParams =
          customerId: response.customer.id
          streetAddress: '123 Fake St'
          extendedAddress: 'Suite 403'
          locality: 'Chicago'
          region: 'IL'
          postalCode: '60607'
          countryName: 'United States of America'

        specHelper.defaultGateway.address.create addressParams, (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
          assert.equal(response.address.streetAddress, '123 Fake St')
          assert.equal(response.address.extendedAddress, 'Suite 403')
          assert.equal(response.address.locality, 'Chicago')
          assert.equal(response.address.region, 'IL')
          assert.equal(response.address.postalCode, '60607')
          assert.equal(response.address.countryName, 'United States of America')
          done()

    it "handles error responses", (done) ->
      specHelper.defaultGateway.customer.create {}, (err, response) ->
        addressParams =
          customerId: response.customer.id
          countryName: 'invalid country'

        specHelper.defaultGateway.address.create addressParams, (err, response) ->
          assert.isNull(err)
          assert.isFalse(response.success)
          assert.equal(response.message, 'Country name is not an accepted country.')
          assert.equal(response.errors.for('address').on('countryName')[0].code, '91803')
          assert.equal(response.errors.for('address').on('countryName')[0].attribute, 'country_name')

          errorCodes = (code for {code} in response.errors.deepErrors())

          assert.equal(errorCodes.length, 1)
          assert.include(errorCodes, '91803')
          done()

  describe "delete", ->
    it "deletes the address", (done) ->
      specHelper.defaultGateway.customer.create {}, (err, response) ->
        addressParams =
          customerId: response.customer.id
          countryName: 'United States of America'
        specHelper.defaultGateway.address.create addressParams, (err, {address}) ->
          specHelper.defaultGateway.address.delete address.customerId, address.id, (err) ->
            specHelper.defaultGateway.address.find address.customerId, address.id, (err, address) ->
              assert.isNull(address)
              assert.equal(err.type, braintree.errorTypes.notFoundError)
              done()

  describe "find", ->
    it "finds an existing address", (done) ->
      specHelper.defaultGateway.customer.create {}, (err, response) ->
        specHelper.defaultGateway.address.create {
          customerId: response.customer.id
          streetAddress: '123 Fake St'
          extendedAddress: 'Suite 403'
          locality: 'Chicago'
          region: 'IL'
          postalCode: '60607'
          countryName: 'United States of America'
        }, (err, {address}) ->
          specHelper.defaultGateway.address.find address.customerId, address.id, (err, address) ->
            assert.isNull err
            assert.equal address.streetAddress, '123 Fake St'
            assert.equal address.extendedAddress, 'Suite 403'
            assert.equal address.locality, 'Chicago'
            assert.equal address.region, 'IL'
            assert.equal address.postalCode, '60607'
            assert.equal address.countryName, 'United States of America'
            done()

    it "yields a not found error when the address cannot be found", (done) ->
      specHelper.defaultGateway.address.find 'non-existent-customer', 'id', (err, address) ->
        assert.isNull address
        assert.equal err.type, braintree.errorTypes.notFoundError
        done()

    it "handles whitespace in the customer id", (done) ->
      specHelper.defaultGateway.address.find ' ', 'id', (err, address) ->
        assert.isNull address
        assert.equal err.type, braintree.errorTypes.notFoundError
        done()

    it "handles whitespace in the address", (done) ->
      specHelper.defaultGateway.address.find 'blah', "\t ", (err, address) ->
        assert.isNull address
        assert.equal err.type, braintree.errorTypes.notFoundError
        done()

  describe "update", ->
    it "yields the updated address", (done) ->
      specHelper.defaultGateway.customer.create {}, (err, response) ->
        specHelper.defaultGateway.address.create {
          customerId: response.customer.id
          streetAddress: '1 Old Street'
          extendedAddress: 'Old Extended'
          locality: 'Old City'
          region: 'Old State'
          postalCode: '60607'
          countryName: 'France'
        }, (err, {address}) ->
          specHelper.defaultGateway.address.update address.customerId, address.id, {
            streetAddress: '1 New Street'
            extendedAddress: 'New Extended'
            locality: 'New City'
            region: 'New State'
            postalCode: '60630'
            countryName: 'United States of America'
          }, (err, response) ->
            assert.isNull err
            assert.isTrue response.success
            assert.equal response.address.streetAddress, '1 New Street'
            assert.equal response.address.extendedAddress, 'New Extended'
            assert.equal response.address.locality, 'New City'
            assert.equal response.address.region, 'New State'
            assert.equal response.address.postalCode, '60630'
            assert.equal response.address.countryName, 'United States of America'
            done()

    it "handles invalid params", (done) ->
      specHelper.defaultGateway.customer.create {}, (err, response) ->
        specHelper.defaultGateway.address.create {
          customerId: response.customer.id
          streetAddress: '1 Old Street'
          extendedAddress: 'Old Extended'
          locality: 'Old City'
          region: 'Old State'
          postalCode: '60607'
          countryName: 'France'
        }, (err, {address}) ->
          specHelper.defaultGateway.address.update address.customerId, address.id, {
            countryName: 'invalid country'
          }, (err, response) ->
            assert.isNull err
            assert.isFalse response.success
            assert.equal response.message, 'Country name is not an accepted country.'
            assert.equal response.errors.for('address').on('countryName')[0].code, '91803'
            assert.equal response.errors.for('address').on('countryName')[0].attribute, 'country_name'
            errorCodes = (code for {code} in response.errors.deepErrors())
            assert.equal errorCodes.length, 1
            assert.include errorCodes, '91803'
            done()
