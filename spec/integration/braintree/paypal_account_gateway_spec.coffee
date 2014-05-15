require('../../spec_helper')
_ = require('underscore')._
braintree = specHelper.braintree
util = require('util')
{PayPalAccount} = require('../../../lib/braintree/paypal_account')
{Config} = require('../../../lib/braintree/config')

describe "PayPalGatewayGateway", ->
  describe "find", ->
    it "finds the paypal account", (done) ->
      specHelper.paypalMerchantGateway.paypalAccount.find 'PAYPAL_ACCOUNT', (err, paypalAccount) ->
        assert.isNull(err)
        assert.isNotNull(paypalAccount.email)

        done()

    it "handles not finding the paypal account", (done) ->
      specHelper.defaultGateway.paypalAccount.find 'NONEXISTENT_TOKEN', (err, creditCard) ->
        assert.equal(err.type, braintree.errorTypes.notFoundError)

        done()

    it "handles whitespace", (done) ->
      specHelper.defaultGateway.paypalAccount.find ' ', (err, creditCard) ->
        assert.equal(err.type, braintree.errorTypes.notFoundError)

        done()

  describe "update", ->
    paymentMethodToken = Math.floor(Math.random() * Math.pow(36,3)).toString(36)

    before (done) ->
      specHelper.paypalMerchantGateway.customer.create {firstName: 'Jane', lastName: 'Doe'}, (err, response) ->
        customerId = response.customer.id

        myHttp = new specHelper.clientApiHttp(new Config(specHelper.paypalMerchantConfig))
        specHelper.paypalMerchantGateway.clientToken.generate({}, (err, result) ->
          clientToken = JSON.parse(result.clientToken)
          authorizationFingerprint = clientToken.authorizationFingerprint

          params = {
            authorizationFingerprint: authorizationFingerprint,
            paypalAccount: {
              consentCode: 'PAYPAL_CONSENT_CODE'
              token: paymentMethodToken
            }
          }

          myHttp.post("/client_api/v1/payment_methods/paypal_accounts.json", params, (statusCode, body) ->
            nonce = JSON.parse(body).paypalAccounts[0].nonce
            paypalAccountParams =
              customerId: customerId
              paymentMethodNonce: nonce

            specHelper.paypalMerchantGateway.paymentMethod.create paypalAccountParams, (err, response) ->
              paymentMethodToken = response.paypalAccount.token

              done()
          )
        )

    it "updates the paypal account", (done) ->
      updateParams =
        token: paymentMethodToken+'123'

      specHelper.paypalMerchantGateway.paypalAccount.update paymentMethodToken, updateParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.equal(response.paypalAccount.token, paymentMethodToken+'123')

        specHelper.paypalMerchantGateway.paypalAccount.find paymentMethodToken, (err, response) ->
          assert.equal(err.type, braintree.errorTypes.notFoundError)

          done()

    it "handles errors"#, (done) ->
      # updateParams =
      #   number: 'invalid'

      # specHelper.defaultGateway.creditCard.update creditCardToken, updateParams, (err, response) ->
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
    customerToken = null

    # before (done) ->
      # customerParams =
      #   creditCard:
      #     number: '5105105105105100',
      #     expirationDate: '05/2014'

      # specHelper.defaultGateway.customer.create customerParams, (err, response) ->
      #   customerToken = response.customer.creditCards[0].token
      #   done()

    it "deletes the credit card"#, (done) ->
      # specHelper.defaultGateway.creditCard.delete customerToken, (err) ->
      #   assert.isNull(err)

      #   specHelper.defaultGateway.creditCard.find customerToken, (err, response) ->
      #     assert.equal(err.type, braintree.errorTypes.notFoundError)
      #     done()

    it "handles invalid tokens"#, (done) ->
      # specHelper.defaultGateway.creditCard.delete 'nonexistent_token', (err) ->
      #   assert.equal(err.type, braintree.errorTypes.notFoundError)

      #   done()

