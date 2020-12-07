'use strict';

describe('PlanGateway', () =>
  describe('self.all', () =>
    it('gets all plans', function (done) {
      let planToken = `testPlan${specHelper.randomId()}`;
      let attributes = {
        id: planToken,
        billingDayOfMonth: 1,
        billingFrequency: 1,
        currencyIsoCode: 'USD',
        description: 'some description',
        name: 'nodeTestPlan',
        numberOfBillingCycles: 1,
        price: '1.00',
        trialPeriod: false
      };

      let addOnAttributes = {
        kind: 'add_on',
        planId: planToken,
        amount: '1.00',
        name: 'nodeAddOn'
      };
      let discountAttributes = {
        kind: 'discount',
        planId: planToken,
        amount: '1.00',
        name: 'nodeDiscount'
      };

      specHelper.createPlanForTests(attributes, () =>
        specHelper.createModificationForTests(addOnAttributes, () =>
          specHelper.createModificationForTests(discountAttributes, () =>
            specHelper.defaultGateway.plan.all(function (err, response) {
              assert.isNull(err);
              assert.isTrue(response.success);

              const plan = response.plans.find(plan => plan.id === attributes.id);

              assert.equal(attributes.id, plan.id);
              assert.equal(attributes.billingDayOfMonth, plan.billingDayOfMonth);
              assert.equal(attributes.billingFrequency, plan.billingFrequency);
              assert.equal(attributes.currencyIsoCode, plan.currencyIsoCode);
              assert.equal(attributes.description, plan.description);
              assert.equal(attributes.name, plan.name);
              assert.equal(attributes.numberOfBillingCycles, plan.numberOfBillingCycles);
              assert.equal(attributes.price, plan.price);
              assert.equal(attributes.trialPeriod, plan.trialPeriod);
              assert.isNotNull(plan.createdAt);
              assert.isNotNull(plan.updatedAt);
              assert.equal(addOnAttributes.name, plan.addOns[0].name);
              assert.equal(discountAttributes.name, plan.discounts[0].name);

              done();
            })
          )
        )
      );
    })
  )
);
