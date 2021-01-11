'use strict';

const sinon = require('sinon');
let AddOnGateway = require('../../../lib/braintree/add_on_gateway').AddOnGateway;

describe('AddOnGateway', () => {
  describe('all', () => {
    let addOns, addOnGateway, addOnStub;

    beforeEach(() => {
      addOns = {
        addOns:
        [{amount: '10.00',
          createdAt: '2020-11-23T22:52:23Z',
          description: 'this describes the modification',
          id: 'increase_10',
          kind: 'add_on',
          merchantId: 'integration_merchant_id',
          name: '10 dollar increase',
          neverExpires: true,
          numberOfBillingCycles: null,
          updatedAt: '2020-11-23T22:52:23Z'}]
      };
      addOnGateway = new AddOnGateway(specHelper.defaultGateway);
      addOnStub = sinon.stub(addOnGateway.gateway.http, 'get');
    });

    afterEach(() => {
      addOnStub.restore();
    });

    it('returns a resource collection on success', function () {
      addOnStub.resolves(addOns);

      return addOnGateway.all().then(response => {
        assert.isArray(response);
        assert.exists(response[0]);
        assert.equal(response[0].amount, '10.00');
        assert.equal(response[0].createdAt, '2020-11-23T22:52:23Z');
        assert.equal(response[0].description, 'this describes the modification');
        assert.equal(response[0].id, 'increase_10');
        assert.equal(response[0].kind, 'add_on');
        assert.equal(response[0].merchantId, 'integration_merchant_id');
        assert.equal(response[0].name, '10 dollar increase');
        assert.isTrue(response[0].neverExpires);
        assert.equal(response[0].numberOfBillingCycles, null);
        assert.equal(response[0].updatedAt, '2020-11-23T22:52:23Z');
      });
    });

    it('returns response object format on success', function () {
      // this is to preserve backwards compatibility and can be removed in
      // the next major version
      addOnStub.resolves(addOns);

      return addOnGateway.all().then(response => {
        assert.isTrue(response.success);
        assert.exists(response.addOns);
        assert.exists(response[0].amount);
        assert.equal(response[0].amount, response.addOns[0].amount);
        assert.equal(response[0].amount, response.addOns[0].amount);
      });
    });

    it('does not return a collection when there is an error', function () {
      addOnStub.resolves(
        {
          apiErrorResponse: 'foo',
          success: false
        }
      );

      return addOnGateway.all().then(response => {
        assert.isFalse(response.success);
        assert.notExists(response.addOns);
      });
    });
  });
});
