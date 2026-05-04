"use strict";

let braintree = specHelper.braintree;

describe("MerchantGateway", function () {
  describe("create", function () {
    // NEXT_MAJOR_VERSION remove this test
    it("rejects with a server error because the endpoint has been disabled", function (done) {
      let gateway = new braintree.BraintreeGateway({
        clientId: "client_id$development$integration_client_id",
        clientSecret: "client_secret$development$integration_client_secret",
      });

      return gateway.merchant.create(
        {
          email: "name@email.com",
          countryCodeAlpha3: "GBR",
          paymentMethods: ["credit_card", "paypal"],
        },
        function (err) {
          assert.equal(err.type, braintree.errorTypes.serverError);

          done();
        }
      );
    });
  });
});
