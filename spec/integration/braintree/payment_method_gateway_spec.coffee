require('../../spec_helper')
_ = require('underscore')._
braintree = specHelper.braintree
util = require('util')
{Config} = require('../../../lib/braintree/config')

describe "PaymentMethodGateway", ->
  describe "create", ->
    customerId = null

    before (done) ->
      specHelper.paypalMerchantGateway.customer.create {firstName: 'John', lastName: 'Smith'}, (err, response) ->
        customerId = response.customer.id
        done()

    it "creates a paypal account from a payment method nonce", (done) ->
      myHttp = new specHelper.clientApiHttp(new Config(specHelper.paypalMerchantConfig))
      specHelper.paypalMerchantGateway.clientToken.generate({}, (err, result) ->
        clientToken = JSON.parse(result.clientToken)
        authorizationFingerprint = clientToken.authorizationFingerprint

        params = {
          authorizationFingerprint: authorizationFingerprint,
          paypalAccount: {
            consentCode: 'PAYPAL_CONSENT_CODE'
          }
        }

        myHttp.post("/client_api/v1/payment_methods/paypal_accounts.json", params, (statusCode, body) ->
          nonce = JSON.parse(body).paypalAccounts[0].nonce
          paypalAccountParams =
            customerId: customerId
            paymentMethodNonce: nonce

          specHelper.paypalMerchantGateway.paymentMethod.create paypalAccountParams, (err, response) ->
            assert.isNull(err)
            assert.isTrue(response.success)
            assert.isNotNull(response.paypalAccount.email)

            done()
        )
      )

    it "handles errors", (done) ->
      myHttp = new specHelper.clientApiHttp(new Config(specHelper.paypalMerchantConfig))
      specHelper.paypalMerchantGateway.clientToken.generate({}, (err, result) ->
        clientToken = JSON.parse(result.clientToken)
        authorizationFingerprint = clientToken.authorizationFingerprint

        params = {
          authorizationFingerprint: authorizationFingerprint,
          paypalAccount: {}
        }

        myHttp.post("/client_api/v1/payment_methods/paypal_accounts.json", params, (statusCode, body) ->
          nonce = JSON.parse(body).paypalAccounts[0].nonce
          paypalAccountParams =
            customerId: customerId
            paymentMethodNonce: nonce

          specHelper.paypalMerchantGateway.paymentMethod.create paypalAccountParams, (err, response) ->
            assert.isFalse(response.success)
            assert.equal(
              response.errors.for('paypalAccount').on('base')[0].code,
              '82902'
            )

            done()
        )
      )

  describe "find", ->
    it "finds the card", (done) ->
      specHelper.paypalMerchantGateway.paymentMethod.find 'PAYPAL_ACCOUNT', (err, paypalAccount) ->
        assert.isNull(err)
        assert.isNotNull(paypalAccount.email)

        done()

    it "handles not finding the card", (done) ->
      specHelper.paypalMerchantGateway.paymentMethod.find 'NONEXISTENT_PAYPAL_ACCOUNT', (err, paypalAccount) ->
        assert.equal(err.type, braintree.errorTypes.notFoundError)

        done()

    it "handles whitespace", (done) ->
      specHelper.paypalMerchantGateway.paymentMethod.find ' ', (err, paypalAccount) ->
        assert.equal(err.type, braintree.errorTypes.notFoundError)

        done()

  describe "update", ->
    # creditCardToken = null
    # before (done) ->
    #   customerParams =
    #     creditCard:
    #       cardholderName: 'Old Cardholder Name',
    #       number: '5105105105105100',
    #       expirationDate: '05/2014'
    #       billingAddress:
    #         streetAddress: '123 Old St',
    #         locality: 'Old City',
    #         region: 'Old Region'

    #   specHelper.paypalMerchantGateway.customer.create customerParams, (err, response) ->
    #     creditCardToken = response.customer.creditCards[0].token
    #     done()

    it "updates the card"#, (done) ->
      # updateParams =
      #   cardholderName: 'New Cardholder Name',
      #   number: '4111111111111111',
      #   expirationDate: '12/2015'

      # specHelper.paypalMerchantGateway.creditCard.update creditCardToken, updateParams, (err, response) ->
      #   assert.isNull(err)
      #   assert.isTrue(response.success)
      #   assert.equal(response.creditCard.cardholderName, 'New Cardholder Name')
      #   assert.equal(response.creditCard.maskedNumber, '411111******1111')
      #   assert.equal(response.creditCard.expirationDate, '12/2015')

      #   done()

    it "handles errors"#, (done) ->
      # updateParams =
      #   number: 'invalid'

      # specHelper.paypalMerchantGateway.creditCard.update creditCardToken, updateParams, (err, response) ->
      #   assert.isFalse(response.success)
      #   assert.equal(response.message, 'Credit card number must be 12-19 digits.')
      #   assert.equal(
      #     response.errors.for('creditCard').on('number')[0].code,
      #     '81716'
      #   )
      #   assert.equal(
      #     response.errors.for('creditCard').on('number')[0].attribute,
      #     'number'
      #   )
      #   errorCodes = (error.code for error in response.errors.deepErrors())
      #   assert.equal(1, errorCodes.length)
      #   assert.include(errorCodes, '81716')

      #   done()

  describe "delete", (done) ->
    # customerToken = null

    # before (done) ->
    #   customerParams =
    #     creditCard:
    #       number: '5105105105105100',
    #       expirationDate: '05/2014'

    #   specHelper.paypalMerchantGateway.customer.create customerParams, (err, response) ->
    #     customerToken = response.customer.creditCards[0].token
    #     done()

    it "deletes the credit card"#, (done) ->
      # specHelper.paypalMerchantGateway.creditCard.delete customerToken, (err) ->
      #   assert.isNull(err)

      #   specHelper.paypalMerchantGateway.creditCard.find customerToken, (err, response) ->
      #     assert.equal(err.type, braintree.errorTypes.notFoundError)
      #     done()

    it "handles invalid tokens"#, (done) ->
      # specHelper.paypalMerchantGateway.creditCard.delete 'nonexistent_token', (err) ->
      #   assert.equal(err.type, braintree.errorTypes.notFoundError)

      #   done()

