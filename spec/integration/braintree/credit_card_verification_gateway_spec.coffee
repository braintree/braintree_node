require('../../spec_helper')
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
