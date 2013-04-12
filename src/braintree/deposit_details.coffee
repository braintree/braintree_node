{AttributeSetter} = require('./attribute_setter')

class DepositDetails extends AttributeSetter
  isValid: ->
    @depositDate?

exports.DepositDetails = DepositDetails
