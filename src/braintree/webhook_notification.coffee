{AttributeSetter} = require('./attribute_setter')
{MerchantAccount} = require('./merchant_account')
{Transaction} = require('./transaction')
{Disbursement} = require('./disbursement')
{Dispute} = require('./dispute')
{PartnerMerchant} = require('./partner_merchant')
{Subscription} = require('./subscription')
{ValidationErrorsCollection} = require('./validation_errors_collection')

class WebhookNotification extends AttributeSetter
  @Kind =
    Check: "check"
    Disbursement: "disbursement"
    DisbursementException: "disbursement_exception"
    DisputeOpened: "dispute_opened"
    DisputeLost: "dispute_lost"
    DisputeWon: "dispute_won"
    PartnerMerchantConnected: "partner_merchant_connected"
    PartnerMerchantDisconnected: "partner_merchant_disconnected"
    PartnerMerchantDeclined: "partner_merchant_declined"
    SubscriptionCanceled: "subscription_canceled"
    SubscriptionChargedSuccessfully: "subscription_charged_successfully"
    SubscriptionChargedUnsuccessfully: "subscription_charged_unsuccessfully"
    SubscriptionExpired: "subscription_expired"
    SubscriptionTrialEnded: "subscription_trial_ended"
    SubscriptionWentActive: "subscription_went_active"
    SubscriptionWentPastDue: "subscription_went_past_due"
    SubMerchantAccountApproved: "sub_merchant_account_approved"
    SubMerchantAccountDeclined: "sub_merchant_account_declined"
    TransactionDisbursed: "transaction_disbursed"

  constructor: (attributes) ->
    super attributes

    if attributes.subject.apiErrorResponse?
      wrapper_node = attributes.subject.apiErrorResponse
    else
      wrapper_node = attributes.subject

    if wrapper_node.subscription?
      @subscription = new Subscription(wrapper_node.subscription)

    if wrapper_node.merchantAccount?
      @merchantAccount = new MerchantAccount(wrapper_node.merchantAccount)

    if wrapper_node.disbursement?
      @disbursement= new Disbursement(wrapper_node.disbursement)

    if wrapper_node.transaction?
      @transaction = new Transaction(wrapper_node.transaction)

    if wrapper_node.partnerMerchant?
      @partnerMerchant = new PartnerMerchant(wrapper_node.partnerMerchant)

    if wrapper_node.dispute?
      @dispute= new Dispute(wrapper_node.dispute)


    if wrapper_node.errors?
      @errors = new ValidationErrorsCollection(wrapper_node.errors)
      @message = wrapper_node.message

exports.WebhookNotification = WebhookNotification
