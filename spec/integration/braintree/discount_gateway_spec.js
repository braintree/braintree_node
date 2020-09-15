'use strict';

describe('DiscountGateway', () =>
  describe('self.all', () =>
    it('gets all discounts', function (done) {
      let discountId = `testDiscount${specHelper.randomId()}`;
      let attributes = {
        id: discountId,
        name: 'node discount',
        amount: '10.00',
        description: 'node discount description',
        kind: 'discount',
        neverExpires: false,
        numberOfBillingCycles: 1
      };

      specHelper.createModificationForTests(attributes, () =>
        specHelper.defaultGateway.discount.all(function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);

          const discount = response.discounts.find(discount => discount.id === attributes.id);

          assert.equal(attributes.name, discount.name);
          assert.equal(attributes.amount, discount.amount);
          assert.equal(attributes.description, discount.description);
          assert.equal(attributes.kind, discount.kind);
          assert.equal(attributes.neverExpires, discount.neverExpires);
          assert.equal(attributes.numberOfBillingCycles, discount.numberOfBillingCycles);

          done();
        })
      );
    })
  )
);
