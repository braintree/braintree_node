require('../../spec_helper')
_ = require('underscore')._
braintree = specHelper.braintree
util = require('util')
{CreditCard} = require('../../../lib/braintree/credit_card')
{CreditCardNumbers} = require('../../../lib/braintree/test/credit_card_numbers')
{CreditCardDefaults} = require('../../../lib/braintree/test/credit_card_defaults')
{VenmoSdk} = require('../../../lib/braintree/test/venmo_sdk')

describe "CreditCardGateway", ->
  describe "create", ->
    customerId = null

    before (done) ->
      specHelper.defaultGateway.customer.create {firstName: 'John', lastName: 'Smith'}, (err, response) ->
        customerId = response.customer.id
        done()

    it "works for a simple create", (done) ->
      creditCardParams =
        customerId: customerId
        number: '5105105105105100'
        expirationDate: '05/2012'

      specHelper.defaultGateway.creditCard.create creditCardParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.equal(response.creditCard.maskedNumber, '510510******5100')
        assert.equal(response.creditCard.expirationDate, '05/2012')
        assert.isTrue(response.creditCard.uniqueNumberIdentifier.length == 32)
        assert.match(response.creditCard.imageUrl, /png/)

        done()

    it "accepts a billing address", (done) ->
      creditCardParams =
        customerId: customerId
        number: '5105105105105100'
        expirationDate: '05/2012'
        billingAddress:
          streetAddress: '123 Fake St'
          locality: 'Chicago'
          region: 'IL'
          postalCode: '60607'

      specHelper.defaultGateway.creditCard.create creditCardParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.equal(response.creditCard.maskedNumber, '510510******5100')
        assert.equal(response.creditCard.expirationDate, '05/2012')
        assert.equal(response.creditCard.billingAddress.streetAddress, '123 Fake St')
        assert.equal(response.creditCard.billingAddress.locality, 'Chicago')
        assert.equal(response.creditCard.billingAddress.region, 'IL')
        assert.equal(response.creditCard.billingAddress.postalCode, '60607')

        done()

    it "handles errors", (done) ->
      creditCardParams =
        customerId: customerId
        number: 'invalid'
        expirationDate: '05/2012'

      specHelper.defaultGateway.creditCard.create creditCardParams, (err, response) ->
        assert.isFalse(response.success)
        assert.equal(response.message, 'Credit card number must be 12-19 digits.')
        assert.equal(
          response.errors.for('creditCard').on('number')[0].code,
          '81716'
        )
        assert.equal(
          response.errors.for('creditCard').on('number')[0].attribute,
          'number'
        )
        errorCodes = (error.code for error in response.errors.deepErrors())
        assert.equal(1, errorCodes.length)
        assert.include(errorCodes, '81716')

        done()

    it "accepts a venmo sdk payment method code", (done) ->
      creditCardParams =
        customerId: customerId
        venmoSdkPaymentMethodCode: VenmoSdk.VisaPaymentMethodCode

      specHelper.defaultGateway.creditCard.create creditCardParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.equal(response.creditCard.maskedNumber, '411111******1111')
        assert.isTrue(response.creditCard.venmoSdk)

        done()

    it "rejects a bad venmo sdk payment method code", (done) ->
      creditCardParams =
        customerId: customerId
        venmoSdkPaymentMethodCode: VenmoSdk.InvalidPaymentMethodCode

      specHelper.defaultGateway.creditCard.create creditCardParams, (err, response) ->
        assert.isNull(err)
        assert.isFalse(response.success)
        errorCodes = (error.code for error in response.errors.deepErrors())
        assert.equal(1, errorCodes.length)
        assert.include(errorCodes, '91727')
        assert.equal(response.message, "Invalid VenmoSDK payment method code")

        done()

    it "venmo sdk is true for card created with a venmo sdk session", (done) ->
      creditCardParams =
        customerId: customerId
        number: '5105105105105100'
        expirationDate: '05/2012'
        options:
          venmoSdkSession: VenmoSdk.Session


      specHelper.defaultGateway.creditCard.create creditCardParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.equal(response.creditCard.maskedNumber, '510510******5100')
        assert.isTrue(response.creditCard.venmoSdk)

        done()

    it "venmo sdk is false for card created with an invalid venmo sdk session", (done) ->
      creditCardParams =
        customerId: customerId
        number: '5105105105105100'
        expirationDate: '05/2012'
        options:
          venmoSdkSession: VenmoSdk.InvalidSession


      specHelper.defaultGateway.creditCard.create creditCardParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.equal(response.creditCard.maskedNumber, '510510******5100')
        assert.isFalse(response.creditCard.venmoSdk)

        done()

    context "card type indicators", ->
      it "handles prepaid cards", (done) ->
        creditCardParams =
          customerId: customerId
          number: CreditCardNumbers.CardTypeIndicators.Prepaid
          expirationDate: '05/2012'
          options:
            verifyCard: true

        specHelper.defaultGateway.creditCard.create creditCardParams, (err, response) ->
          assert.equal(response.creditCard.prepaid, CreditCard.Prepaid.Yes)

          done()

      it "handles commercial cards", (done) ->
        creditCardParams =
          customerId: customerId
          number: CreditCardNumbers.CardTypeIndicators.Commercial
          expirationDate: '05/2012'
          options:
            verifyCard: true

        specHelper.defaultGateway.creditCard.create creditCardParams, (err, response) ->
          assert.equal(response.creditCard.commercial, CreditCard.Commercial.Yes)

          done()

      it "handles payroll cards", (done) ->
        creditCardParams =
          customerId: customerId
          number: CreditCardNumbers.CardTypeIndicators.Payroll
          expirationDate: '05/2012'
          options:
            verifyCard: true

        specHelper.defaultGateway.creditCard.create creditCardParams, (err, response) ->
          assert.equal(response.creditCard.payroll, CreditCard.Payroll.Yes)

          done()

      it "handles healthcare cards", (done) ->
        creditCardParams =
          customerId: customerId
          number: CreditCardNumbers.CardTypeIndicators.Healthcare
          expirationDate: '05/2012'
          options:
            verifyCard: true

        specHelper.defaultGateway.creditCard.create creditCardParams, (err, response) ->
          assert.equal(response.creditCard.healthcare, CreditCard.Healthcare.Yes)

          done()

      it "handles durbin regulated cards", (done) ->
        creditCardParams =
          customerId: customerId
          number: CreditCardNumbers.CardTypeIndicators.DurbinRegulated
          expirationDate: '05/2012'
          options:
            verifyCard: true

        specHelper.defaultGateway.creditCard.create creditCardParams, (err, response) ->
          assert.equal(response.creditCard.durbinRegulated, CreditCard.DurbinRegulated.Yes)

          done()

      it "handles debit cards", (done) ->
        creditCardParams =
          customerId: customerId
          number: CreditCardNumbers.CardTypeIndicators.Debit
          expirationDate: '05/2012'
          options:
            verifyCard: true

        specHelper.defaultGateway.creditCard.create creditCardParams, (err, response) ->
          assert.equal(response.creditCard.debit, CreditCard.Debit.Yes)

          done()

      it "sets the country of issuance", (done) ->
        creditCardParams =
          customerId: customerId
          number: CreditCardNumbers.CardTypeIndicators.CountryOfIssuance
          expirationDate: '05/2012'
          options:
            verifyCard: true

        specHelper.defaultGateway.creditCard.create creditCardParams, (err, response) ->
          assert.equal(response.creditCard.countryOfIssuance, CreditCardDefaults.CountryOfIssuance)

          done()

      it "sets the issuing bank", (done) ->
        creditCardParams =
          customerId: customerId
          number: CreditCardNumbers.CardTypeIndicators.IssuingBank
          expirationDate: '05/2012'
          options:
            verifyCard: true

        specHelper.defaultGateway.creditCard.create creditCardParams, (err, response) ->
          assert.equal(response.creditCard.issuingBank, CreditCardDefaults.IssuingBank)

          done()

    context "negative card type indicators", ->
      createResponse = null

      before (done) ->
        creditCardParams =
          customerId: customerId
          number: CreditCardNumbers.CardTypeIndicators.No
          expirationDate: '05/2012'
          options:
            verifyCard: true

        specHelper.defaultGateway.creditCard.create creditCardParams, (err, response) ->
          createResponse = response
          done()

      it 'sets the prepaid field to No', ->
        assert.equal(createResponse.creditCard.prepaid, CreditCard.Prepaid.No)

      it 'sets the payroll field to No', ->
        assert.equal(createResponse.creditCard.prepaid, CreditCard.Prepaid.No)
        assert.equal(createResponse.creditCard.payroll, CreditCard.Payroll.No)

      it 'sets the debit field to No', ->
        assert.equal(createResponse.creditCard.debit, CreditCard.Debit.No)

      it 'sets the commercial field to No', ->
        assert.equal(createResponse.creditCard.commercial, CreditCard.Commercial.No)

      it 'sets the durbin regulated field to No', ->
        assert.equal(createResponse.creditCard.durbinRegulated, CreditCard.DurbinRegulated.No)

      it 'sets the heathcare field to No', ->
        assert.equal(createResponse.creditCard.healthcare, CreditCard.Healthcare.No)

    context "unknown card type indicators", ->
      createResponse = null

      before (done) ->
        creditCardParams =
          customerId: customerId
          number: CreditCardNumbers.CardTypeIndicators.Unknown
          expirationDate: '05/2012'
          options:
            verifyCard: true

        specHelper.defaultGateway.creditCard.create creditCardParams, (err, response) ->
          createResponse = response
          done()

      it 'sets the prepaid field to Unknown', ->
        assert.equal(createResponse.creditCard.prepaid, CreditCard.Prepaid.Unknown)

      it 'sets the payroll field to Unknown', ->
        assert.equal(createResponse.creditCard.payroll, CreditCard.Payroll.Unknown)

      it 'sets the debit field to Unknown', ->
        assert.equal(createResponse.creditCard.debit, CreditCard.Debit.Unknown)

      it 'sets the commercial field to Unknown', ->
        assert.equal(createResponse.creditCard.commercial, CreditCard.Commercial.Unknown)

      it 'sets the durbin regulated field to Unknown', ->
        assert.equal(createResponse.creditCard.durbinRegulated, CreditCard.DurbinRegulated.Unknown)

      it 'sets the heathcare field to Unknown', ->
        assert.equal(createResponse.creditCard.healthcare, CreditCard.Healthcare.Unknown)

      it 'sets the country of issuance field to Unknown', ->
        assert.equal(createResponse.creditCard.countryOfIssuance, CreditCard.CountryOfIssuance.Unknown)

      it 'sets the issuing bank field to Unknown', ->
        assert.equal(createResponse.creditCard.issuingBank, CreditCard.IssuingBank.Unknown)

  describe "delete", (done) ->
    customerToken = null

    before (done) ->
      customerParams =
        creditCard:
          number: '5105105105105100',
          expirationDate: '05/2014'

      specHelper.defaultGateway.customer.create customerParams, (err, response) ->
        customerToken = response.customer.creditCards[0].token
        done()

    it "deletes the credit card", (done) ->
      specHelper.defaultGateway.creditCard.delete customerToken, (err) ->
        assert.isNull(err)

        specHelper.defaultGateway.creditCard.find customerToken, (err, response) ->
          assert.equal(err.type, braintree.errorTypes.notFoundError)
          done()

    it "handles invalid tokens", (done) ->
      specHelper.defaultGateway.creditCard.delete 'nonexistent_token', (err) ->
        assert.equal(err.type, braintree.errorTypes.notFoundError)

        done()

  describe "expired", ->
    it "returns expired cards", (done) ->
      customerParams =
        creditCard:
          number: '5105105105105100',
          expirationDate: '01/2010'

      specHelper.defaultGateway.customer.create customerParams, (err, response) ->
        testCard = response.customer.creditCards[0]

        specHelper.defaultGateway.creditCard.expired (err, result) ->
          assert.include(result.ids, testCard.token)

          done()

  describe "expiringBetween", ->
    it "returns card expiring between the given dates", (done) ->
      customerParams =
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/2016'

      specHelper.defaultGateway.customer.create customerParams, (err, response) ->
        testCard = response.customer.creditCards[0]

        today = new Date
        before = new Date("2016-04-31")
        after = new Date("2016-10-01")

        specHelper.defaultGateway.creditCard.expiringBetween before, after, (err, result) ->
          assert.isNull(err)
          assert.include(result.ids, testCard.token)

          done()

  describe "find", ->
    customerToken = null

    before (done) ->
      customerParams =
        creditCard:
          number: '5105105105105100',
          expirationDate: '05/2014'

      specHelper.defaultGateway.customer.create customerParams, (err, response) ->
        customerToken = response.customer.creditCards[0].token
        done()

    it "finds the card", (done) ->
      specHelper.defaultGateway.creditCard.find customerToken, (err, creditCard) ->
        assert.isNull(err)
        assert.equal(creditCard.maskedNumber, '510510******5100')
        assert.equal(creditCard.expirationDate, '05/2014')

        done()

    it "handles not finding the card", (done) ->
      specHelper.defaultGateway.creditCard.find 'nonexistent_token', (err, creditCard) ->
        assert.equal(err.type, braintree.errorTypes.notFoundError)

        done()

    it "handles whitespace", (done) ->
      specHelper.defaultGateway.creditCard.find ' ', (err, creditCard) ->
        assert.equal(err.type, braintree.errorTypes.notFoundError)

        done()

  describe "update", ->
    creditCardToken = null
    before (done) ->
      customerParams =
        creditCard:
          cardholderName: 'Old Cardholder Name',
          number: '5105105105105100',
          expirationDate: '05/2014'
          billingAddress:
            streetAddress: '123 Old St',
            locality: 'Old City',
            region: 'Old Region'

      specHelper.defaultGateway.customer.create customerParams, (err, response) ->
        creditCardToken = response.customer.creditCards[0].token
        done()

    it "updates the card", (done) ->
      updateParams =
        cardholderName: 'New Cardholder Name',
        number: '4111111111111111',
        expirationDate: '12/2015'

      specHelper.defaultGateway.creditCard.update creditCardToken, updateParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.equal(response.creditCard.cardholderName, 'New Cardholder Name')
        assert.equal(response.creditCard.maskedNumber, '411111******1111')
        assert.equal(response.creditCard.expirationDate, '12/2015')

        done()

    it "updates the billing address", (done) ->
      updateParams =
        cardholderName: 'New Cardholder Name'
        number: '4111111111111111'
        expirationDate: '12/2015'
        billingAddress:
          streetAddress: '123 New St'
          locality: 'New City'
          region: 'New Region'
          options: 
            updateExisting: true

      specHelper.defaultGateway.creditCard.update creditCardToken, updateParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.equal(response.creditCard.cardholderName, 'New Cardholder Name')
        assert.equal(response.creditCard.maskedNumber, '411111******1111')
        assert.equal(response.creditCard.expirationDate, '12/2015')
        billingAddress = response.creditCard.billingAddress
        assert.equal(billingAddress.streetAddress, '123 New St')
        assert.equal(billingAddress.locality, 'New City')
        assert.equal(billingAddress.region, 'New Region')

        done()

    it "handles errors", (done) ->
      updateParams =
        number: 'invalid'

      specHelper.defaultGateway.creditCard.update creditCardToken, updateParams, (err, response) ->
        assert.isFalse(response.success)
        assert.equal(response.message, 'Credit card number must be 12-19 digits.')
        assert.equal(
          response.errors.for('creditCard').on('number')[0].code,
          '81716'
        )
        assert.equal(
          response.errors.for('creditCard').on('number')[0].attribute,
          'number'
        )
        errorCodes = (error.code for error in response.errors.deepErrors())
        assert.equal(1, errorCodes.length)
        assert.include(errorCodes, '81716')

        done()
