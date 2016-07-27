Braintree = require("../../../lib/braintree")
require("../../spec_helper")
{CreditCardNumbers} = require('../../../lib/braintree/test/credit_card_numbers')
CreditCard = Braintree.CreditCard
CreditCardVerification = Braintree.CreditCardVerification

describe "CreditCardVerification", ->
  describe "search", ->
    it "can return empty results", (done) ->
      specHelper.defaultGateway.creditCardVerification.search (search) ->
        search.creditCardCardholderName().is(specHelper.randomId() + " Smith")
      , (err, response) ->
        assert.isNull(err)
        assert.equal(response.length(), 0)

        done()

    it "handles responses with a single result", (done) ->
      customerEmail = "sandworm" + customerId + "@example.com"
      customerId = specHelper.randomId()
      expirationMonth = '12'
      expirationYear = '2016'
      expirationDate = expirationMonth + '/' + expirationYear
      name = specHelper.randomId() + ' Smith'
      number = '4111111111111111'
      paymentMethodToken = specHelper.randomId()
      postalCode = '60647'

      customerParams =
        id: customerId
        email: customerEmail
        creditCard:
          token: paymentMethodToken
          cardholderName: name
          number: number
          expirationDate: expirationDate
          billingAddress:
            streetAddress: '123 Fake St'
            extendedAddress: 'Suite 403'
            locality: 'Chicago'
            region: 'IL'
            postalCode: postalCode
            countryName: 'United States of America'
          options:
            verifyCard: true

      specHelper.defaultGateway.customer.create customerParams, (err, response) ->
        specHelper.defaultGateway.creditCardVerification.search (search) ->
          search.billingAddressDetailsPostalCode().is(postalCode)
          search.creditCardCardType().is(CreditCard.CardType.Visa)
          search.creditCardCardholderName().is(name)
          search.creditCardExpirationDate().is(expirationDate)
          search.creditCardNumber().is(number)
          search.customerEmail().is(customerEmail)
          search.customerId().is(customerId)
          search.paymentMethodToken().is(paymentMethodToken)
          search.status().is(CreditCardVerification.StatusType.Verified)

        , (err, response) ->
          assert.equal(response.length(), 1)
          response.first (err, verification) ->
            createdAt = verification.createdAt
            verificationId = verification.id

            assert.equal(verification.billing.postalCode, postalCode)
            assert.equal(verification.creditCard.bin, '411111')
            assert.equal(verification.creditCard.cardholderName, name)
            assert.equal(verification.creditCard.expirationMonth, expirationMonth)
            assert.equal(verification.creditCard.expirationYear, expirationYear)
            assert.equal(verification.creditCard.cardType, CreditCard.CardType.Visa)
            assert.equal(verification.status, CreditCardVerification.StatusType.Verified)

            specHelper.defaultGateway.creditCardVerification.search (search) ->
              search.createdAt().is(createdAt)
              search.id().is(verificationId)
              search.ids().in(verificationId)

            , (err, response) ->
              assert.equal(response.length(), 1)
              response.first (err, verification) ->
                assert.equal(verification.createdAt, createdAt)
                assert.equal(verification.id, verificationId)

                done()

    it "allows stream style interation of results", (done) ->
      name = specHelper.randomId() + ' Smith'
      customerParams =
        creditCard:
          cardholderName: name,
          number: '4000111111111115',
          expirationDate: '12/2016',
          options:
            verifyCard: true

      specHelper.defaultGateway.customer.create customerParams, (err, response) ->
        search = specHelper.defaultGateway.creditCardVerification.search (search) ->
          search.creditCardCardholderName().is(name)

        verifications = []

        search.on 'data', (verification) ->
          verifications.push verification

        search.on 'end', ->
          assert.equal(verifications[0].creditCard.bin, '400011')
          assert.equal(verifications[0].creditCard.cardholderName, name)

          done()

        search.resume()

    it "can return multiple results", (done) ->
      name = specHelper.randomId() + ' Smith'
      creditCardNumber = CreditCardNumbers.CardTypeIndicators.Debit
      expirationDate = '12/2016'
      email = "mike.a@example.com"
      firstCustomerId = specHelper.randomId()
      secondCustomerId = specHelper.randomId()

      customerParams =
        id: firstCustomerId
        email: email
        creditCard:
          cardholderName: name
          number: creditCardNumber
          expirationDate: expirationDate
          options:
            verifyCard: true

      customerParams2 =
        id: secondCustomerId
        email: email
        creditCard:
          cardholderName: name
          number: creditCardNumber
          expirationDate: expirationDate
          options:
            verifyCard: true

      specHelper.defaultGateway.customer.create customerParams, (err, response) ->
        specHelper.defaultGateway.customer.create customerParams2, (err, response) ->
          specHelper.defaultGateway.creditCardVerification.search (search) ->
            search.creditCardCardholderName().is(name)
            search.creditCardNumber().is(creditCardNumber)
            search.creditCardExpirationDate().is(expirationDate)
            search.creditCardCardType().in(CreditCard.CardType.Visa)
            search.customerEmail().is(email)
          , (err, response) ->
            verifications = []

            response.each (err, verification) ->
              verifications.push(verification)
              if verifications.length == 2
                assert.isNull(err)
                assert.notEqual(verifications[0].id, verifications[1].id)
                assert.equal(verifications[0].creditCard.cardholderName, name)
                assert.equal(verifications[1].creditCard.cardholderName, name)

                done()

    it "returns card type indicators", (done) ->
      name = specHelper.randomId() + ' Smith'
      specHelper.defaultGateway.customer.create
        creditCard:
          cardholderName: name,
          number: CreditCardNumbers.CardTypeIndicators.Unknown,
          expirationDate: '05/12',
          options:
            verifyCard: true
      , (err, response) ->
        specHelper.defaultGateway.creditCardVerification.search (search) ->
          search.creditCardCardholderName().is(name)
        , (err, response) ->
          response.first (err, verification) ->
            assert.isNull(err)
            assert.equal(verification.creditCard.cardholderName, name)
            assert.equal(verification.creditCard.prepaid, CreditCard.Prepaid.Unknown)
            assert.equal(verification.creditCard.durbinRegulated, CreditCard.DurbinRegulated.Unknown)
            assert.equal(verification.creditCard.commercial, CreditCard.Commercial.Unknown)
            assert.equal(verification.creditCard.healthcare, CreditCard.Healthcare.Unknown)
            assert.equal(verification.creditCard.debit, CreditCard.Debit.Unknown)
            assert.equal(verification.creditCard.payroll, CreditCard.Payroll.Unknown)
            assert.equal(verification.creditCard.countryOfIssuance, CreditCard.CountryOfIssuance.Unknown)
            assert.equal(verification.creditCard.issuingBank, CreditCard.IssuingBank.Unknown)
            assert.equal(verification.creditCard.productId, CreditCard.ProductId.Unknown)

            done()
