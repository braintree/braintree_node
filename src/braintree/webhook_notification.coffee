{AttributeSetter} = require('./attribute_setter')
{MerchantAccount} = require('./merchant_account')
{Transaction} = require('./transaction')
{PartnerUser} = require('./partner_user')
{Subscription} = require('./subscription')
{ValidationErrorsCollection} = require('./validation_errors_collection')

class WebhookNotification extends AttributeSetter
  @Kind =
    PartnerUserCreated: "partner_user_created"
    PartnerUserDeleted: "partner_user_deleted"
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

    if wrapper_node.transaction?
      @transaction = new Transaction(wrapper_node.transaction)

    if wrapper_node.partnerUser?
      @partnerUser = new PartnerUser(wrapper_node.partnerUser)

    if wrapper_node.errors?
      @errors = new ValidationErrorsCollection(wrapper_node.errors)
      @message = wrapper_node.message

exports.WebhookNotification = WebhookNotification
