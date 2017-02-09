require('../../spec_helper')
{PaymentMethodGateway} = require('../../../lib/braintree/payment_method_gateway')
{errorTypes} = require('../../../lib/braintree/error_types')

describe "PaymentMethodGateway", ->
  describe "find", ->
    it 'handles unknown payment methods', (done) ->
      response =
        unknownPaymentMethod:
          token: 1234
          default: true
          key: 'value'

      paymentMethod = PaymentMethodGateway.parsePaymentMethod(response)

      assert.equal(paymentMethod.token, 1234)
      assert.isTrue(paymentMethod.default)

      done()

  describe "delete", ->
    fakeGateway =
      config:
        baseMerchantPath: ->
          ""
      http:
        delete: (url, callback) ->
          callback(url)

    it 'accepts revokeAllGrants option with value true', (done) ->
      paymentMethodGateway = new PaymentMethodGateway(fakeGateway)
      expectedURL = "/payment_methods/any/some_token?revoke_all_grants=true"
      deleteOptions = { 'revokeAllGrants':'true' }
      assertRequestUrl = (url) ->
        assert.equal(expectedURL, url)

      paymentMethodGateway.delete("some_token", deleteOptions, assertRequestUrl)
      done()

    it 'accepts revokeAllGrants option with value false', (done) ->
      paymentMethodGateway = new PaymentMethodGateway(fakeGateway)
      expectedURL = "/payment_methods/any/some_token?revoke_all_grants=false"
      deleteOptions = { 'revokeAllGrants':'false' }
      assertRequestUrl = (url) ->
        assert.equal(expectedURL, url)

      paymentMethodGateway.delete("some_token", deleteOptions, assertRequestUrl)
      done()

    it 'accepts just the token, revokeAllGrants is optional', (done) ->
      paymentMethodGateway = new PaymentMethodGateway(fakeGateway)
      expectedURL = "/payment_methods/any/some_token"
      assertRequestUrl = (url) ->
        assert.equal(expectedURL, url)

      paymentMethodGateway.delete("some_token", assertRequestUrl)
      done()

    it 'calls callback with error if keys are invalid', (done) ->
      paymentMethodGateway = new PaymentMethodGateway(fakeGateway)
      deleteOptions = { 'invalid_key':'true' }

      paymentMethodGateway.delete("some_token", deleteOptions, (err) ->
        assert.instanceOf(err, Error)
        assert.equal(err.type, errorTypes.invalidKeysError)
        assert.equal(err.message, 'These keys are invalid: invalid_key')
        done()
      )
