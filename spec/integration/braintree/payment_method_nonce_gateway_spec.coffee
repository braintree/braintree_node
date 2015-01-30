require('../../spec_helper')
_ = require('underscore')._
braintree = specHelper.braintree
util = require('util')
{Config} = require('../../../lib/braintree/config')
{Nonces} = require('../../../lib/braintree/test/nonces')

describe "PaymentMethodNonceGateway", ->
  paymentMethodToken = null

  before (done) ->
    specHelper.defaultGateway.customer.create {firstName: 'John', lastName: 'Smith'}, (err, response) ->
      customerId = response.customer.id
      paymentMethodToken = specHelper.randomId()

      specHelper.defaultGateway.clientToken.generate {}, (err, result) ->
        clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken))
        authorizationFingerprint = clientToken.authorizationFingerprint
        params =
          authorizationFingerprint: authorizationFingerprint
          creditCard:
            token: paymentMethodToken
            number: '4111111111111111'
            expirationDate: '01/2020'

        myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))
        myHttp.post "/client_api/v1/payment_methods/credit_cards.json", params, (statusCode, body) ->
          nonce = JSON.parse(body).creditCards[0].nonce
          paymentMethodParams =
            customerId: customerId
            paymentMethodNonce: nonce
          specHelper.defaultGateway.paymentMethod.create paymentMethodParams, (err, creditCard) ->
            done()

  describe "create", ->
    it 'creates the nonce', (done) ->
      specHelper.defaultGateway.paymentMethodNonce.create paymentMethodToken, (err, paymentMethodNonce) ->
        assert.isNull(err)
        assert.isNotNull(paymentMethodNonce.nonce);

        done()

    it "returns an error if unable to find the payment_method", (done) ->
      specHelper.defaultGateway.paymentMethodNonce.create 'not-a-token-at-all', (err, nonce) ->
        assert.equal(err.type, braintree.errorTypes.notFoundError)

        done()
