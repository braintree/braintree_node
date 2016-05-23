require('../../spec_helper')
_ = require('underscore')._

describe "DiscountGateway", ->
  describe "self.all", ->
    it "gets all discounts", (done) ->
      discountId = "testDiscount#{specHelper.randomId()}"
      attributes =
        id: discountId
        name: 'node discount'
        amount: '10.00'
        description: 'node discount description'
        kind: 'discount'
        neverExpires: false
        numberOfBillingCycles: 1

      specHelper.createModificationForTests attributes, ->
        specHelper.defaultGateway.discount.all (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)

          discount = _.find(response.discounts, (discount) -> discount.id == attributes.id)
          assert.equal(attributes.name, discount.name)
          assert.equal(attributes.amount, discount.amount)
          assert.equal(attributes.description, discount.description)
          assert.equal(attributes.kind, discount.kind)
          assert.equal(attributes.neverExpires, discount.neverExpires)
          assert.equal(attributes.numberOfBillingCycles, discount.numberOfBillingCycles)

          done()
