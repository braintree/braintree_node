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

    it("processes accountInformationInquiry in options", function (done) {
      let gateway = new CreditCardVerificationGateway(
        specHelper.defaultGateway
      );
      let verificationParams = {
        options: {
          accountInformationInquiry: "send_data",
        },
      };

      gateway.create = (params, callback) => {
        if (params.options.accountInformationInquiry === "send_data") {
          callback(null, {
            options: {
              accountInformationInquiry:
                params.options.accountInformationInquiry,
            },
          });
        } else {
          callback(new Error("Server Error"), null);
        }
      };

      gateway.create(verificationParams, (err, result) => {
        assert.isNull(err);
        assert.exists(result);
        assert.deepEqual(result.options.accountInformationInquiry, "send_data");
        done();
      });
    });
  }));
