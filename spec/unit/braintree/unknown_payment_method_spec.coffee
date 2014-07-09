require('../../spec_helper')
{UnknownPaymentMethod} = require('../../../lib/braintree/unknown_payment_method')

describe "UnknownPaymentMethod", ->
  describe "imageUrl", ->
    it "returns the correct image url", ->
      response =
        unknownPaymentMethod:
          token: 1234
          default: true
          key: 'value'
          imageUrl: 'http://www.some.other.image.com'

      unknownPaymentMethod = new UnknownPaymentMethod(response)

      assert.equal(unknownPaymentMethod.token, 1234)
      assert.isTrue(unknownPaymentMethod.default)
      assert.equal(
        unknownPaymentMethod.imageUrl,
        "https://assets.braintreegateway.com/payment_method_logo/unknown.png"
      )
