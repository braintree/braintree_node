{AttributeSetter} = require('./attribute_setter')
{RiskData} = require('./risk_data')

class CreditCardVerification extends AttributeSetter
  @StatusType =
    Failed : "failed"
    GatewayRejected : "gateway_rejected"
    ProcessorDeclined : "processor_declined"
    Verified : "verified"
    All : ->
      all = []
      for key, value of @
        all.push value if key isnt 'All'
      all

  constructor: (attributes) ->
    super attributes
    @riskData = new RiskData(attributes.riskData) if attributes.riskData

exports.CreditCardVerification = CreditCardVerification
