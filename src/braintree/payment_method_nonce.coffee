{AttributeSetter} = require('./attribute_setter')
{ThreeDSecureInfo} = require('./three_d_secure_info')

class PaymentMethodNonce extends AttributeSetter
  constructor: (attributes) ->
    super attributes
    @threeDSecureInfo = new ThreeDSecureInfo(attributes.threeDSecureInfo) if attributes.threeDSecureInfo

exports.PaymentMethodNonce = PaymentMethodNonce
