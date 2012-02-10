require("../../spec_helper.coffee")
{SubscriptionSearch} = require('../../../lib/braintree/subscription_search')
{TransactionSearch} = require('../../../lib/braintree/transaction_search')

vows
  .describe("AdvancedSearch")
  .addBatch
    "textFields":
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
              subscription2 = response.subscription
              specHelper.defaultGateway.subscription.search((search) ->
                search.id().is(subscription1.id)
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

    "keyValueFields":
      "is":
        topic: ->
          callback = @callback
          specHelper.defaultGateway.transaction.sale(
            amount: "5.00"
            creditCard:
              number: "5105105105105100"
              expirationDate: "05/14"
            options:
              submitForSettlement: true
          , (err, response) ->
            transaction1 = response.transaction
            specHelper.settleTransaction(transaction1.id, (err, settleResult) ->
              specHelper.defaultGateway.transaction.sale(
                amount: "10.00"
                creditCard:
                  number: "5105105105105100"
                  expirationDate: "05/15"
                options:
                  submitForSettlement: true
              , (err, response) ->
                transaction2 = response.transaction
                specHelper.settleTransaction(transaction2.id, (err, settleResult) ->
                  specHelper.defaultGateway.transaction.refund(transaction1.id, (err, response) ->
                    specHelper.defaultGateway.transaction.search((search) ->
                      search.id().is(transaction1.id)
                      search.refund().is(true)
                    , (err, response) ->
                      callback(err,
                        transaction1: transaction1
                        transaction2: transaction2
                        result: response
                      )
                    )
                  )
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
                  transaction1 : response.transaction1
                  result : result
                )
              )
              undefined
            "gets transaction1 domain object": (err, response) ->
              assert.isObject(response.result)
              assert.equal(response.result.id, response.transaction1.id)
            "does not error": (err, response) ->
              assert.isNull(err)


    "multipleValueFields":
      topic: ->
        specHelper.defaultGateway.customer.create(
          creditCard:
            number: '5105105105105100'
            expirationDate: '05/12'
        , @callback)
        undefined
      "in":
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
                search.ids().in(subscription1.id, subscription2.id)
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
        "on search":
          "result":
            topic: (response) ->
              response
            "is successful": (response) ->
              assert.isTrue(response.result.success)
          "get each in collection":
            topic: (response) ->
              callback = @callback
              subscriptionIds = []
              response.result.each((err, subscription) ->
                subscriptionIds.push(subscription.id)
                if (subscriptionIds.length == 2)
                  callback(null,
                    subscriptionIds : subscriptionIds
                    subscription1 : response.subscription1
                    subscription2 : response.subscription2
                  )
                else if subscriptionIds.length > 2
                  callback("TOO Many Results", null)
              )
              undefined
            "gets subscription domain objects": (err, response) ->
              assert.equal(response.subscriptionIds.length, 2)
              assert.includes(response.subscriptionIds, response.subscription1.id)
              assert.includes(response.subscriptionIds, response.subscription2.id)
            "does not error": (err, response) ->
              assert.isNull(err)

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
              subscription2 = response.subscription
              specHelper.defaultGateway.subscription.search((search) ->
                search.ids().is(subscription1.id)
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
        "on search":
          "result":
            topic: (response) ->
              response
            "is successful": (response) ->
              assert.isTrue(response.result.success)
            "includes only subscription1": (response) ->
              assert.equal(response.result.ids.length, 1)
              assert.includes(response.result.ids, response.subscription1.id)
            "does not include subscription2": (response) ->
              specHelper.doesNotInclude(response.result.ids, response.subscription2.id)

    "multipleValueOrTextFields":
      topic: ->
        specHelper.defaultGateway.customer.create(
          creditCard:
            number: '5105105105105100'
            expirationDate: '05/12'
        , @callback)
        undefined
      "in":
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
              planId: specHelper.plans.addonDiscountPlan.id
              id: specHelper.randomId()
            , (err, response) ->
              subscription2 = response.subscription
              specHelper.defaultGateway.subscription.search((search) ->
                search.planId().in(subscription1.planId, subscription2.planId)
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
        "on search":
          "result":
            topic: (response) ->
              response
            "is successful": (response) ->
              assert.isTrue(response.result.success)
            "includes both subscriptions": (response) ->
              assert.includes(response.result.ids, response.subscription1.id)
              assert.includes(response.result.ids, response.subscription2.id)
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
              planId: specHelper.plans.addonDiscountPlan.id
              id: specHelper.randomId()
            , (err, response) ->
              subscription2 = response.subscription
              specHelper.defaultGateway.subscription.search((search) ->
                search.planId().is(subscription1.planId)
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
        "on search":
          "result":
            topic: (response) ->
              response
            "is successful": (response) ->
              assert.isTrue(response.result.success)
            "includes subscription1": (response) ->
              assert.includes(response.result.ids, response.subscription1.id)
            "does not include subscription2": (response) ->
              specHelper.doesNotInclude(response.result.ids, response.subscription2.id)

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
              planId: specHelper.plans.addonDiscountPlan.id
              id: specHelper.randomId()
            , (err, response) ->
              subscription2 = response.subscription
              specHelper.defaultGateway.subscription.search((search) ->
                search.planId().isNot(subscription1.planId)
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
            id: specHelper.randomId()
          , (err, response) ->
            subscription1 = response.subscription
            specHelper.defaultGateway.subscription.create(
              paymentMethodToken: creditCard.token
              planId: specHelper.plans.addonDiscountPlan.id
              id: specHelper.randomId()
            , (err, response) ->
              subscription2 = response.subscription
              specHelper.defaultGateway.subscription.search((search) ->
                search.planId().startsWith(subscription1.planId.slice(0, subscription1.planId.length - 1))
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
        "on search":
          "result":
            topic: (response) ->
              response
            "is successful": (response) ->
              assert.isTrue(response.result.success)
            "includes subscription1": (response) ->
              assert.includes(response.result.ids, response.subscription1.id)
            "does not include subscription2": (response) ->
              specHelper.doesNotInclude(response.result.ids, response.subscription2.id)

      "endsWith":
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
              planId: specHelper.plans.addonDiscountPlan.id
              id: specHelper.randomId()
            , (err, response) ->
              subscription2 = response.subscription
              specHelper.defaultGateway.subscription.search((search) ->
                search.planId().endsWith(subscription1.planId.slice(1))
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
        "on search":
          "result":
            topic: (response) ->
              response
            "is successful": (response) ->
              assert.isTrue(response.result.success)
            "includes subscription1": (response) ->
              assert.includes(response.result.ids, response.subscription1.id)
            "does not include subscription2": (response) ->
              specHelper.doesNotInclude(response.result.ids, response.subscription2.id)

      "contains":
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
              planId: specHelper.plans.addonDiscountPlan.id
              id: specHelper.randomId()
            , (err, response) ->
              subscription2 = response.subscription
              specHelper.defaultGateway.subscription.search((search) ->
                search.planId().contains(subscription1.planId.slice(1, subscription1.planId.length - 1))
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
        "on search":
          "result":
            topic: (response) -> response
            "is successful": (response) ->
              assert.isTrue(response.result.success)
            "includes subscription1": (response) ->
              assert.includes(response.result.ids, response.subscription1.id)
            "does not include subscription2": (response) ->
              specHelper.doesNotInclude(response.result.ids, response.subscription2.id)

    "rangeFields":
      topic: ->
        specHelper.defaultGateway.customer.create(
          creditCard:
            number: '5105105105105100'
            expirationDate: '05/12'
        , @callback)
        undefined

      "min":
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
              planId: specHelper.plans.addonDiscountPlan.id
              id: specHelper.randomId()
            , (err, response) ->
              subscription2 = response.subscription
              subscription1Price = Number(subscription1.price)
              specHelper.defaultGateway.subscription.search((search) ->
                search.price().min(subscription1Price)
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
        "on search":
          "result":
            topic: (response) ->
              response
            "is successful": (response) ->
              assert.isTrue(response.result.success)
            "includes subscription1": (response) ->
              assert.includes(response.result.ids, response.subscription1.id)
            "does not include subscription2": (response) ->
              specHelper.doesNotInclude(response.result.ids, response.subscription2.id)

      "max":
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
              planId: specHelper.plans.addonDiscountPlan.id
              id: specHelper.randomId()
            , (err, response) ->
              subscription2 = response.subscription
              subscription2Price = Number(subscription2.price)
              specHelper.defaultGateway.subscription.search((search) ->
                search.price().max(subscription2Price)
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
        "on search":
          "result":
            topic: (response) ->
              response
            "is successful": (response) ->
              assert.isTrue(response.result.success)
            "includes subscription2": (response) ->
              assert.includes(response.result.ids, response.subscription2.id)
            "does not include subscription1": (response) ->
              specHelper.doesNotInclude(response.result.ids, response.subscription1.id)

      "between":
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
              planId: specHelper.plans.addonDiscountPlan.id
              id: specHelper.randomId()
            , (err, response) ->
              subscription2 = response.subscription
              subscriptionPrice = Number(subscription1.price)
              specHelper.defaultGateway.subscription.search((search) ->
                search.price().between(subscriptionPrice - 0.01, subscriptionPrice + 0.01)
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
        "on search":
          "result":
            topic: (response) ->
              response
            "is successful": (response) ->
              assert.isTrue(response.result.success)
            "includes subscription1": (response) ->
              assert.includes(response.result.ids, response.subscription1.id)
            "does not include subscription2": (response) ->
              specHelper.doesNotInclude(response.result.ids, response.subscription2.id)

  .export(module)
