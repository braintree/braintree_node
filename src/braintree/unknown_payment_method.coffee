{AttributeSetter} = require('./attribute_setter')

class UnknownPaymentMethod extends AttributeSetter
  constructor: (attributes) ->
    name = (keys for own keys of attributes)[0]
    super attributes[name]

exports.UnknownPaymentMethod = UnknownPaymentMethod
