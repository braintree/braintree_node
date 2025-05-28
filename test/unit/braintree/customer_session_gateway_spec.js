"use strict";

const sinon = require("sinon");
const {
  CustomerSessionGateway,
} = require("../../../lib/braintree/customer_session_gateway");
const {
  CreateCustomerSessionInput,
  CustomerRecommendationsInput,
  UpdateCustomerSessionInput,
  RecommendedPaymentOption,
  CustomerRecommendationsPayload,
  PaymentRecommendation,
  CustomerRecommendations,
} = require("../../../lib/braintree/graphql");
const { assert } = require("chai");

describe("CustomerSessionGateway", () => {
  let gateway, graphQLClientMock;

  beforeEach(() => {
    graphQLClientMock = {
      query: sinon.stub(),
    };
    gateway = new CustomerSessionGateway({ graphQLClient: graphQLClientMock });
  });

  describe("createCustomerSession", () => {
    it("should successfully create a customer session", async () => {
      const input = CreateCustomerSessionInput.builder().build();

      graphQLClientMock.query.resolves({
        data: { createCustomerSession: { sessionId: "a-session-id" } },
      });

      const result = await gateway.createCustomerSession(input);

      assert.isTrue(result.success);
      assert.equal(result.target, "a-session-id");
    });

    it("should reject with an error for invalid input type", async () => {
      const input = {};

      try {
        await gateway.createCustomerSession(input);
        assert.fail("Expected an error to be thrown.");
      } catch (error) {
        assert.equal(
          error.message,
          "Invalid input type. Use CreateCustomerSessionInput to build the input object."
        );
      }
    });

    it("should handle GraphQL errors gracefully", async () => {
      const input = CreateCustomerSessionInput.builder().build();

      graphQLClientMock.query.rejects(new Error("GraphQL Error"));

      try {
        await gateway.createCustomerSession(input);

        assert.fail("Expected an error to be thrown.");
      } catch (error) {
        assert.ok(error.message.includes("GraphQL Error"));
      }
    });

    it("should handle unexpected exceptions", async () => {
      const input = CreateCustomerSessionInput.builder().build();

      graphQLClientMock.query.throws(new Error("Unexpected Error"));

      try {
        await gateway.createCustomerSession(input);
        assert.fail("Expected an error to be thrown.");
      } catch (error) {
        assert.ok(error.message.includes("Unexpected Error"));
      }
    });

    it("should handle GraphQL validation errors", async () => {
      const input = CreateCustomerSessionInput.builder().build();

      graphQLClientMock.query.resolves({
        errors: [
          {
            message:
              "Session IDs must be unique per merchant. Please generate a new session ID to create a new session.",
            locations: [],
            path: ["createCustomerSession"],
            extensions: {
              errorClass: "VALIDATION",
              errorType: "user_error",
              legacyCode: "1000001",
            },
          },
        ],
      });
      const result = await gateway.createCustomerSession(input);

      assert.isFalse(result.success);
      assert.ok(
        result.errors
          .deepErrors()[0]
          .message.includes("Session IDs must be unique per merchant")
      );
    });
  });

  describe("updateCustomerSession", () => {
    it("should successfully update a customer session", async () => {
      const input = UpdateCustomerSessionInput.builder("a-session-id").build();

      graphQLClientMock.query.resolves({
        data: { updateCustomerSession: { sessionId: "updated-session-id" } },
      });

      const result = await gateway.updateCustomerSession(input);

      assert.isTrue(result.success);
      assert.equal(result.target, "updated-session-id");
    });

    it("should reject with an error for invalid input type", async () => {
      const input = {};

      try {
        await gateway.updateCustomerSession(input);
        assert.fail("Expected an error to be thrown.");
      } catch (error) {
        assert.equal(
          error.message,
          "Invalid input type. Use UpdateCustomerSessionInput to build the input object."
        );
      }
    });

    it("should handle GraphQL validation errors", async () => {
      const input = UpdateCustomerSessionInput.builder("session-id").build();

      graphQLClientMock.query.resolves({
        errors: [
          {
            message:
              "Specified resource ID does not exist. Please check the resource ID and try again.",
            locations: [],
            path: ["updateCustomerSession"],
            extensions: {
              errorClass: "VALIDATION",
              errorType: "user_error",
              legacyCode: "1000002",
            },
          },
        ],
      });

      const result = await gateway.updateCustomerSession(input);

      assert.isFalse(result.success);
      assert.ok(
        result.errors.deepErrors()[0].message.includes("does not exist")
      );
    });
  });

  describe("getCustomerRecommendations", () => {
    it("should successfully retrieve customer recommendations", async () => {
      const input = CustomerRecommendationsInput.builder().build();
      const paymentRecommendation = new PaymentRecommendation(
        RecommendedPaymentOption.PAYPAL,
        1
      );
      const customerRecommendations = new CustomerRecommendations([
        paymentRecommendation,
      ]);
      const customerRecommendationsPayload = new CustomerRecommendationsPayload(
        true,
        customerRecommendations
      );

      graphQLClientMock.query.resolves({
        data: {
          generateCustomerRecommendations: {
            isInPayPalNetwork: true,
            paymentRecommendations: [
              { paymentOption: "PAYPAL", recommendedPriority: 1 },
            ],
          },
        },
      });

      const result = await gateway.getCustomerRecommendations(input);

      assert.isTrue(result.success);
      assert.deepStrictEqual(result.target, customerRecommendationsPayload);
    });

    it("should reject with an error for invalid input type", async () => {
      const input = {};

      try {
        await gateway.getCustomerRecommendations(input);
        assert.fail("Expected an error to be thrown.");
      } catch (error) {
        assert.equal(
          error.message,
          "Invalid input type. Use CustomerRecommendationsInput to build the input object."
        );
      }
    });

    it("should handle GraphQL validation errors", async () => {
      const input = CustomerRecommendationsInput.builder().build();

      graphQLClientMock.query.resolves({
        errors: [
          {
            message:
              "Specified resource ID does not exist. Please check the resource ID and try again.",
            locations: [],
            path: ["customerRecommendations"],
            extensions: {
              errorClass: "VALIDATION",
              errorType: "user_error",
              legacyCode: "1000002",
            },
          },
        ],
      });
      const result = await gateway.getCustomerRecommendations(input);

      assert.isFalse(result.success);
      assert.ok(
        result.errors.deepErrors()[0].message.includes("does not exist")
      );
    });
  });
});
