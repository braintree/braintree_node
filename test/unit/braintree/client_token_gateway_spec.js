"use strict";

let braintree = specHelper.braintree;

describe("ClientTokenGateway", () =>
  describe("generate", () => {
    it("returns an error when credit card options are supplied without a customer ID", function (done) {
      specHelper.defaultGateway.clientToken.generate(
        {
          options: { makeDefault: true, verifyCard: true },
        },
        function (err) {
          assert.equal(err.type, braintree.errorTypes.unexpectedError);
          assert.equal(
            err.message,
            "A customer id is required for the following options: makeDefault, verifyCard"
          );
          done();
        }
      );
    });

    it("does not return an error when the domains option is supplied", function (done) {
      specHelper.defaultGateway.clientToken.generate(
        {
          domains: ["example.com"],
        },
        function (err, response) {
          assert.equal(err, null);
          assert.typeOf(response, "object");
          assert.typeOf(response.clientToken, "string");
          done();
        }
      );
    });
  }));
