require("../../spec_helper")
{SubscriptionSearch} = require("../../../lib/braintree/subscription_search")
{Subscription} = require("../../../lib/braintree/subscription")

vows
  .describe("SubscriptionSearch")
  .addBatch
    "customer search":
      topic: ->
        callback = @callback
        specHelper.defaultGateway.customer.create(
          creditCard:
            number: '5105105105105100'
            expirationDate: '05/12'
        , (err, response) ->
          subscriptionParams =
            paymentMethodToken: response.customer.creditCards[0].token
            planId: specHelper.plans.trialless.id
            id: specHelper.randomId()
          specHelper.defaultGateway.subscription.create(subscriptionParams, (err, response) ->
            textCriteria =
              id: subscriptionParams.id
              transactionId: response.subscription.transactions[0].id

            multipleValueCriteria =
              inTrialPeriod: false
              status: Subscription.Status.Active
              merchantAccountId: 'sandbox_credit_card'
              ids: subscriptionParams.id

            multipleValueOrTextCriteria =
              planId: specHelper.plans.trialless.id

            planPrice = Number(specHelper.plans.trialless.price)
            today = new Date()
            billingCyclesRemaining = Number(response.subscription.numberOfBillingCycles) - 1

            rangeCriteria =
              price:
                min: planPrice - 1
                max: planPrice + 1
              billingCyclesRemaining:
                min: billingCyclesRemaining
                max: billingCyclesRemaining
              nextBillingDate:
                min: today

            specHelper.defaultGateway.subscription.search((search) ->
              for criteria, value of textCriteria
                search[criteria]().is(value)

              for criteria, value of multipleValueCriteria
                search[criteria]().in(value)

              for criteria, value of multipleValueOrTextCriteria
                search[criteria]().startsWith(value)

              for criteria, range of rangeCriteria
                for operator, value of range
                  search[criteria]()[operator](value)

            , (err, response) ->
              callback(err,
                subscriptionId: subscriptionParams.id
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
                subscriptionId: response.subscriptionId
                result: result
              )
            )
            undefined
          "gets subscription domain object": (err, response) ->
            assert.isObject(response.result)
            assert.equal(response.result.id, response.subscriptionId)
          "does not error": (err, response) ->
            assert.isNull(err)

  .export(module)

