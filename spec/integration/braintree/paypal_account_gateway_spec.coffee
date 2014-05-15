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
    customerId = null

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

    it "handles errors", (done) ->
      myHttp = new specHelper.clientApiHttp(new Config(specHelper.paypalMerchantConfig))
      specHelper.paypalMerchantGateway.clientToken.generate({}, (err, result) ->
        clientToken = JSON.parse(result.clientToken)
        authorizationFingerprint = clientToken.authorizationFingerprint

        params =
          authorizationFingerprint: authorizationFingerprint
          paypalAccount:
            consentCode: 'PAYPAL_CONSENT_CODE'

        myHttp.post("/client_api/v1/payment_methods/paypal_accounts.json", params, (statusCode, body) ->
          nonce = JSON.parse(body).paypalAccounts[0].nonce
          paypalAccountParams =
            customerId: customerId
            paymentMethodNonce: nonce

          specHelper.paypalMerchantGateway.paymentMethod.create paypalAccountParams, (err, response) ->
            newPaymentMethodToken = response.paypalAccount.token

            updateParams =
              token: 'PAYPAL_ACCOUNT'

            specHelper.paypalMerchantGateway.paypalAccount.update newPaymentMethodToken, updateParams, (err, response) ->
              assert.isFalse(response.success)
              assert.equal(
                response.errors.for('paypalAccount').on('token')[0].code,
                '92906'
              )

              done()
        )
      )

  describe "delete", (done) ->
    paymentMethodToken = null

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

    it "deletes the paypal account", (done) ->
      specHelper.paypalMerchantGateway.paypalAccount.delete paymentMethodToken, (err) ->
        assert.isNull(err)

        specHelper.paypalMerchantGateway.paypalAccount.find paymentMethodToken, (err, response) ->
          assert.equal(err.type, braintree.errorTypes.notFoundError)
          done()

    it "handles invalid tokens", (done) ->
      specHelper.paypalMerchantGateway.paypalAccount.delete 'NON_EXISTENT_TOKEN', (err) ->
        assert.equal(err.type, braintree.errorTypes.notFoundError)

        done()

