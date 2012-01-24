require("../../spec_helper.coffee")
{SubscriptionSearch} = require('../../../lib/braintree/subscription_search')

vows
  .describe("SubscriptionSearch")
  .addBatch
    "fields":
      topic: ->
        specHelper.defaultGateway.customer.create(
          creditCard:
            number: '5105105105105100'
            expirationDate: '05/12'
        , @callback)
        undefined
      "is":
        topic: (response) ->
          creditCard = response.customer.creditCards[0]
          callback = @callback
          specHelper.defaultGateway.subscription.create(
            paymentMethodToken: creditCard.token
            planId: specHelper.plans.trialless.id
            id: specHelper.randomId()
          , (err, response) ->
            subscription1 = response.subscription
            specHelper.defaultGateway.subscription.create(
              paymentMethodToken: creditCard.token
              planId: specHelper.plans.trialless.id
              id: specHelper.randomId()
            , (err, response) ->
              specHelper.defaultGateway.subscription.search((search) ->
                search.id().is(subscription1.id)
              , (err, response) ->
                callback(err,
                  subscription1: subscription1
                  result: response
                )
              )
            )
          )
          undefined
        "on search":
          "result":
            topic: (response) ->
              response
            "is successful": (response) ->
              assert.isTrue(response.result.success)
            "returns only one": (response) ->
              assert.equal(response.result.length(), 1)
          "get first of collection":
            topic: (response) ->
              callback = @callback
              response.result.first((err, result) ->
                callback(err,
                  subscription1 : response.subscription1
                  result : result
                )
              )
              undefined
            "gets subscription1 domain object": (err, response) ->
              assert.isObject(response.result)
              assert.equal(response.result.id, response.subscription1.id)
            "does not error": (err, response) ->
              assert.isNull(err)

      "isNot":
        topic: (response) ->
          creditCard = response.customer.creditCards[0]
          callback = @callback
          specHelper.defaultGateway.subscription.create(
            paymentMethodToken: creditCard.token
            planId: specHelper.plans.trialless.id
            id: specHelper.randomId()
          , (err, response) ->
            subscription1 = response.subscription
            specHelper.defaultGateway.subscription.create(
              paymentMethodToken: creditCard.token
              planId: specHelper.plans.trialless.id
              id: specHelper.randomId()
            , (err, response) ->
              subscription2 = response.subscription
              specHelper.defaultGateway.subscription.search((search) ->
                search.id().isNot(subscription1.id)
              , (err, response) ->
                callback(err,
                  subscription1: subscription1
                  subscription2: subscription2
                  result: response
                )
              )
            )
          )
          undefined
        "is successful": (response) ->
          assert.isTrue(response.result.success)
        "does not return subscription1": (response) ->
          specHelper.doesNotInclude(response.result.ids, response.subscription1.id)
        "includes subscription2": (response) ->
          assert.include(response.result.ids, response.subscription2.id)

      "startsWith":
        topic: (response) ->
          creditCard = response.customer.creditCards[0]
          callback = @callback
          specHelper.defaultGateway.subscription.create(
            paymentMethodToken: creditCard.token
            planId: specHelper.plans.trialless.id
            id: specHelper.randomId() + specHelper.randomId()
          , (err, response) ->
            subscription1 = response.subscription
            specHelper.defaultGateway.subscription.create(
              paymentMethodToken: creditCard.token
              planId: specHelper.plans.trialless.id
              id: specHelper.randomId() + specHelper.randomId()
            , (err, response) ->
              specHelper.defaultGateway.subscription.search((search) ->
                search.id().startsWith(subscription1.id.slice(0, subscription1.id.length - 1))
              , (err, response) ->
                callback(err,
                  subscription1: subscription1
                  result: response
                )
              )
            )
          )
          undefined
        "on search":
          "result":
            topic: (response) ->
              response
            "is successful": (response) ->
              assert.isTrue(response.result.success)
            "returns only one": (response) ->
              assert.equal(response.result.length(), 1)
          "get first of collection":
            topic: (response) ->
              callback = @callback
              response.result.first((err, result) ->
                callback(err,
                  subscription1 : response.subscription1
                  result : result
                )
              )
              undefined
            "gets subscription1 domain object": (err, response) ->
              assert.isObject(response.result)
              assert.equal(response.result.id, response.subscription1.id)
            "does not error": (err, response) ->
              assert.isNull(err)

      "endsWith":
        topic: (response) ->
          creditCard = response.customer.creditCards[0]
          callback = @callback
          specHelper.defaultGateway.subscription.create(
            paymentMethodToken: creditCard.token
            planId: specHelper.plans.trialless.id
            id: specHelper.randomId() + specHelper.randomId()
          , (err, response) ->
            subscription1 = response.subscription
            specHelper.defaultGateway.subscription.create(
              paymentMethodToken: creditCard.token
              planId: specHelper.plans.trialless.id
              id: specHelper.randomId() + specHelper.randomId()
            , (err, response) ->
              specHelper.defaultGateway.subscription.search((search) ->
                search.id().endsWith(subscription1.id.slice(1))
              , (err, response) ->
                callback(err,
                  subscription1: subscription1
                  result: response
                )
              )
            )
          )
          undefined
        "on search":
          "result":
            topic: (response) ->
              response
            "is successful": (response) ->
              assert.isTrue(response.result.success)
            "returns only one": (response) ->
              assert.equal(response.result.length(), 1)
          "get first of collection":
            topic: (response) ->
              callback = @callback
              response.result.first((err, result) ->
                callback(err,
                  subscription1 : response.subscription1
                  result : result
                )
              )
              undefined
            "gets subscription1 domain object": (err, response) ->
              assert.isObject(response.result)
              assert.equal(response.result.id, response.subscription1.id)
            "does not error": (err, response) ->
              assert.isNull(err)

      "contains":
        topic: (response) ->
          creditCard = response.customer.creditCards[0]
          callback = @callback
          specHelper.defaultGateway.subscription.create(
            paymentMethodToken: creditCard.token
            planId: specHelper.plans.trialless.id
            id: specHelper.randomId() + specHelper.randomId()
          , (err, response) ->
            subscription1 = response.subscription
            specHelper.defaultGateway.subscription.create(
              paymentMethodToken: creditCard.token
              planId: specHelper.plans.trialless.id
              id: specHelper.randomId() + specHelper.randomId()
            , (err, response) ->
              specHelper.defaultGateway.subscription.search((search) ->
                search.id().contains(subscription1.id.slice(1, subscription1.id.length - 1))
              , (err, response) ->
                callback(err,
                  subscription1: subscription1
                  result: response
                )
              )
            )
          )
          undefined
        "on search":
          "result":
            topic: (response) ->
              response
            "is successful": (response) ->
              assert.isTrue(response.result.success)
            "returns only one": (response) ->
              assert.equal(response.result.length(), 1)
          "get first of collection":
            topic: (response) ->
              callback = @callback
              response.result.first((err, result) ->
                callback(err,
                  subscription1 : response.subscription1
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
