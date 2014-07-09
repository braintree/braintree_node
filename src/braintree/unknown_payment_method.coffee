{AttributeSetter} = require('./attribute_setter')

class UnknownPaymentMethod extends AttributeSetter
  constructor: (attributes) ->
    name = (keys for own keys of attributes)[0]
    attributes[name].imageUrl = "https://assets.braintreegateway.com/payment_method_logo/unknown.png"
    super attributes[name]

exports.UnknownPaymentMethod = UnknownPaymentMethod
