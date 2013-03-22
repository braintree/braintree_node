{AttributeSetter} = require('./attribute_setter')
{CreditCard} = require('./credit_card')

class Transaction extends AttributeSetter
  @CreatedUsing =
    FullInformation : 'full_information'
    Token : 'token'
  @Source =
    Api : 'api'
    ControlPanel : 'control_panel'
    Recurring : 'recurring'
  @Type =
    Credit : 'credit'
    Sale : 'sale'
    All: ->
      all = []
      for key, value of @
        all.push value if key isnt 'All'
      all
  @Status =
    AuthorizationExpired : 'authorization_expired'
    Authorizing : 'authorizing'
    Authorized : 'authorized'
    GatewayRejected : 'gateway_rejected'
    Failed : 'failed'
    ProcessorDeclined : 'processor_declined'
    Settled : 'settled'
    Settling : 'settling'
    SubmittedForSettlement : 'submitted_for_settlement'
    Voided : 'voided'
    All: ->
      all = []
      for key, value of @
        all.push value if key isnt 'All'
      all

  constructor: (attributes) ->
    super attributes
    @creditCard = new CreditCard(attributes.creditCard)

exports.Transaction = Transaction
