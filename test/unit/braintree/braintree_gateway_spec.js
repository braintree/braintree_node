"use strict";

let BraintreeGateway =
  require("../../../lib/braintree/braintree_gateway").BraintreeGateway;
let Environment = require("../../../lib/braintree/environment").Environment;

describe("BraintreeGateway", function () {
  describe("bankAccountInstantVerification", function () {
    it("returns BankAccountInstantVerificationGateway instance", function () {
      let gateway = new BraintreeGateway({
        environment: Environment.Sandbox,
        merchantId: "merchant_id",
        publicKey: "public_key",
        privateKey: "private_key",
      });

      let bankAccountInstantVerificationGateway =
        gateway.bankAccountInstantVerification;

      assert.isObject(bankAccountInstantVerificationGateway);
      assert.equal(
        "BankAccountInstantVerificationGateway",
        bankAccountInstantVerificationGateway.constructor.name
      );
    });
  });
});
