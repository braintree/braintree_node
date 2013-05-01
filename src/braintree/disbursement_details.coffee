{AttributeSetter} = require('./attribute_setter')

class DisbursementDetails extends AttributeSetter
  isValid: ->
    @disbursementDate?

exports.DisbursementDetails = DisbursementDetails
