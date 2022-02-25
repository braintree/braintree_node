"use strict";

describe("AddOnGateway", () =>
  describe("self.all", () =>
    it("gets all addons", function (done) {
      let addOnId = `testAddOn${specHelper.randomId()}`;
      let attributes = {
        id: addOnId,
        name: "node add-on",
        amount: "10.00",
        description: "node add-on description",
        kind: "add_on",
        neverExpires: false,
        numberOfBillingCycles: 1,
      };

      specHelper.createModificationForTests(attributes, () =>
        specHelper.defaultGateway.addOn.all().then((response) => {
          assert.isTrue(response.success);
          // NEXT_MAJOR_VERSION remove this check when we return just the collection in the next major version update
          assert.equal(response, response.addOns);

          const addOn = response.find((addOn) => addOn.id === attributes.id);

          assert.equal(attributes.name, addOn.name);
          assert.equal(attributes.amount, addOn.amount);
          assert.equal(attributes.description, addOn.description);
          assert.equal(attributes.kind, addOn.kind);
          assert.equal(attributes.neverExpires, addOn.neverExpires);
          assert.equal(
            attributes.numberOfBillingCycles,
            addOn.numberOfBillingCycles
          );

          done();
        })
      );
    })));
