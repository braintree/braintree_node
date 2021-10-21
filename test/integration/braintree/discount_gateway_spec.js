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
        specHelper.defaultGateway.discount.all().then(response => {
          assert.isTrue(response.success);
          // NEXT_MAJOR_VERSION remove this check when we return just the collection in the next major version update
          assert.equal(response, response.discounts);

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
