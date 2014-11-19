{AttributeSetter} = require('./attribute_setter')
{RiskData} = require('./risk_data')

class CreditCardVerification extends AttributeSetter
  constructor: (attributes) ->
    super attributes
    @riskData = new RiskData(attributes.riskData) if attributes.riskData

exports.CreditCardVerification = CreditCardVerification
