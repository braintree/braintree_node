"use strict";

let braintree = specHelper.braintree;
let CreateLocalPaymentContextInput = require("../../../lib/braintree/graphql/inputs/create_local_payment_context_input");
let MonetaryAmountInput = require("../../../lib/braintree/graphql/inputs/monetary_amount_input");
let PayerInfoInput = require("../../../lib/braintree/graphql/inputs/payer_info_input");
let ShippingAddressInput = require("../../../lib/braintree/graphql/inputs/shipping_address_input");
let { LocalPaymentType } = braintree;

describe.skip("LocalPaymentContextGateway", function () {
  let gateway;

  beforeEach(function () {
    gateway = new braintree.BraintreeGateway({
      environment: braintree.Environment.Development,
      merchantId: "pwpp_multi_account_merchant",
      publicKey: "pwpp_multi_account_merchant_public_key",
      privateKey: "pwpp_multi_account_merchant_private_key",
    });
  });

  describe("create", function () {
    it("creates a MBWAY local payment context", function (done) {
      const amount = new MonetaryAmountInput("10.00", "EUR");
      const shippingAddress = new ShippingAddressInput({
        streetAddress: "123 Main St",
        extendedAddress: "Apt 4B",
        locality: "Lisbon",
        region: "Lisboa",
        postalCode: "1000-001",
        countryCode: "PT",
      });
      const payerInfo = new PayerInfoInput({
        givenName: "John",
        surname: "Doe",
        phoneNumber: "912345678",
        phoneCountryCode: "351",
        shippingAddress: shippingAddress,
      });
      const input = new CreateLocalPaymentContextInput({
        amount: amount,
        type: LocalPaymentType.MBWAY,
        payerInfo: payerInfo,
        returnUrl: "https://example.com/return",
        cancelUrl: "https://example.com/cancel",
        merchantAccountId: "eur_pwpp_multi_account_merchant_account",
      });

      gateway.localPaymentContext
        .create(input)
        .then(function (result) {
          assert.isTrue(result.success);
          assert.isDefined(result.target);
          assert.isDefined(result.target.id);
          assert.equal(result.target.type, LocalPaymentType.MBWAY);
          assert.equal(result.target.amount.value, "10.00");
          assert.equal(result.target.amount.currencyCode, "EUR");
          assert.isDefined(result.target.approvalUrl);

          done();
        })
        .catch(done);
    });

    it("creates a CRYPTO local payment context", function (done) {
      const amount = new MonetaryAmountInput("25.00", "USD");
      const payerInfo = new PayerInfoInput({
        givenName: "John",
        surname: "Doe",
        email: "john.doe@example.com",
      });
      const input = new CreateLocalPaymentContextInput({
        amount: amount,
        type: LocalPaymentType.CRYPTO,
        payerInfo: payerInfo,
        returnUrl: "https://example.com/return",
        cancelUrl: "https://example.com/cancel",
        merchantAccountId: "usd_pwpp_multi_account_merchant_account",
      });

      gateway.localPaymentContext
        .create(input)
        .then(function (result) {
          assert.isTrue(result.success);
          assert.isDefined(result.target);
          assert.isDefined(result.target.id);
          assert.equal(result.target.type, LocalPaymentType.CRYPTO);
          assert.equal(result.target.amount.value, "25.00");
          assert.equal(result.target.amount.currencyCode, "USD");
          assert.isDefined(result.target.approvalUrl);

          done();
        })
        .catch(done);
    });

    it("creates a local payment context with only required fields", function (done) {
      const amount = new MonetaryAmountInput("15.00", "USD");
      const payerInfo = new PayerInfoInput({
        givenName: "Jane",
        surname: "Smith",
      });
      const input = new CreateLocalPaymentContextInput({
        amount: amount,
        type: LocalPaymentType.CRYPTO,
        payerInfo: payerInfo,
        returnUrl: "https://example.com/return",
        cancelUrl: "https://example.com/cancel",
      });

      gateway.localPaymentContext
        .create(input)
        .then(function (result) {
          assert.isTrue(result.success);
          assert.isDefined(result.target);
          assert.isDefined(result.target.id);
          assert.equal(result.target.type, LocalPaymentType.CRYPTO);
          assert.equal(result.target.amount.value, "15.00");
          assert.equal(result.target.amount.currencyCode, "USD");

          done();
        })
        .catch(done);
    });

    it("returns validation errors for invalid input", function (done) {
      const amount = new MonetaryAmountInput("invalid", "EUR");
      const payerInfo = new PayerInfoInput({
        givenName: "John",
        surname: "Doe",
        phoneNumber: "912345678",
        phoneCountryCode: "351",
      });
      const input = new CreateLocalPaymentContextInput({
        amount: amount,
        type: LocalPaymentType.MBWAY,
        payerInfo: payerInfo,
        returnUrl: "https://example.com/return",
        cancelUrl: "https://example.com/cancel",
        merchantAccountId: "eur_pwpp_multi_account_merchant_account",
      });

      gateway.localPaymentContext
        .create(input)
        .then(function (result) {
          assert.isFalse(result.success);
          assert.isDefined(result.errors);

          done();
        })
        .catch(done);
    });
  });

  describe("find", function () {
    it("finds a local payment context by id", function (done) {
      const amount = new MonetaryAmountInput("10.00", "EUR");
      const payerInfo = new PayerInfoInput({
        givenName: "John",
        surname: "Doe",
        phoneNumber: "912345678",
        phoneCountryCode: "351",
      });
      const input = new CreateLocalPaymentContextInput({
        amount: amount,
        type: LocalPaymentType.MBWAY,
        payerInfo: payerInfo,
        returnUrl: "https://example.com/return",
        cancelUrl: "https://example.com/cancel",
        merchantAccountId: "eur_pwpp_multi_account_merchant_account",
      });

      gateway.localPaymentContext
        .create(input)
        .then(function (createResult) {
          assert.isTrue(createResult.success);
          const paymentContextId = createResult.target.id;

          gateway.localPaymentContext
            .find(paymentContextId)
            .then(function (findResult) {
              assert.isTrue(findResult.success);
              assert.isDefined(findResult.target);
              assert.equal(findResult.target.id, paymentContextId);
              assert.equal(findResult.target.type, LocalPaymentType.MBWAY);

              done();
            })
            .catch(done);
        })
        .catch(done);
    });

    it("throws NotFoundError for non-existent id", function (done) {
      gateway.localPaymentContext
        .find("non-existent-id")
        .then(function () {
          done(new Error("Expected error to be thrown"));
        })
        .catch(function (error) {
          assert.include(error.message, "Local payment context not found");
          done();
        });
    });
  });
});
