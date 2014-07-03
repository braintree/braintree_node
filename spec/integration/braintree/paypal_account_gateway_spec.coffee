require('../../spec_helper')
_ = require('underscore')._
braintree = specHelper.braintree
util = require('util')
{PayPalAccount} = require('../../../lib/braintree/paypal_account')
{Config} = require('../../../lib/braintree/config')
{Nonces} = require('../../../lib/braintree/test/nonces')

describe "PayPalGateway", ->
  describe "find", ->
    it "finds the paypal account", (done) ->
      specHelper.defaultGateway.customer.create {}, (err, response) ->
        paymentMethodParams =
          customerId: response.customer.id
          paymentMethodNonce: Nonces.PayPalFuturePayment

        specHelper.defaultGateway.paymentMethod.create paymentMethodParams, (err, response) ->
          paymentMethodToken = response.paymentMethod.token
          specHelper.defaultGateway.paypalAccount.find paymentMethodToken, (err, paypalAccount) ->
            assert.isNull(err)
            assert.isString(paypalAccount.email)
            assert.isString(paypalAccount.imageUrl)

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
    paymentMethodToken = null
    customerId = null

    beforeEach (done) ->
      paymentMethodToken = Math.floor(Math.random() * Math.pow(36,3)).toString(36)

      specHelper.defaultGateway.customer.create {firstName: 'Jane', lastName: 'Doe'}, (err, response) ->
        customerId = response.customer.id

        myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))
        specHelper.defaultGateway.clientToken.generate({}, (err, result) ->
          clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken))
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

            specHelper.defaultGateway.paymentMethod.create paypalAccountParams, (err, response) ->
              paymentMethodToken = response.paymentMethod.token

              done()
          )
        )

    it "updates the paypal account", (done) ->
      updateParams =
        token: paymentMethodToken+'123'

      specHelper.defaultGateway.paypalAccount.update paymentMethodToken, updateParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.equal(response.paypalAccount.token, paymentMethodToken+'123')

        specHelper.defaultGateway.paypalAccount.find paymentMethodToken, (err, response) ->
          assert.equal(err.type, braintree.errorTypes.notFoundError)

          done()

    it "updates and makes an account the default", (done) ->
      creditCardParams =
        customerId: customerId
        number: '5105105105105100'
        expirationDate: '05/2012'
        options:
          makeDefault: true

      specHelper.defaultGateway.creditCard.create creditCardParams, (err, response) ->
        assert.isTrue(response.success)
        assert.isTrue(response.creditCard.default)

        updateParams =
          token: paymentMethodToken
          options:
            makeDefault: true

        specHelper.defaultGateway.paypalAccount.update paymentMethodToken, updateParams, (err, response) ->
          assert.isTrue(response.success)
          assert.isTrue(response.paypalAccount.default)
          done()

    it "handles errors", (done) ->
      paypalAccountParams =
        customerId: customerId
        paymentMethodNonce: Nonces.PayPalFuturePayment

      specHelper.defaultGateway.paymentMethod.create paypalAccountParams, (err, response) ->
        assert.isTrue(response.success)
        originalToken = response.paymentMethod.token

        specHelper.defaultGateway.paymentMethod.create paypalAccountParams, (err, response) ->
          newPaymentMethodToken = response.paymentMethod.token

          updateParams =
            token: originalToken

          specHelper.defaultGateway.paypalAccount.update newPaymentMethodToken, updateParams, (err, response) ->
            assert.isFalse(response.success)
            assert.equal(
              response.errors.for('paypalAccount').on('token')[0].code,
              '92906'
            )

            done()

  describe "delete", (done) ->
    paymentMethodToken = null

    before (done) ->
      specHelper.defaultGateway.customer.create {firstName: 'Jane', lastName: 'Doe'}, (err, response) ->
        customerId = response.customer.id

        myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))
        specHelper.defaultGateway.clientToken.generate({}, (err, result) ->
          clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken))
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

            specHelper.defaultGateway.paymentMethod.create paypalAccountParams, (err, response) ->
              paymentMethodToken = response.paymentMethod.token

              done()
          )
        )

    it "deletes the paypal account", (done) ->
      specHelper.defaultGateway.paypalAccount.delete paymentMethodToken, (err) ->
        assert.isNull(err)

        specHelper.defaultGateway.paypalAccount.find paymentMethodToken, (err, response) ->
          assert.equal(err.type, braintree.errorTypes.notFoundError)
          done()

    it "handles invalid tokens", (done) ->
      specHelper.defaultGateway.paypalAccount.delete 'NON_EXISTENT_TOKEN', (err) ->
        assert.equal(err.type, braintree.errorTypes.notFoundError)

        done()

