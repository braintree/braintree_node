'use strict';

const sinon = require('sinon');
let PlanGateway = require('../../../lib/braintree/plan_gateway').PlanGateway;

describe('PlanGateway', () => {
  describe('all', () => {
    let plans, planGateway, planStub;

    beforeEach(() => {
      plans = {plans:
        [{id: 'a_plan_id-514796579',
          merchantId: 'integration_merchant_id',
          billingDayOfMonth: 1,
          billingFrequency: 1,
          currencyIsoCode: 'USD',
          description: 'java test description',
          name: 'java test plan',
          numberOfBillingCycles: 12,
          price: '100.00',
          trialDuration: null,
          trialDurationUnit: null,
          trialPeriod: false,
          createdAt: '2020-11-23T22:52:23Z',
          updatedAt: '2020-11-23T22:52:23Z',
          addOns: [],
          discounts: []
        }]};
      planGateway = new PlanGateway(specHelper.defaultGateway);
      planStub = sinon.stub(planGateway.gateway.http, 'get');
    });

    afterEach(() => {
      planStub.restore();
    });

    it('returns a resource collection on success', function () {
      planStub.resolves(plans);

      return planGateway.all().then(response => {
        assert.exists(response[0]);
        assert.isArray(response);
        assert.equal(response[0].id, 'a_plan_id-514796579');
        assert.equal(response[0].merchantId, 'integration_merchant_id');
        assert.equal(response[0].billingDayOfMonth, 1);
        assert.equal(response[0].billingFrequency, 1);
        assert.equal(response[0].currencyIsoCode, 'USD');
        assert.equal(response[0].description, 'java test description');
        assert.equal(response[0].name, 'java test plan');
        assert.equal(response[0].numberOfBillingCycles, 12);
        assert.equal(response[0].price, '100.00');
        assert.equal(response[0].trialDuration, null);
        assert.equal(response[0].trialDurationUnit, null);
        assert.isFalse(response[0].trialPeriod);
        assert.equal(response[0].createdAt, '2020-11-23T22:52:23Z');
        assert.equal(response[0].updatedAt, '2020-11-23T22:52:23Z');
        assert.exists(response[0].addOns);
        assert.exists(response[0].discounts);
      });
    });

    it('returns response object format on success', function () {
      // this is to preserve backwards compatibility and can be removed in
      // the next major version
      planStub.resolves(plans);

      return planGateway.all().then(response => {
        assert.isTrue(response.success);
        assert.exists(response.plans);
        assert.exists(response[0].id);
        assert.equal(response[0].id, response.plans[0].id);
        assert.equal(response[0].id, response.plans[0].id);
      });
    });

    it('does not return a collection when there is an error', function () {
      planStub.resolves(
        {
          apiErrorResponse: 'foo',
          success: false
        }
      );

      return planGateway.all().then(response => {
        assert.isFalse(response.success);
        assert.notExists(response.plans);
      });
    });
  });
});
