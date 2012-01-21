{AdvancedSearch} = require('./advanced_search')
{Subscription} = require('./subscription')

class SubscriptionSearch extends AdvancedSearch
  @multipleValueField "inTrialPeriod"
  @multipleValueField "ids"
  @textFields "id", "transactionId"
  @multipleValueOrTextField "planId"
  @multipleValueField "status", { "allows" : Subscription.Status.All() }
  @multipleValueField "merchantAccountId"
  @rangeFields "price", "daysPastDue", "billingCyclesRemaining", "nextBillingDate"

exports.SubscriptionSearch = SubscriptionSearch
