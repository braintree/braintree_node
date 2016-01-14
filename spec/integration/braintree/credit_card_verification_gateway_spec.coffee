require('../../spec_helper')
{CreditCardVerification} = require('../../../lib/braintree/credit_card_verification')
{CreditCardNumbers} = require('../../../lib/braintree/test/credit_card_numbers')
{ValidationErrorCodes} = require('../../../lib/braintree/validation_error_codes')
braintree = specHelper.braintree

describe "CreditCardVerificationGateway", ->
  describe "find", ->
    it "finds a verification", (done) ->
      customerParams =
        creditCard:
          cardholderName: "John Smith"
          number: '4000111111111115'
          expirationDate: '05/2014'
          options:
            verifyCard: true

      specHelper.defaultGateway.customer.create customerParams, (err, response) ->
        specHelper.defaultGateway.creditCardVerification.find response.verification.id, (err, verification) ->
          assert.isNull(err)
          assert.equal(verification.creditCard.cardholderName, 'John Smith')

          done()

    it "handles not finding a verification", (done) ->
      specHelper.defaultGateway.creditCardVerification.find 'nonexistent_verification', (err, verification) ->
        assert.equal(err.type, braintree.errorTypes.notFoundError)

        done()

    it "handles whitespace ids", (done) ->
      specHelper.defaultGateway.creditCardVerification.find ' ', (err, verification) ->
        assert.equal(err.type, braintree.errorTypes.notFoundError)

        done()

  describe "create", ->
    it "handles verified verifications", (done) ->
      params =
        creditCard:
          cardholderName: "John Smith"
          number: '4111111111111111'
          expirationDate: '05/2014'

      specHelper.defaultGateway.creditCardVerification.create params, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)

        done()

    it "handles processor declined verifications", (done) ->
      params =
        creditCard:
          cardholderName: "John Smith"
          number: '4000111111111115'
          expirationDate: '05/2014'

      specHelper.defaultGateway.creditCardVerification.create params, (err, response) ->
        assert.isFalse(response.success)

        done()

    it "handles validation errors", (done) ->
      params =
        creditCard:
          cardholderName: "John Smith"
          number: '4111111111111111'
          expirationDate: '05/2014'
        options:
          amount: "-10.00"

      specHelper.defaultGateway.creditCardVerification.create params, (err, response) ->
        assert.equal(
          response.errors.for("verification").for("options").on("amount")[0].code
          ValidationErrorCodes.Verification.Options.AmountCannotBeNegative
        )

        done()
