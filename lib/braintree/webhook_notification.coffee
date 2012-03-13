{AttributeSetter} = require('./attribute_setter')
{Subscription} = require('./subscription')

class WebhookNotification extends AttributeSetter
  @Kind =
    SubscriptionPastDue: 'subscription_past_due'

  constructor: (attributes) ->
    super attributes
    @subscription = new Subscription(attributes.subject.subscription)

exports.WebhookNotification = WebhookNotification
