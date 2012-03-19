{AttributeSetter} = require('./attribute_setter')
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

  constructor: (attributes) ->
    super attributes
    @subscription = new Subscription(attributes.subject.subscription)

exports.WebhookNotification = WebhookNotification
