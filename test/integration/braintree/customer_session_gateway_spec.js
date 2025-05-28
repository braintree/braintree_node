"use strict";

const { assert } = require("chai");
const braintree = require("./../../../lib/braintree");
const {
  CreateCustomerSessionInput,
  CustomerRecommendationsInput,
  CustomerSessionInput,
  MonetaryAmountInput,
  PayPalPurchaseUnitInput,
  PhoneInput,
  UpdateCustomerSessionInput,
  RecommendedPaymentOption,
} = require("./../../../lib/braintree/graphql");

describe("CustomerSessionGateway", () => {
  const gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Development,
    merchantId: "pwpp_multi_account_merchant",
    publicKey: "pwpp_multi_account_merchant_public_key",
    privateKey: "pwpp_multi_account_merchant_private_key",
  });

  function buildCustomerSessionInput(email, phoneNumber) {
    const phoneInput = PhoneInput.builder()
      .countryPhoneCode("1")
      .phoneNumber(phoneNumber)
      .build();

    return CustomerSessionInput.builder()
      .email(email)
      .deviceFingerprintId("test")
      .phone(phoneInput)
      .paypalAppInstalled(true)
      .venmoAppInstalled(true)
      .userAgent("Mozilla")
      .build();
  }

  function buildCustomerSession(sessionId) {
    const customer = buildCustomerSessionInput(
      "PR1_test@example.com",
      "4085005002"
    );
    const inputBuilder = CreateCustomerSessionInput.builder();

    if (sessionId) {
      inputBuilder.sessionId(sessionId);
    }
    const input = inputBuilder.customer(customer).build();

    return gateway.customerSession.createCustomerSession(input);
  }

  function buildPurchaseUnit() {
    const amount = new MonetaryAmountInput("10.00", "USD");

    return PayPalPurchaseUnitInput.builder(amount).build();
  }

  describe("Create customer session", () => {
    it("create a customer session without email and phone", async () => {
      const input = CreateCustomerSessionInput.builder()
        .merchantAccountId("usd_pwpp_multi_account_merchant_account")
        .build();

      const result = await gateway.customerSession.createCustomerSession(input);

      assert.isTrue(result.success);
      assert.isDefined(result.target);
    });

    it("create a customer session with merchant provided session id", async () => {
      const merchantSessionId = "11EF-A1E7-A5F5EE5C-A2E5-AFD2801469FC";
      const input = CreateCustomerSessionInput.builder()
        .sessionId(merchantSessionId)
        .build();
      const result = await gateway.customerSession.createCustomerSession(input);

      assert.isTrue(result.success);
      assert.equal(result.target, merchantSessionId);
    });

    it("create a customer session with API derived session id", async () => {
      const input = CreateCustomerSessionInput.builder().build();
      const result = await gateway.customerSession.createCustomerSession(input);

      assert.isTrue(result.success);
      assert.isDefined(result.target);
    });

    it("create a customer session with purchase units", async () => {
      const input = CreateCustomerSessionInput.builder()
        .purchaseUnits([buildPurchaseUnit()])
        .build();
      const result = await gateway.customerSession.createCustomerSession(input);

      assert.isTrue(result.success);
      assert.isDefined(result.target);
    });

    it("does not create a duplicate customer session", async () => {
      const existingSessionId = "11EF-34BC-2702904B-9026-C3ECF4BAC765";

      const result = await buildCustomerSession(existingSessionId);

      assert.isFalse(result.success);
      assert.ok(
        result.errors
          .deepErrors()[0]
          .message.includes("Session IDs must be unique per merchant")
      );
    });
  });

  describe("Update customer session", () => {
    it("updates existing session", async () => {
      const sessionId = "11EF-A1E7-A5F5EE5C-A2E5-AFD2801469FC";
      const createInput = CreateCustomerSessionInput.builder()
        .sessionId(sessionId)
        .merchantAccountId("usd_pwpp_multi_account_merchant_account")
        .build();

      await gateway.customerSession.createCustomerSession(createInput);

      const customer = buildCustomerSessionInput(
        "PR5_test@example.com",
        "4085005005"
      );
      const input = UpdateCustomerSessionInput.builder(sessionId)
        .customer(customer)
        .purchaseUnits([buildPurchaseUnit()])
        .build();

      const result = await gateway.customerSession.updateCustomerSession(input);

      assert.equal(result.target, sessionId);
    });

    it("does not update non-existent session", async () => {
      const sessionId = "11EF-34BC-2702904B-9026-C3ECF4BAC765";
      const customer = buildCustomerSessionInput(
        "PR9_test@example.com",
        "4085005009"
      );
      const input = UpdateCustomerSessionInput.builder(sessionId)
        .customer(customer)
        .build();

      const result = await gateway.customerSession.updateCustomerSession(input);

      assert.isFalse(result.success);
      assert.ok(
        result.errors.deepErrors()[0].message.includes("does not exist")
      );
    });
  });

  describe("Get customer recommendations", () => {
    it("gets customer recommendations", async () => {
      const customer = CustomerSessionInput.builder()
        .hashedEmail(
          "48ddb93f0b30c475423fe177832912c5bcdce3cc72872f8051627967ef278e08"
        )
        .hashedPhoneNumber(
          "a2df2987b2a3384210d3aa1c9fb8b627ebdae1f5a9097766c19ca30ec4360176"
        )
        .deviceFingerprintId("00DD010662DE")
        .userAgent(
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/x.x.x.x Safari/537.36"
        )
        .build();

      const customerRecommendationsInput =
        CustomerRecommendationsInput.builder()
          .sessionId("94f0b2db-5323-4d86-add3-paypal000000")
          .customer(customer)
          .purchaseUnits([buildPurchaseUnit()])
          .domain("domain.com")
          .build();

      const result = await gateway.customerSession.getCustomerRecommendations(
        customerRecommendationsInput
      );

      assert.isTrue(result.success);
      const payload = result.target;

      assert.isTrue(payload.isInPayPalNetwork);

      const recommendation = payload.recommendations.paymentOptions[0];

      assert.equal(
        recommendation.paymentOption,
        RecommendedPaymentOption.PAYPAL
      );
      assert.equal(recommendation.recommendedPriority, 1);

      const paymentRecommendation =
        payload.recommendations.paymentRecommendations[0];

      assert.equal(
        paymentRecommendation.paymentOption,
        RecommendedPaymentOption.PAYPAL
      );
      assert.equal(paymentRecommendation.recommendedPriority, 1);
    });

    it("does not get recommendations for unauthorized session", (done) => {
      const customer = CustomerSessionInput.builder()
        .deviceFingerprintId("00DD010662DE")
        .userAgent(
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/x.x.x.x Safari/537.36"
        )
        .build();

      const customerRecommendationsInput =
        CustomerRecommendationsInput.builder()
          .sessionId("94f0b2db-5323-4d86-add3-paypal000000")
          .customer(customer)
          .purchaseUnits([buildPurchaseUnit()])
          .domain("domain.com")
          .merchantAccountId("gbp_pwpp_multi_account_merchant_account")
          .build();

      gateway.customerSession
        .getCustomerRecommendations(customerRecommendationsInput)
        .then(() => {
          done(assert.fail("Expected authorization error."));
        })
        .catch((err) => {
          if (err.type === "authorizationError") {
            done();
          } else {
            done(assert.fail("Expected authorization error."));
          }
        });
    });
  });
});
