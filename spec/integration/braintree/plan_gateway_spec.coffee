require('../../spec_helper')
_ = require('underscore')._

describe "PlanGateway", ->
  describe "self.all", ->
    it "gets all plans", (done) ->
      planToken = "testPlan#{specHelper.randomId()}"
      attributes =
        id: planToken
        billingDayOfMonth: 1
        billingFrequency: 1
        currencyIsoCode: "USD"
        description: "some description"
        name: "nodeTestPlan"
        numberOfBillingCycles: 1
        price: "1.00"
        trialPeriod: false

      addOnAttributes =
        kind: 'add_on'
        planId: planToken
        amount: '1.00'
        name: 'nodeAddOn'
      discountAttributes =
        kind: 'discount'
        planId: planToken
        amount: '1.00'
        name: 'nodeDiscount'

      specHelper.createPlanForTests attributes, ->
        specHelper.createModificationForTests addOnAttributes, ->
          specHelper.createModificationForTests discountAttributes, ->
            specHelper.defaultGateway.plan.all (err, response) ->
              assert.isNull(err)
              assert.isTrue(response.success)

              plan = _.find(response.plans, (plan) -> plan.id == attributes.id)

              assert.equal(attributes.id, plan.id)
              assert.equal(attributes.billingDayOfMonth, plan.billingDayOfMonth)
              assert.equal(attributes.billingFrequency, plan.billingFrequency)
              assert.equal(attributes.currencyIsoCode, plan.currencyIsoCode)
              assert.equal(attributes.description, plan.description)
              assert.equal(attributes.name, plan.name)
              assert.equal(attributes.numberOfBillingCycles, plan.numberOfBillingCycles)
              assert.equal(attributes.price, plan.price)
              assert.equal(attributes.trialPeriod, plan.trialPeriod)
              assert.isNotNull(plan.createdAt)
              assert.isNotNull(plan.updatedAt)
              assert.equal(addOnAttributes.name, plan.addOns[0].name)
              assert.equal(discountAttributes.name, plan.discounts[0].name)

              done()
