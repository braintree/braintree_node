{AttributeSetter} = require('./attribute_setter')
{ApplePayCard} = require('./apple_pay_card')
{AndroidPayCard} = require('./android_pay_card')
{CreditCard} = require('./credit_card')
{PayPalAccount} = require('./paypal_account')
{CoinbaseAccount} = require('./coinbase_account')
{DisbursementDetails} = require('./disbursement_details')
{Dispute} = require('./dispute')
{FacilitatorDetails} = require('./facilitator_details')
{RiskData} = require('./risk_data')
{ThreeDSecureInfo} = require('./three_d_secure_info')

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
    ApplicationIncomplete : 'application_incomplete'
    Avs : 'avs'
    Cvv : 'cvv'
    AvsAndCvv : 'avs_and_cvv'
    Duplicate : 'duplicate'
    Fraud : 'fraud'
    ThreeDSecure : 'three_d_secure'
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
    SettlementConfirmed: 'settlement_confirmed'
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
    @androidPayCard = new AndroidPayCard(attributes.androidPayCard)
    @disbursementDetails = new DisbursementDetails(attributes.disbursementDetails)
    @disputes = (new Dispute(disputeAttributes) for disputeAttributes in attributes.disputes) if attributes.disputes?
    @facilitatorDetails = new FacilitatorDetails(attributes.facilitatorDetails) if attributes.facilitatorDetails
    @riskData = new RiskData(attributes.riskData) if attributes.riskData
    @threeDSecureInfo = new ThreeDSecureInfo(attributes.threeDSecureInfo) if attributes.threeDSecureInfo

  isDisbursed: ->
    @disbursementDetails.isValid()

exports.Transaction = Transaction
