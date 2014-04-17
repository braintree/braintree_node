require('../../spec_helper')

{_} = require('underscore')
{VenmoSdk} = require('../../../lib/braintree/test/venmo_sdk')
{Config} = require('../../../lib/braintree/config')
braintree = specHelper.braintree

describe "CustomerGateway", ->
  describe "create", ->
    it "creates a customer", (done) ->
      specHelper.defaultGateway.customer.create {firstName: 'John', lastName: 'Smith'}, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.equal(response.customer.firstName, 'John')
        assert.equal(response.customer.lastName, 'Smith')

        done()

    it "handles uft8 characters", (done) ->
      specHelper.defaultGateway.customer.create {firstName: 'Jöhn', lastName: 'Smith'}, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.equal(response.customer.firstName, 'Jöhn')
        assert.equal(response.customer.lastName, 'Smith')

        done()

    it "creates blank customers", (done) ->
      specHelper.defaultGateway.customer.create {}, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)

        done()

    it "stores custom fields", (done) ->
      customerParams =
        customFields:
          storeMe: 'custom value'

      specHelper.defaultGateway.customer.create customerParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.equal(response.customer.customFields.storeMe, 'custom value')

        done()

    it "creates customers with credit cards", (done) ->
      customerParams =
        firstName: 'John'
        lastName: 'Smith'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/2012'

      specHelper.defaultGateway.customer.create customerParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.equal(response.customer.firstName, 'John')
        assert.equal(response.customer.lastName, 'Smith')
        assert.equal(response.customer.creditCards.length, 1)
        assert.equal(response.customer.creditCards[0].expirationMonth, '05')
        assert.equal(response.customer.creditCards[0].expirationYear, '2012')
        assert.equal(response.customer.creditCards[0].maskedNumber, '510510******5100')
        assert.isTrue(/^\w{32}$/.test(response.customer.creditCards[0].uniqueNumberIdentifier))

        done()

    it "fails on duplicate payment methods when provided the option to do so", (done) ->
      customerParams =
        firstName: 'John',
        lastName: 'Smith'
        creditCard:
          number: '5555555555554444'
          expirationDate: '05/2012'
          options:
            failOnDuplicatePaymentMethod: true

      specHelper.defaultGateway.customer.create customerParams, (err, response) ->
        specHelper.defaultGateway.customer.create customerParams, (err, response) ->
          assert.isFalse(response.success)
          assert.equal(
            response.errors.for('customer').for('creditCard').on('number')[0].code,
            '81724'
          )

          done()

    it "allows verifying cards", (done) ->
      customerParams =
        firstName: 'John'
        lastName: 'Smith'
        creditCard:
          number: '5555555555554444'
          expirationDate: '05/2012'
          options:
            verifyCard: true

      specHelper.defaultGateway.customer.create customerParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)

        done()

    it "handles unsuccessful verifications", (done) ->
      customerParams =
        firstName: 'John'
        lastName: 'Smith'
        creditCard:
          number: '6011000990139424'
          expirationDate: '05/2012'
          options:
            verifyCard: true

      specHelper.defaultGateway.customer.create customerParams, (err, response) ->
        assert.isNull(err)
        assert.isFalse(response.success)
        assert.equal(response.verification.status, 'processor_declined')
        assert.equal(response.verification.processorResponseCode, '2000')
        assert.equal(response.verification.processorResponseText, 'Do Not Honor')

        done()

    it "handles validation errors", (done) ->
      customerParams =
        creditCard:
          number: 'invalid card number'
          expirationDate: '05/2012'

      specHelper.defaultGateway.customer.create customerParams, (err, response) ->
        assert.isFalse(response.success)
        assert.equal(response.message, 'Credit card number is invalid.')
        assert.equal(
          response.errors.for('customer').for('creditCard').on('number')[0].code,
          '81715'
        )
        errorCodes = (error.code for error in response.errors.deepErrors())
        assert.equal(errorCodes.length, 1)
        assert.include(errorCodes, '81715')

        done()

    it "allows creating a customer with a billing addres", (done) ->  
      customerParams =
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

      specHelper.defaultGateway.customer.create customerParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.equal(response.customer.firstName, 'John')
        assert.equal(response.customer.lastName, 'Smith')
        assert.equal(response.customer.creditCards.length, 1)
        assert.equal(response.customer.creditCards[0].expirationMonth, '05')
        assert.equal(response.customer.creditCards[0].expirationYear, '2012')
        assert.equal(response.customer.creditCards[0].maskedNumber, '510510******5100')
        assert.equal(response.customer.creditCards.length, 1)
        billingAddress = response.customer.creditCards[0].billingAddress
        assert.equal(billingAddress.streetAddress, '123 Fake St')
        assert.equal(billingAddress.extendedAddress, 'Suite 403')
        assert.equal(billingAddress.locality, 'Chicago')
        assert.equal(billingAddress.region, 'IL')
        assert.equal(billingAddress.postalCode, '60607')
        assert.equal(billingAddress.countryName, 'United States of America')

        done()

    it "handles validation errors on nested billing addresses", (done) ->
      customerParams =
        creditCard:
          number: 'invalid card number'
          expirationDate: '05/2012'
          billingAddress:
            countryName: 'invalid country'

      specHelper.defaultGateway.customer.create customerParams, (err, response) ->
        assert.isFalse(response.success)
        assert.equal(response.message, 'Credit card number is invalid.\nCountry name is not an accepted country.')
        assert.equal(
          response.errors.for('customer').for('creditCard').on('number')[0].code,
          '81715'
        )
        assert.equal(
          response.errors.for('customer').for('creditCard').for('billingAddress').on('countryName')[0].code,
          '91803'
        )
        errorCodes = (error.code for error in response.errors.deepErrors())
        assert.equal(errorCodes.length, 2)
        assert.include(errorCodes, '81715')
        assert.include(errorCodes, '91803')
        assert.equal(response.params.customer.creditCard.expirationDate, '05/2012')
        assert.equal(response.params.customer.creditCard.billingAddress.countryName, 'invalid country')

        done()

    it "creates a customer with venmo sdk payment method code", (done) ->
      customerParams = 
        creditCard:
          venmoSdkPaymentMethodCode: VenmoSdk.VisaPaymentMethodCode

      specHelper.defaultGateway.customer.create customerParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.equal(response.customer.creditCards[0].bin, "411111")

        done()

    it "creates a customer with venmo sdk session", (done) ->
      customerParams =
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/2012'
          options:
            venmoSdkSession: VenmoSdk.Session

      specHelper.defaultGateway.customer.create customerParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.isTrue(response.customer.creditCards[0].venmoSdk)

        done()

    it "creates a customer with a payment method nonce", (done) ->
      myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))
      specHelper.defaultGateway.clientToken.generate({}, (err, result) ->
        clientToken = JSON.parse(result.clientToken)
        authorizationFingerprint = clientToken.authorizationFingerprint
        params = {
          authorizationFingerprint: authorizationFingerprint,
          sharedCustomerIdentifierType: "testing",
          sharedCustomerIdentifier: "testing-identifier",
          share: true,
          credit_card: {
            number: "4111111111111111",
            expiration_month: "11",
            expiration_year: "2099"
          }
        }

        myHttp.post("/client_api/nonces.json", params, (statusCode, body) ->
          nonce = JSON.parse(body).nonce
          customerParams =
            creditCard:
              paymentMethodNonce: nonce

          specHelper.defaultGateway.customer.create customerParams, (err, response) ->
            assert.isNull(err)
            assert.isTrue(response.success)
            assert.equal(response.customer.creditCards[0].bin, "411111")

            done()
        )
      )

  describe "delete", ->
    it "deletes a customer", (done) ->
      specHelper.defaultGateway.customer.create {}, (err, response) ->
        specHelper.defaultGateway.customer.delete response.customer.id, (err) ->
          assert.isNull(err)

          specHelper.defaultGateway.customer.find response.customer.id, (err, customer) ->
            assert.equal(err.type, braintree.errorTypes.notFoundError)

            done()

    it "handles invalid customer ids", (done) ->
      specHelper.defaultGateway.customer.delete 'nonexistent_customer', (err) ->
        assert.equal(err.type, braintree.errorTypes.notFoundError)
        
        done()

  describe "find", ->
    it "finds a custoemr", (done) ->
      customerParams =
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

      specHelper.defaultGateway.customer.create customerParams, (err, response) ->
        specHelper.defaultGateway.customer.find response.customer.id, (err, customer) ->
          assert.isNull(err)
          assert.equal(customer.firstName, 'John')
          assert.equal(customer.lastName, 'Smith')
          billingAddress = customer.creditCards[0].billingAddress
          assert.equal(billingAddress.streetAddress, '123 E Fake St')
          assert.equal(billingAddress.company, '')

          done()

    it "returns an error if unable to find the customer", (done) ->
      specHelper.defaultGateway.customer.find 'nonexistent_customer', (err, customer) ->
        assert.equal(err.type, braintree.errorTypes.notFoundError)

        done()

    it "handles whitespace ids", (done) ->
      specHelper.defaultGateway.customer.find ' ', (err, customer) ->
        assert.equal(err.type, braintree.errorTypes.notFoundError)

        done()

  describe "update", ->
    customerId = null

    beforeEach (done) ->
      customerParams =
        firstName: 'Old First Name'
        lastName: 'Old Last Name'

      specHelper.defaultGateway.customer.create customerParams, (err, response) ->
        customerId = response.customer.id
        done()

    it "updates a customer", (done) ->
      customerParams =
        firstName: 'New First Name'
        lastName: 'New Last Name'

      specHelper.defaultGateway.customer.update customerId, customerParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.equal(response.customer.firstName, 'New First Name')
        assert.equal(response.customer.lastName, 'New Last Name')
        
        done()

    it "can add a new card to a customer", (done) ->
      customerParams =
        firstName: 'New First Name'
        lastName: 'New Last Name'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/2014'

      specHelper.defaultGateway.customer.update customerId, customerParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.equal(response.customer.firstName, 'New First Name')
        assert.equal(response.customer.lastName, 'New Last Name')
        assert.equal(response.customer.creditCards[0].maskedNumber, '510510******5100')

        done()

    it "can add a new card and billing address", (done) ->
      customerParams =
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

      specHelper.defaultGateway.customer.update customerId, customerParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.equal(response.customer.firstName, 'New First Name')
        assert.equal(response.customer.lastName, 'New Last Name')
        assert.equal(response.customer.creditCards[0].maskedNumber, '510510******5100')
        billingAddress = response.customer.creditCards[0].billingAddress
        assert.equal(billingAddress.streetAddress, '123 E Fake St')
        assert.equal(billingAddress.locality, 'Chicago')
        assert.equal(billingAddress.region, 'IL')
        assert.equal(billingAddress.postalCode, '60607')
        assert.equal(response.customer.addresses[0].streetAddress, '123 E Fake St')
        assert.equal(response.customer.addresses[0].locality, 'Chicago')
        assert.equal(response.customer.addresses[0].region, 'IL')
        assert.equal(response.customer.addresses[0].postalCode, '60607')

        done()

    it "returns an error when not found", (done) ->
      specHelper.defaultGateway.customer.update 'nonexistent_customer', {}, (err, response) ->
        assert.equal(err.type, braintree.errorTypes.notFoundError)

        done()

    it "handles validation errors", (done) ->
      specHelper.defaultGateway.customer.update customerId, {email: 'invalid_email_address'}, (err, response) ->
        assert.isFalse(response.success)
        assert.equal(response.message, 'Email is an invalid format.')
        assert.equal(
          response.errors.for('customer').on('email')[0].code,
          '81604'
        )
        assert.equal(
          response.errors.for('customer').on('email')[0].attribute,
          'email'
        )

        done()

    context "with existing card and billing address", ->
      creditCardToken = null

      beforeEach (done) ->
        customerParams =
          firstName: 'Old First Name'
          lastName: 'Old Last Name'
          creditCard:
            cardholderName: 'Old Cardholder Name'
            number: '4111111111111111'
            expirationDate: '04/2014'
            billingAddress:
              streetAddress: '123 Old St'
              locality: 'Old City'

        specHelper.defaultGateway.customer.create customerParams, (err, response) ->
          customerId = response.customer.id
          creditCardToken = response.customer.creditCards[0].token
          done()

      it "udpates an existing card", (done) ->
        customerParams =
          firstName: 'New First Name'
          lastName: 'New Last Name'
          creditCard:
            cardholderName: 'New Cardholder Name'
            number: '5105105105105100'
            expirationDate: '05/2014'
            options:
              updateExistingToken: creditCardToken

        specHelper.defaultGateway.customer.update customerId, customerParams, (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
          assert.equal(response.customer.firstName, 'New First Name')
          assert.equal(response.customer.lastName, 'New Last Name')
          assert.equal(response.customer.creditCards[0].maskedNumber, '510510******5100')
          assert.equal(response.customer.creditCards[0].cardholderName, 'New Cardholder Name')
          assert.equal(response.customer.creditCards[0].expirationDate, '05/2014')

          done()

      it "updates an existing card and billing address", (done) ->
        customerParams =
          firstName: 'New First Name'
          lastName: 'New Last Name'
          creditCard:
            cardholderName: 'New Cardholder Name'
            number: '5105105105105100'
            expirationDate: '05/2014'
            options:
              updateExistingToken: creditCardToken
            billingAddress:
              streetAddress: '123 New St'
              locality: 'New City'
              options:
                updateExisting: true

        specHelper.defaultGateway.customer.update customerId, customerParams, (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
          assert.equal(response.customer.firstName, 'New First Name')
          assert.equal(response.customer.lastName, 'New Last Name')
          assert.equal(response.customer.creditCards[0].maskedNumber, '510510******5100')
          assert.equal(response.customer.creditCards[0].cardholderName, 'New Cardholder Name')
          assert.equal(response.customer.creditCards[0].expirationDate, '05/2014')
          assert.equal(response.customer.addresses.length, 1)
          billingAddress = response.customer.creditCards[0].billingAddress
          assert.equal(billingAddress.streetAddress, '123 New St')
          assert.equal(billingAddress.locality, 'New City')

          done()

      it "doesn't serialize nulls as empty objects", (done) ->
        customerParams =
          creditCard:
            number: '4111111111111111'
            expirationDate: '05/2014'
            billingAddress:
              streetAddress: null
              extendedAddress: "asd"

        specHelper.defaultGateway.customer.create customerParams, (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
          billingAddress = response.customer.creditCards[0].billingAddress
          assert.equal(billingAddress.streetAddress, null)

          done()
