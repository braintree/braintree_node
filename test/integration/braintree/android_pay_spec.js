"use strict";

let Nonces = require("../../../lib/braintree/test_values/nonces").Nonces;

describe("Android Pay", function () {
  it("can create from nonce", (done) =>
    specHelper.defaultGateway.customer.create({}, function (err, response) {
      let customerId = response.customer.id;

      let paymentMethodParams = {
        customerId,
        paymentMethodNonce: Nonces.AndroidPayVisa,
      };

      specHelper.defaultGateway.paymentMethod.create(
        paymentMethodParams,
        function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          let androidPayCard = response.paymentMethod;

          assert.equal(
            response.paymentMethod.constructor.name,
            "AndroidPayCard"
          );

          assert.isNotNull(androidPayCard.business);
          assert.isNotNull(androidPayCard.consumer);
          assert.isNotNull(androidPayCard.corporate);
          assert.isNotNull(androidPayCard.prepaid);
          assert.isNotNull(androidPayCard.prepaidReloadable);
          assert.isNotNull(androidPayCard.purchase);

          specHelper.defaultGateway.customer.find(
            customerId,
            function (err, customer) {
              assert.equal(customer.androidPayCards.length, 1);
              assert.equal(
                customer.androidPayCards[0].token,
                androidPayCard.token
              );

              done();
            }
          );
        }
      );
    }));
});
