require("../../spec_helper.coffee")
{SubscriptionSearch} = require('../../../lib/braintree/subscription_search')

vows
  .describe("SubscriptionSearch")
  .addBatch
    "text fields":
      "is":
        topic: ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            creditCard:
              number: '5105105105105100'
              expirationDate: '05/12'
          , (err, response) ->
            specHelper.defaultGateway.subscription.create(
              paymentMethodToken: response.customer.creditCards[0].token
              planId: specHelper.plans.trialless.id
            , (err, response) ->
              subscriptionId = response.subscription.id
              specHelper.defaultGateway.subscription.search((search) ->
                search.id().is(subscriptionId)
              , (err, response) ->
                response.first(callback)
              )
            )
          )
          undefined
        "gets a result": (err, subscription) ->
          assert.isObject(subscription)
          assert.equal(subscription.planId, specHelper.plans.trialless.id)
        "does not error": (err, subscription) ->
          assert.isNull(err)

  .export(module)
