require("../../spec_helper")
{SubscriptionSearch} = require("../../../lib/braintree/subscription_search")
{Subscription} = require("../../../lib/braintree/subscription")

describe "SubscriptionSearch", ->
  describe "search", ->
    it "returns search results", (done) ->
      customerParams =
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'

      specHelper.defaultGateway.customer.create customerParams, (err, response) ->
        subscriptionParams =
          paymentMethodToken: response.customer.creditCards[0].token
          planId: specHelper.plans.trialless.id
          id: specHelper.randomId()

        specHelper.defaultGateway.subscription.create subscriptionParams, (err, response) ->
          subscriptionId = response.subscription.id
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

          search = (search) ->
            for criteria, value of textCriteria
              search[criteria]().is(value)

            for criteria, value of multipleValueCriteria
              search[criteria]().in(value)

            for criteria, value of multipleValueOrTextCriteria
              search[criteria]().startsWith(value)

            for criteria, range of rangeCriteria
              for operator, value of range
                search[criteria]()[operator](value)

          specHelper.defaultGateway.subscription.search search, (err, response) ->
            assert.isTrue(response.success)
            assert.equal(response.length(), 1)

            response.first (err, subscription) ->
              assert.isObject(subscription)
              assert.equal(subscription.id, subscriptionId)
              assert.isNull(err)

              done()
