"use strict";

let CreditCardVerificationGateway =
  require("../../../lib/braintree/credit_card_verification_gateway").CreditCardVerificationGateway;
let errorTypes = require("../../../lib/braintree/error_types").errorTypes;

describe("CreditCardVerificationGateway", () =>
  describe("create", function () {
    let fakeGateway = {
      config: {
        baseMerchantPath() {
          return "";
        },
      },
      http: {
        post(url, params) {
          return Promise.resolve(params);
        },
      },
    };

    it("throws error if not a valid input", function (done) {
      let verificationGateway = new CreditCardVerificationGateway(fakeGateway);
      let verificationParams = {
        invalidParam: "invalidValue",
      };

      verificationGateway.create(verificationParams, (err, params) => {
        assert.notExists(params);
        assert.isNotNull(err);

        assert.equal(err.type, errorTypes.invalidKeysError);
        assert.equal(err.message, "These keys are invalid: invalidParam");
        done();
      });
    });
  }));
