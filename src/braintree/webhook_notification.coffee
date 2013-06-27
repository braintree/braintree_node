{AttributeSetter} = require('./attribute_setter')
{MerchantAccount} = require('./merchant_account')
{Subscription} = require('./subscription')

class WebhookNotification extends AttributeSetter
  @Kind =
    SubscriptionCanceled: "subscription_canceled"
    SubscriptionChargedSuccessfully: "subscription_charged_successfully"
    SubscriptionChargedUnsuccessfully: "subscription_charged_unsuccessfully"
    SubscriptionExpired: "subscription_expired"
    SubscriptionTrialEnded: "subscription_trial_ended"
    SubscriptionWentActive: "subscription_went_active"
    SubscriptionWentPastDue: "subscription_went_past_due"
    MerchantAccountApproved: "merchant_account_approved"
    MerchantAccountDeclined: "merchant_account_declined"

  constructor: (attributes) ->
    super attributes

    if attributes.subject.subscription?
      @subscription = new Subscription(attributes.subject.subscription)

    if attributes.subject.merchantAccount?
      @merchantAccount = new MerchantAccount(attributes.subject.merchantAccount)

exports.WebhookNotification = WebhookNotification
