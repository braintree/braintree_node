{AttributeSetter} = require('./attribute_setter')

class PayPalAccount extends AttributeSetter
  constructor: (attributes) ->
    super attributes

exports.PayPalAccount = PayPalAccount
