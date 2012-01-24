require("../../spec_helper.coffee")
{SubscriptionSearch} = require('../../../lib/braintree/subscription_search')

vows
  .describe("SubscriptionSearch")
  .addBatch
    "field":
      topic: ->
        specHelper.defaultGateway.customer.create(
          creditCard:
            number: '5105105105105100'
            expirationDate: '05/12'
        , @callback)
        undefined
      "is":
        topic: (response) ->
          customer = response.customer
          callback = @callback
          specHelper.defaultGateway.subscription.create(
            paymentMethodToken: customer.creditCards[0].token
            planId: specHelper.plans.trialless.id
            id: specHelper.randomId()
          , (err, response) ->
            subscription1 = response.subscription
            specHelper.defaultGateway.subscription.create(
              paymentMethodToken: customer.creditCards[0].token
              planId: specHelper.plans.trialless.id
              id: specHelper.randomId()
            , (err, response) ->
              subscription2 = response.subscription
              specHelper.defaultGateway.subscription.search((search) ->
                search.id().is(subscription1.id)
              , (err, response) ->
                callback(err, {subscription1: subscription1, subscription2: subscription2, result: response})
              )
            )
          )
          undefined
        "on search":
          "check search result ids":
            topic: (response) ->
              response
            "returns only one": (response) ->
              assert.equal(response.result.searchResults.ids.length, 1)
          "get first of collection":
            topic: (response) ->
              callback = @callback
              response.result.first((err, result) ->
                callback(err,
                  subscription1 : response.subscription1
                  subscription2 : response.subscription2
                  result : result
                )
              )
              undefined
            "gets subscription1 domain object": (err, response) ->
              assert.isObject(response.result)
              assert.equal(response.result.id, response.subscription1.id)
            "does not error": (err, response) ->
              assert.isNull(err)

  .export(module)
