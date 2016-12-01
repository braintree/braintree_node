require('../../spec_helper')
_ = require('underscore')._
braintree = specHelper.braintree
util = require('util')
{Config} = require('../../../lib/braintree/config')
{Nonces} = require('../../../lib/braintree/test/nonces')

describe "PaymentMethodNonceGateway", ->
  paymentMethodToken = null

  before (done) ->
    specHelper.defaultGateway.customer.create {}, (err, response) ->
      customerId = response.customer.id
      nonceParams =
        creditCard:
          number: '4111111111111111'
          expirationMonth: '05'
          expirationYear: '2009'

      specHelper.generateNonceForNewPaymentMethod nonceParams, customerId, (nonce) ->
        paymentMethodParams =
          customerId: customerId
          paymentMethodNonce: nonce
        specHelper.defaultGateway.paymentMethod.create paymentMethodParams, (err, response) ->
          paymentMethodToken = response.paymentMethod.token
          done()

  describe "create", ->
    it 'creates the nonce', (done) ->
      specHelper.defaultGateway.paymentMethodNonce.create paymentMethodToken, (err, response) ->
        paymentMethodNonce = response.paymentMethodNonce
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.isNotNull(paymentMethodNonce.nonce)
        assert.isString(paymentMethodNonce.type)

        done()

    it "returns an error if unable to find the payment_method", (done) ->
      specHelper.defaultGateway.paymentMethodNonce.create 'not-a-token-at-all', (err, response) ->
        assert.equal(err.type, braintree.errorTypes.notFoundError)

        done()

  describe "find", ->
    it 'find the nonce', (done) ->
      nonceParams =
        creditCard:
          number: '4111111111111111'
          expirationMonth: '05'
          expirationYear: '2020'

      specHelper.generate3DSNonce nonceParams, (nonce) ->
        assert.isNotNull(nonce)

        specHelper.defaultGateway.paymentMethodNonce.find nonce, (err, paymentMethodNonce) ->
          assert.isNull(err)
          info = paymentMethodNonce.threeDSecureInfo
          assert.equal(paymentMethodNonce.nonce, nonce)
          assert.isTrue(info.liabilityShifted)
          assert.isTrue(info.liabilityShiftPossible)
          assert.equal(info.enrolled, "Y")
          assert.equal(info.status, "authenticate_successful")

          done()

    it "returns undefined threeDSecureInfo if there's none present", (done) ->
      specHelper.defaultGateway.customer.create {}, (err, response) ->
        customerId = response.customer.id
        nonceParams =
          creditCard:
            number: '4111111111111111'
            expirationMonth: '05'
            expirationYear: '2009'

        specHelper.generateNonceForNewPaymentMethod nonceParams, customerId, (nonce) ->
          specHelper.defaultGateway.paymentMethodNonce.find nonce, (err, paymentMethodNonce) ->
            assert.isNull(err)
            assert.isNull(paymentMethodNonce.threeDSecureInfo)
            done()


    it "returns an error if unable to find the payment_method", (done) ->
      specHelper.defaultGateway.paymentMethodNonce.find 'not-a-nonce-at-all', (err, nonce) ->
        assert.equal(err.type, braintree.errorTypes.notFoundError)

        done()
