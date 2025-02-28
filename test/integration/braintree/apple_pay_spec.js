"use strict";

let Nonces = require("../../../lib/braintree/test_values/nonces").Nonces;

describe("Apple Pay", function () {
  it("can create from nonce", (done) =>
    specHelper.defaultGateway.customer.create({}, function (err, response) {
      let customerId = response.customer.id;

      let paymentMethodParams = {
        customerId,
        paymentMethodNonce: Nonces.ApplePayVisa,
      };

      specHelper.defaultGateway.paymentMethod.create(
        paymentMethodParams,
        function (err, response) {
          assert.isNull(err);
          assert.isTrue(response.success);
          let applePayCard = response.paymentMethod;

          assert.equal(response.paymentMethod.constructor.name, "ApplePayCard");

          assert.isNotNull(applePayCard.prepaid);
          assert.isNotNull(applePayCard.prepaidReloadable);

          specHelper.defaultGateway.customer.find(
            customerId,
            function (err, customer) {
              assert.equal(customer.applePayCards.length, 1);
              assert.equal(customer.applePayCards[0].token, applePayCard.token);

              done();
            }
          );
        }
      );
    }));
});
