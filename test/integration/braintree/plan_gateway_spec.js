'use strict';

let braintree = specHelper.braintree;

describe('PlanGateway', () => {
  describe('self.all', () => {
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

      specHelper.createPlanForTests(attributes, () => {
        specHelper.createModificationForTests(addOnAttributes, () => {
          specHelper.createModificationForTests(discountAttributes, () => {
            specHelper.defaultGateway.plan.all().then(response => {
              assert.isTrue(response.success);
              // NEXT_MAJOR_VERSION remove this check when we return just the collection in the next major version update
              assert.equal(response, response.plans);

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
            });
          });
        });
      });
    });
  });

  describe('create', function () {
    it('creates a plan', function (done) {
      let planParams = {
        billingDayOfMonth: 12,
        billingFrequency: 1,
        currencyIsoCode: 'USD',
        description: 'my description',
        name: 'my plan name',
        numberOfBillingCycles: 1,
        price: '9.99',
        trialPeriod: false
      };

      specHelper.defaultGateway.plan.create(planParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.plan.price, '9.99');
        assert.equal(response.plan.billingDayOfMonth, 12);
        assert.equal(response.plan.name, 'my plan name');
        assert.equal(response.plan.currencyIsoCode, 'USD');
        assert.isNotNull(response.plan.createdAt);

        done();
      });
    });
  });

  describe('find', function () {
    it('finds a plan', function (done) {
      let planParams = {
        billingDayOfMonth: 12,
        billingFrequency: 1,
        currencyIsoCode: 'USD',
        description: 'my description',
        name: 'my plan name',
        numberOfBillingCycles: 1,
        price: '9.99',
        trialPeriod: false
      };

      specHelper.defaultGateway.plan.create(planParams, (err, response) =>
        specHelper.defaultGateway.plan.find(response.plan.id, function (err, plan) {
          assert.isNull(err);
          assert.equal(plan.id, response.plan.id);
          assert.equal(plan.price, response.plan.price);
          assert.equal(plan.description, response.plan.description);

          done();
        })
      );
    });

    it('returns a not found error if given a bad id', done =>
      specHelper.defaultGateway.plan.find(' ', function (err) {
        assert.equal(err.type, braintree.errorTypes.notFoundError);

        done();
      })
    );
  });

  describe('update', function () {
    let plan;

    beforeEach(function (done) {
      let planParams = {
        billingDayOfMonth: 12,
        billingFrequency: 1,
        currencyIsoCode: 'USD',
        description: 'my description',
        name: 'my plan name',
        numberOfBillingCycles: 1,
        price: '9.99',
        trialPeriod: false
      };

      specHelper.defaultGateway.plan.create(planParams, function (err, response) {
        plan = response.plan;
        done();
      });
    });

    it('updates the subscription', function (done) {
      let updateParams = {
        name: 'my updated plan name',
        price: '99.99'
      };

      specHelper.defaultGateway.plan.update(plan.id, updateParams, function (err, response) {
        assert.isNull(err);
        assert.isTrue(response.success);
        assert.equal(response.plan.price, '99.99');
        assert.equal(response.plan.name, 'my updated plan name');

        done();
      });
    });
  });
});

