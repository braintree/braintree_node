require('../../spec_helper')
dateFormat = require('dateformat')
_ = require('underscore')._
braintree = specHelper.braintree
{Nonces} = require('../../../lib/braintree/test/nonces')

describe "SubscriptionGateway", ->
  customerId = null
  creditCardToken = null

  beforeEach (done) ->
    customerParams =
      creditCard:
        number: '5105105105105100',
        expirationDate: '05/12'

    specHelper.defaultGateway.customer.create customerParams, (err, response) ->
      customerId = response.customer.id
      creditCardToken = response.customer.creditCards[0].token
      done()

  describe "create", ->
    it "creates a subscription", (done) ->
      subscriptionParams =
        paymentMethodToken: creditCardToken,
        planId: specHelper.plans.trialless.id

      specHelper.defaultGateway.subscription.create subscriptionParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.equal(response.subscription.planId, specHelper.plans.trialless.id)
        assert.equal(response.subscription.price, specHelper.plans.trialless.price)
        assert.match(response.subscription.transactions[0].id, /^\w{6,7}$/)
        assert.equal(response.subscription.transactions[0].creditCard.maskedNumber, '510510******5100')
        assert.equal(response.subscription.transactions[0].planId, specHelper.plans.trialless.id)

        done()

    it "creates a subscription with a payment method nonce", (done) ->
      specHelper.generateNonceForNewCreditCard("4111111111111111", customerId, (nonce) ->
        subscriptionParams =
          paymentMethodNonce: nonce,
          planId: specHelper.plans.trialless.id

        specHelper.defaultGateway.subscription.create subscriptionParams, (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
          assert.equal(response.subscription.transactions[0].creditCard.maskedNumber, '411111******1111')
          done()
      )

    it "creates a subscription with a vaulted paypal account", (done) ->
      specHelper.paypalMerchantGateway.customer.create {}, (err, response) ->
        paypalCustomerId = response.customer.id

        specHelper.generateNonceForPayPalAccount (nonce) ->
          paymentMethodParams =
            paymentMethodNonce: nonce
            customerId: paypalCustomerId

          specHelper.paypalMerchantGateway.paymentMethod.create paymentMethodParams, (err, response) ->
            paymentMethodToken = response.paypalAccount.token

            subscriptionParams =
              paymentMethodToken: paymentMethodToken
              planId: specHelper.plans.trialless.id

            specHelper.paypalMerchantGateway.subscription.create subscriptionParams, (err, response) ->
              assert.isNull(err)
              assert.isTrue(response.success)
              assert.isNotNull(response.subscription.transactions[0].paypal.email)

              done()

    it "does not vault an unverified paypal account payment method nonce", (done) ->
      subscriptionParams =
        paymentMethodNonce: Nonces.PayPalOneTimePayment,
        planId: specHelper.plans.trialless.id

      specHelper.paypalMerchantGateway.subscription.create subscriptionParams, (err, response) ->
        assert.isNull(err)
        assert.isFalse(response.success)
        assert.equal(response.errors.for('subscription').on('paymentMethodNonce')[0].code, '91925')

        done()

    it "allows setting the first billing date", (done) ->
      firstBillingDate = new Date()
      firstBillingDate.setFullYear(firstBillingDate.getFullYear() + 1)
      subscriptionParams =
        paymentMethodToken: creditCardToken
        planId: specHelper.plans.trialless.id
        firstBillingDate: firstBillingDate

      specHelper.defaultGateway.subscription.create subscriptionParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        expectedDate = new Date()
        expectedDate.setFullYear(expectedDate.getFullYear() + 1)
        expectedDateString = dateFormat(expectedDate, 'yyyy-mm-dd', true)
        assert.equal(response.subscription.firstBillingDate, expectedDateString)

        done()

    it "handles declined transactions", (done) ->
      subscriptionParams =
        price: '2000.00'
        paymentMethodToken: creditCardToken
        planId: specHelper.plans.trialless.id

      specHelper.defaultGateway.subscription.create subscriptionParams, (err, response) ->
        assert.isNull(err)
        assert.isFalse(response.success)
        assert.match(response.transaction.id, /^\w{6,7}$/)
        assert.equal(response.transaction.status, 'processor_declined')
        assert.equal(response.transaction.creditCard.maskedNumber, '510510******5100')

        done()

    it "inherits addons and discounts", (done) ->
      subscriptionParams =
        paymentMethodToken: creditCardToken
        planId: specHelper.plans.addonDiscountPlan.id

      specHelper.defaultGateway.subscription.create subscriptionParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)

        addons = _.sortBy(response.subscription.addOns, (a) ->  return a.id )
        assert.equal(addons.length, 2)

        assert.equal(addons[0].id, 'increase_10')
        assert.equal(addons[0].amount, '10.00')
        assert.equal(addons[0].quantity, 1)
        assert.equal(addons[0].numberOfBillingCycles, null)
        assert.isTrue(addons[0].neverExpires)
        assert.equal(addons[0].currentBillingCycle, 0)

        assert.equal(addons[1].id, 'increase_20')
        assert.equal(addons[1].amount, '20.00')
        assert.equal(addons[1].quantity, 1)
        assert.equal(addons[1].numberOfBillingCycles, null)
        assert.isTrue(addons[1].neverExpires)
        assert.equal(addons[1].currentBillingCycle, 0)

        discounts = _.sortBy(response.subscription.discounts, (d) ->  return d.id )
        assert.equal(discounts.length, 2)

        assert.equal(discounts[0].id, 'discount_11')
        assert.equal(discounts[0].amount, '11.00')
        assert.equal(discounts[0].quantity, 1)
        assert.equal(discounts[0].numberOfBillingCycles, null)
        assert.isTrue(discounts[0].neverExpires)
        assert.equal(discounts[0].currentBillingCycle, 0)

        assert.equal(discounts[1].id, 'discount_7')
        assert.equal(discounts[1].amount, '7.00')
        assert.equal(discounts[1].quantity, 1)
        assert.equal(discounts[1].numberOfBillingCycles, null)
        assert.isTrue(discounts[1].neverExpires)
        assert.equal(discounts[1].currentBillingCycle, 0)

        done()

    it "handles validation errors", (done) ->
      subscriptionParams =
        paymentMethodToken: 'invalid_token',
        planId: 'invalid_plan_id'

      specHelper.defaultGateway.subscription.create subscriptionParams, (err, response) ->
        assert.isFalse(response.success)
        messages = response.message.split("\n")
        assert.equal(messages.length, 2)
        assert.include(messages, 'Payment method token is invalid.')
        assert.include(messages, 'Plan ID is invalid.')
        assert.equal(response.errors.for('subscription').on('planId')[0].code, '91904')
        assert.equal(response.errors.for('subscription').on('paymentMethodToken')[0].code, '91903')

        done()

    it "handles validation errors on modification updates", (done) ->
      subscriptionParams =
        paymentMethodToken: creditCardToken
        planId: specHelper.plans.addonDiscountPlan.id
        addOns:
          update: [
            {existingId: specHelper.addOns.increase10, amount: 'invalid'}
            {existingId: specHelper.addOns.increase20, quantity: -10 }]

      specHelper.defaultGateway.subscription.create subscriptionParams, (err, response) ->
        assert.isNull(err)
        assert.isFalse(response.success)
        assert.equal(response.errors.for('subscription').for('addOns').for('update').forIndex(0).on('amount')[0].code, '92002')
        assert.equal(response.errors.for('subscription').for('addOns').for('update').forIndex(1).on('quantity')[0].code, '92001')

        done()

  describe "find", ->
    it "finds a subscription", (done) ->
      subscriptionParams =
        paymentMethodToken: creditCardToken
        planId: specHelper.plans.trialless.id

      specHelper.defaultGateway.subscription.create subscriptionParams, (err, response) ->
        specHelper.defaultGateway.subscription.find response.subscription.id, (err, subscription) ->
          assert.isNull(err)
          assert.equal(subscription.planId, specHelper.plans.trialless.id)
          assert.equal(subscription.price, specHelper.plans.trialless.price)
          assert.equal(subscription.status, 'Active')
          assert.equal(subscription.currentBillingCycle, 1)

          done()

    it "returns a not found error if given a bad id", (done) ->
      specHelper.defaultGateway.subscription.find " ", (err, subscription) ->
        assert.equal(err.type, braintree.errorTypes.notFoundError)

        done()

  describe "update", ->
    subscription = null

    beforeEach (done) ->
      subscriptionParams =
        paymentMethodToken: creditCardToken
        planId: specHelper.plans.trialless.id,
        price: '5.00'

      specHelper.defaultGateway.subscription.create subscriptionParams, (err, response) ->
        subscription = response.subscription
        done()

    it "updates the subscription", (done) ->
      subscriptionParams =
        price: '8.00'

      specHelper.defaultGateway.subscription.update subscription.id, subscriptionParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.equal(response.subscription.price, '8.00')

        done()

    it "updates the payment method using a payment method nonce", (done) ->
      specHelper.generateNonceForNewCreditCard("4111111111111111", customerId, (nonce) ->
        subscriptionParams =
          paymentMethodNonce: nonce,
          planId: specHelper.plans.trialless.id

        specHelper.defaultGateway.subscription.update subscription.id, subscriptionParams, (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)

          specHelper.defaultGateway.creditCard.find(response.subscription.paymentMethodToken, (err, creditCard) ->
            assert.equal(creditCard.maskedNumber, '411111******1111')
            done()
          )
      )

    it "handles validation erros", (done) ->
      subscriptionParams =
        price: 'invalid'

      specHelper.defaultGateway.subscription.update subscription.id, subscriptionParams, (err, response) ->
        assert.isNull(err)
        assert.isFalse(response.success)
        assert.equal(response.errors.for('subscription').on('price')[0].message, 'Price is an invalid format.')
        assert.equal(response.errors.for('subscription').on('price')[0].code, '81904')

        done()

  describe "retryCharge", ->
    subscription = null

    beforeEach (done) ->
      subscriptionParams =
        paymentMethodToken: creditCardToken
        planId: specHelper.plans.trialless.id

      specHelper.defaultGateway.subscription.create subscriptionParams, (err, response) ->
        subscription = response.subscription
        specHelper.makePastDue response.subscription, (err, response) ->
          done()

    it "retries charging a failed subscription", (done) ->
      specHelper.defaultGateway.subscription.retryCharge subscription.id, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.equal(response.transaction.amount, specHelper.plans.trialless.price)
        assert.equal(response.transaction.type, 'sale')
        assert.equal(response.transaction.status, 'authorized')

        done()

    it "allows specifying an amount", (done) ->
      specHelper.defaultGateway.subscription.retryCharge subscription.id, '6.00', (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.equal(response.transaction.amount, '6.00')
        assert.equal(response.transaction.type, 'sale')
        assert.equal(response.transaction.status, 'authorized')

        done()

  describe "cancel", ->
    it "cancels a subscription", (done) ->
      subscriptionParams =
        paymentMethodToken: creditCardToken
        planId: specHelper.plans.trialless.id

      specHelper.defaultGateway.subscription.create subscriptionParams, (err, response) ->
        specHelper.defaultGateway.subscription.cancel response.subscription.id, (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
          assert.equal(response.subscription.status, 'Canceled')

          done()

    it "handles validation errors", (done) ->
      subscriptionParams =
        paymentMethodToken: creditCardToken
        planId: specHelper.plans.trialless.id

      specHelper.defaultGateway.subscription.create subscriptionParams, (err, response) ->
        subscriptionId = response.subscription.id
        specHelper.defaultGateway.subscription.cancel subscriptionId, (err, response) ->
          specHelper.defaultGateway.subscription.cancel subscriptionId, (err, response) ->
            assert.isFalse(response.success)
            assert.equal(response.message, 'Subscription has already been canceled.')
            assert.equal(response.errors.for('subscription').on('status')[0].code, '81905')

            done()

    it "returns a not found error if provided a bad id", (done) ->
      specHelper.defaultGateway.subscription.cancel 'nonexistent_subscription', (err, response) ->
        assert.equal(err.type, braintree.errorTypes.notFoundError)

        done()

