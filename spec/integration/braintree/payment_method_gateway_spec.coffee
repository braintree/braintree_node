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

    it "deletes the credit card", (done) ->
      specHelper.paypalMerchantGateway.customer.create {firstName: 'John', lastName: 'Smith'}, (err, response) ->
        customerId = response.customer.id

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
              paymentMethodToken = response.paypalAccount.token

              specHelper.paypalMerchantGateway.paymentMethod.delete paymentMethodToken, (err) ->
                assert.isNull(err)

                specHelper.paypalMerchantGateway.creditCard.find paymentMethodToken, (err, response) ->
                  assert.equal(err.type, braintree.errorTypes.notFoundError)
                  done()
          )
        )

    it "handles invalid tokens"#, (done) ->
      # specHelper.paypalMerchantGateway.creditCard.delete 'nonexistent_token', (err) ->
      #   assert.equal(err.type, braintree.errorTypes.notFoundError)

      #   done()

