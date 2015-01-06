{AttributeSetter} = require('./attribute_setter')
{ApplePayCard} = require('./apple_pay_card')
{CreditCard} = require('./credit_card')
{PayPalAccount} = require('./paypal_account')
{CoinbaseAccount} = require('./coinbase_account')
{DisbursementDetails} = require('./disbursement_details')
{Dispute} = require('./dispute')
{RiskData} = require('./risk_data')

class Transaction extends AttributeSetter
  @CreatedUsing =
    FullInformation : 'full_information'
    Token : 'token'
  @EscrowStatus =
    HoldPending : 'hold_pending'
    Held : 'held'
    ReleasePending : 'release_pending'
    Released : 'released'
    Refunded : 'refunded'
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
  @GatewayRejectionReason =
    Avs : 'avs'
    Cvv : 'cvv'
    AvsAndCvv : 'avs_and_cvv'
    Duplicate : 'duplicate'
    Fraud : 'fraud'
  @IndustryData =
    Lodging : 'lodging'
    TravelAndCruise : 'travel_cruise'
  @Status =
    AuthorizationExpired : 'authorization_expired'
    Authorizing : 'authorizing'
    Authorized : 'authorized'
    GatewayRejected : 'gateway_rejected'
    Failed : 'failed'
    ProcessorDeclined : 'processor_declined'
    Settled : 'settled'
    Settling : 'settling'
    SettlementDeclined: 'settlement_declined'
    SettlementPending: 'settlement_pending'
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
    @paypalAccount = new PayPalAccount(attributes.paypal)
    @coinbaseAccount = new CoinbaseAccount(attributes.coinbaseAccount)
    @applePayCard = new ApplePayCard(attributes.applePay)
    @disbursementDetails = new DisbursementDetails(attributes.disbursementDetails)
    @disputes = (new Dispute(disputeAttributes) for disputeAttributes in attributes.disputes) if attributes.disputes?
    @riskData = new RiskData(attributes.riskData) if attributes.riskData

  isDisbursed: ->
    @disbursementDetails.isValid()

exports.Transaction = Transaction
