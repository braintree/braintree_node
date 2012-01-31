require('../../spec_helper')
dateFormat = require('dateformat')

_ = require('underscore')._
braintree = specHelper.braintree

vows
  .describe('SubscriptionGateway')
  .addBatch
    'cancel':
      'when the subscription can be canceled':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            creditCard:
              number: '5105105105105100',
              expirationDate: '05/12'
            , (err, result) ->
              specHelper.defaultGateway.subscription.create(
                paymentMethodToken: result.customer.creditCards[0].token,
                planId: specHelper.plans.trialless.id
                , (err, result) ->
                  specHelper.defaultGateway.subscription.cancel(result.subscription.id, callback)))
          undefined
        'does not have an error': (err, response) -> assert.isNull(err) ,
        'is successful': (err, response) -> assert.isTrue(response.success) ,
        'cancels the subscription': (err, result) ->
          assert.equal(result.subscription.status, 'Canceled')
      'when the subscription cannot be canceled':
        topic:  ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            creditCard:
              number: '5105105105105100',
              expirationDate: '05/12'
            , (err, result) ->
              specHelper.defaultGateway.subscription.create(
                  paymentMethodToken: result.customer.creditCards[0].token,
                  planId: specHelper.plans.trialless.id
                , (err, result) ->
                  specHelper.defaultGateway.subscription.cancel(result.subscription.id,  (err, result) ->
                    specHelper.defaultGateway.subscription.cancel(result.subscription.id, callback))))
          undefined
        'is unsuccessful':  (err, response) ->   assert.isFalse(response.success)
        'has a unified message':  (err, response) ->
          assert.equal(response.message, 'Subscription has already been canceled.')
        'has an error on base':  (err, response) ->
          assert.equal(response.errors.for('subscription').on('status')[0].code, '81905')
      'when the subscription cannot be found':
        topic:  ->
          specHelper.defaultGateway.subscription.cancel('nonexistent_subscription', @callback)
          undefined
        'has a not found error':  (err, response) ->
          assert.equal(err.type, braintree.errorTypes.notFoundError)
    'create':
      'using a payment method token':
        topic:  ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            creditCard:
              number: '5105105105105100',
              expirationDate: '05/12'
            callback)
          undefined
        'for a minimal case':
          topic: (result) ->
            callback = @callback
            token = result.customer.creditCards[0].token
            specHelper.defaultGateway.subscription.create(
              paymentMethodToken: token,
              planId: specHelper.plans.trialless.id
            , callback)
            undefined
          'does not have an error':  (err, response) ->   assert.isNull(err)
          'is successful':  (err, response) ->   assert.isTrue(response.success)
          'has the expected plan id and amount':  (err, response) ->
            assert.equal(response.subscription.planId, specHelper.plans.trialless.id)
            assert.equal(response.subscription.price, specHelper.plans.trialless.price)
          'returns transactions':  (err, response) ->
            assert.match(response.subscription.transactions[0].id, /^\w{6,7}$/)
            assert.equal(response.subscription.transactions[0].creditCard.maskedNumber, '510510******5100')
            assert.equal(response.subscription.transactions[0].planId, specHelper.plans.trialless.id)
        'when setting the first billing date':
          topic: (result) ->
            callback = @callback
            token = result.customer.creditCards[0].token
            firstBillingDate = new Date()
            firstBillingDate.setFullYear(firstBillingDate.getFullYear() + 1)
            specHelper.defaultGateway.subscription.create(
              paymentMethodToken: token,
              planId: specHelper.plans.trialless.id,
              firstBillingDate: firstBillingDate
            , callback)
            undefined
          'is successful':  (err, response) ->
            assert.isNull(err)
            assert.isTrue(response.success)
          'has the expected first billing date':  (err, response) ->
            expectedDate = new Date()
            expectedDate.setFullYear(expectedDate.getFullYear() + 1)
            expectedDateString = dateFormat(expectedDate, 'yyyy-mm-dd', true)
            assert.equal(response.subscription.firstBillingDate, expectedDateString)
        'when the transaction is declined':
          topic: (result) ->
            callback = @callback
            token = result.customer.creditCards[0].token
            specHelper.defaultGateway.subscription.create(
              paymentMethodToken: token,
              planId: specHelper.plans.trialless.id,
              price: '2000.00'
            , callback)
            undefined
          'is not successful':  (err, result) ->
            assert.isNull(err)
            assert.isFalse(result.success)
          'returns the transaction on the result':  (err, result) ->
            assert.match(result.transaction.id, /^\w{6,7}$/)
            assert.equal(result.transaction.status, 'processor_declined')
            assert.equal(result.transaction.creditCard.maskedNumber, '510510******5100')
        'with inheriting addons and discounts':
          topic: (result) ->
            callback = @callback
            specHelper.defaultGateway.subscription.create(
              paymentMethodToken: result.customer.creditCards[0].token,
              planId: specHelper.plans.addonDiscountPlan.id

            , callback)
            undefined
          'is successful':  (err, result) ->
            assert.isNull(err)
            assert.isTrue(result.success)
          'inherits add ons':  (err, result) ->
            addons = _.sortBy(result.subscription.addOns, (a) ->  return a.id )
            assert.equal(addons.length, 2)

            assert.equal(addons[0].id, 'increase_10')
            assert.equal(addons[0].amount, '10.00')
            assert.equal(addons[0].quantity, 1)
            assert.equal(addons[0].numberOfBillingCycles, null)
            assert.isTrue(addons[0].neverExpires)

            assert.equal(addons[1].id, 'increase_20')
            assert.equal(addons[1].amount, '20.00')
            assert.equal(addons[1].quantity, 1)
            assert.equal(addons[1].numberOfBillingCycles, null)
            assert.isTrue(addons[1].neverExpires)
          ,
          'inherits discounts':  (err, result) ->
            discounts = _.sortBy(result.subscription.discounts, (d) ->  return d.id )
            assert.equal(discounts.length, 2)

            assert.equal(discounts[0].id, 'discount_11')
            assert.equal(discounts[0].amount, '11.00')
            assert.equal(discounts[0].quantity, 1)
            assert.equal(discounts[0].numberOfBillingCycles, null)
            assert.isTrue(discounts[0].neverExpires)

            assert.equal(discounts[1].id, 'discount_7')
            assert.equal(discounts[1].amount, '7.00')
            assert.equal(discounts[1].quantity, 1)
            assert.equal(discounts[1].numberOfBillingCycles, null)
            assert.isTrue(discounts[1].neverExpires)

        'with validation errors on updates':
          topic: (result) ->
            callback = @callback
            specHelper.defaultGateway.subscription.create(
              paymentMethodToken: result.customer.creditCards[0].token,
              planId: specHelper.plans.addonDiscountPlan.id,
              addOns:
                update: [
                  {existingId: specHelper.addOns.increase10, amount: 'invalid'}
                  {existingId: specHelper.addOns.increase20, quantity: -10 }]
            , callback)
            undefined
          'is not successful':  (err, result) ->
            assert.isNull(err)
            assert.isFalse(result.success)
          'has errors accessible by array index':  (err, result) ->
            assert.equal(result.errors.for('subscription').for('addOns').for('update').forIndex(0).on('amount')[0].code, '92002')
            assert.equal(result.errors.for('subscription').for('addOns').for('update').forIndex(1).on('quantity')[0].code, '92001')
      'with validation errors':
        topic:  ->
          callback = @callback
          specHelper.defaultGateway.subscription.create(
            paymentMethodToken: 'invalid_token',
            planId: 'invalid_plan_id'
            , callback)
          undefined
        'is unsuccessful':  (err, response) ->   assert.isFalse(response.success)
        'has a unified message':  (err, response) ->
          messages = response.message.split("\n")
          assert.equal(messages.length, 2)
          assert.include(messages, 'Payment method token is invalid.')
          assert.include(messages, 'Plan ID is invalid.')
        'has an error on plan id':  (err, response) ->
          assert.equal(response.errors.for('subscription').on('planId')[0].code, '91904')
        'has an error on payment method token':  (err, response) ->
          assert.equal(response.errors.for('subscription').on('paymentMethodToken')[0].code, '91903')

    'find':
      'when subscription can be found':
        topic:  ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            creditCard:
              number: '5105105105105100',
              expirationDate: '05/12'
             (err, result) ->
              specHelper.defaultGateway.subscription.create(
                paymentMethodToken: result.customer.creditCards[0].token,
                planId: specHelper.plans.trialless.id
                , (err, result) ->
                  specHelper.defaultGateway.subscription.find(result.subscription.id, callback)))
          undefined
        'does not have an error': (err, subscription) ->  assert.isNull(err)
        'returns the subscription': (err, subscription) ->
          assert.equal(subscription.planId, specHelper.plans.trialless.id)
          assert.equal(subscription.price, specHelper.plans.trialless.price)
          assert.equal(subscription.status, 'Active')
        'contains the current billing cycle': (err, subscription) ->
          assert.equal(subscription.currentBillingCycle, 1)
      'when the subscription cannot be found':
        topic:  ->
          specHelper.defaultGateway.subscription.find('nonexistent_subscription', @callback)
          undefined
        'has a not found error':  (err, response) ->
          assert.equal(err.type, braintree.errorTypes.notFoundError)

      'when the id is whitespace':
        topic:  ->
          specHelper.defaultGateway.subscription.find(" ", @callback)
          undefined
        'returns a not found error': (err, address) ->
          assert.equal(err.type, braintree.errorTypes.notFoundError)

    'retryCharge':
      'with an existing subscription':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            creditCard:
              number: '5105105105105100',
              expirationDate: '05/12'
            , callback)
          undefined
        'with only specifying subscription id':
          topic: (result) ->
            callback = @callback
            specHelper.defaultGateway.subscription.create(
              paymentMethodToken: result.customer.creditCards[0].token,
              planId: specHelper.plans.trialless.id
            ,  (err, result) ->
              specHelper.makePastDue(result.subscription,  (err, result) ->
                specHelper.defaultGateway.subscription.retryCharge(result.subscription.id, callback)))
            undefined
          'it successful':  (err, result) ->
            assert.isNull(err)
            assert.isTrue(result.success)
          'returns the transaction':  (err, result) ->
            assert.equal(result.transaction.amount, specHelper.plans.trialless.price)
            assert.equal(result.transaction.type, 'sale')
            assert.equal(result.transaction.status, 'authorized')

        'with specifying subscription id and amount':
          topic: (result) ->
            callback = @callback
            specHelper.defaultGateway.subscription.create(
              paymentMethodToken: result.customer.creditCards[0].token,
              planId: specHelper.plans.trialless.id
            ,  (err, result) ->
              specHelper.makePastDue(result.subscription,  (err, result) ->
                specHelper.defaultGateway.subscription.retryCharge(result.subscription.id, '6.00', callback)))
            undefined
          'it successful':  (err, result) ->
            assert.isNull(err)
            assert.isTrue(result.success)
          'returns the transaction':  (err, result) ->
            assert.equal(result.transaction.amount, '6.00')
            assert.equal(result.transaction.type, 'sale')
            assert.equal(result.transaction.status, 'authorized')
    'update':
      'when the subscription can be updated':
        topic:  ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            creditCard:
              number: '5105105105105100',
              expirationDate: '05/12'
            , (err, result) ->
              specHelper.defaultGateway.subscription.create(
                paymentMethodToken: result.customer.creditCards[0].token,
                planId: specHelper.plans.trialless.id,
                price: '5.00'
                , (err, result) ->
                  specHelper.defaultGateway.subscription.update(
                    result.subscription.id,
                     price: '8.00' ,
                    callback)))
          undefined
        'is successful':  (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
        'updates the subscription':  (err, result) ->
          assert.equal(result.subscription.price, '8.00')

      'when the subscription cannot be updated':
        topic:  ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            creditCard:
              number: '5105105105105100',
              expirationDate: '05/12'
            , (err, result) ->
              specHelper.defaultGateway.subscription.create(
                paymentMethodToken: result.customer.creditCards[0].token,
                planId: specHelper.plans.trialless.id,
                price: '5.00'
                , (err, result) ->
                  specHelper.defaultGateway.subscription.update(
                    result.subscription.id,
                    { price: 'invalid' },
                    callback)))
          undefined
        'is not successful':  (err, response) ->
          assert.isNull(err)
          assert.isFalse(response.success)
        'returns validation errors':  (err, result) ->
          assert.equal(result.errors.for('subscription').on('price')[0].message, 'Price is an invalid format.')
          assert.equal(result.errors.for('subscription').on('price')[0].code, '81904')

  .export(module)

