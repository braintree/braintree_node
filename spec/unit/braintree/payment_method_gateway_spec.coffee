require('../../spec_helper')
{PaymentMethodGateway} = require('../../../lib/braintree/payment_method_gateway')

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

