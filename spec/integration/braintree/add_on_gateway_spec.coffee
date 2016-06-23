require('../../spec_helper')
_ = require('underscore')._

describe "AddOnGateway", ->
  describe "self.all", ->
    it "gets all addons", (done) ->
      addOnId = "testAddOn#{specHelper.randomId()}"
      attributes =
        id: addOnId
        name: 'node add-on'
        amount: '10.00'
        description: 'node add-on description'
        kind: 'add_on'
        neverExpires: false
        numberOfBillingCycles: 1

      specHelper.createModificationForTests attributes, ->
        specHelper.defaultGateway.addOn.all (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)

          addOn = _.find(response.addOns, (addOn) -> addOn.id == attributes.id)
          assert.equal(attributes.name, addOn.name)
          assert.equal(attributes.amount, addOn.amount)
          assert.equal(attributes.description, addOn.description)
          assert.equal(attributes.kind, addOn.kind)
          assert.equal(attributes.neverExpires, addOn.neverExpires)
          assert.equal(attributes.numberOfBillingCycles, addOn.numberOfBillingCycles)

          done()
