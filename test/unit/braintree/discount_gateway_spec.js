'use strict';

const sinon = require('sinon');
let DiscountGateway = require('../../../lib/braintree/discount_gateway').DiscountGateway;

describe('DiscountGateway', () => {
  describe('all', () => {
    let discounts, discountGateway, discountStub;

    beforeEach(() => {
      discounts = {
        discounts:
        [{amount: '11.00',
          createdAt: '2020-11-23T22:52:23Z',
          description: 'this describes the modification',
          id: 'decrease_11',
          kind: 'discount',
          merchantId: 'integration_merchant_id',
          name: '11 dollar discount',
          neverExpires: true,
          numberOfBillingCycles: null,
          updatedAt: '2020-11-23T22:52:23Z'}]
      };
      discountGateway = new DiscountGateway(specHelper.defaultGateway);
      discountStub = sinon.stub(discountGateway.gateway.http, 'get');
    });

    afterEach(() => {
      discountStub.restore();
    });

    it('returns a resource collection on success', function () {
      discountStub.resolves(discounts);

      return discountGateway.all().then(response => {
        assert.isArray(response);
        assert.exists(response[0]);
        assert.equal(response[0].amount, '11.00');
        assert.equal(response[0].createdAt, '2020-11-23T22:52:23Z');
        assert.equal(response[0].description, 'this describes the modification');
        assert.equal(response[0].id, 'decrease_11');
        assert.equal(response[0].kind, 'discount');
        assert.equal(response[0].merchantId, 'integration_merchant_id');
        assert.equal(response[0].name, '11 dollar discount');
        assert.isTrue(response[0].neverExpires);
        assert.equal(response[0].numberOfBillingCycles, null);
        assert.equal(response[0].updatedAt, '2020-11-23T22:52:23Z');
      });
    });

    it('returns response object format on success', function () {
      // this is to preserve backwards compatibility and can be removed in
      // the next major version
      discountStub.resolves(discounts);

      return discountGateway.all().then(response => {
        assert.isTrue(response.success);
        assert.exists(response.discounts);
        assert.exists(response[0].amount);
        assert.equal(response[0].amount, response.discounts[0].amount);
        assert.equal(response[0].amount, response.discounts[0].amount);
      });
    });

    it('does not return a collection when there is an error', function () {
      discountStub.resolves(
        {
          apiErrorResponse: 'foo',
          success: false
        }
      );

      return discountGateway.all().then(response => {
        assert.isFalse(response.success);
        assert.notExists(response.discounts);
      });
    });
  });
});
