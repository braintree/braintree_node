"use strict";

const sinon = require("sinon");
const {
  LocalPaymentContextGateway,
} = require("../../../lib/braintree/local_payment_context_gateway");
const CreateLocalPaymentContextInput = require("../../../lib/braintree/graphql/inputs/create_local_payment_context_input");
const MonetaryAmountInput = require("../../../lib/braintree/graphql/inputs/monetary_amount_input");
const {
  LocalPaymentType,
} = require("../../../lib/braintree/local_payment_type");

describe("LocalPaymentContextGateway", function () {
  let gateway, mockGateway, mockGraphQLClient;

  beforeEach(function () {
    mockGraphQLClient = {
      query: sinon.stub(),
    };

    mockGateway = {
      graphQLClient: mockGraphQLClient,
      config: {},
    };

    gateway = new LocalPaymentContextGateway(mockGateway);
  });

  describe("create", function () {
    it("returns success result when GraphQL succeeds", function (done) {
      const amount = new MonetaryAmountInput("10.00", "EUR");
      const input = new CreateLocalPaymentContextInput({
        amount: amount,
        type: LocalPaymentType.MBWAY,
      });

      const mockResponse = {
        data: {
          createLocalPaymentContext: {
            paymentContext: {
              id: "payment-context-id",
              type: "MBWAY",
              approvalUrl: "https://example.com/approve",
              amount: {
                value: "10.00",
                currencyCode: "EUR",
              },
            },
          },
        },
      };

      mockGraphQLClient.query.resolves(mockResponse);

      gateway
        .create(input)
        .then(function (result) {
          assert.isTrue(result.success);
          assert.isObject(result.target);
          assert.equal(result.target.id, "payment-context-id");
          assert.equal(result.target.type, "MBWAY");
          assert.equal(
            result.target.approvalUrl,
            "https://example.com/approve"
          );
          assert.equal(result.target.amount.value, "10.00");
          assert.equal(result.target.amount.currencyCode, "EUR");

          assert.isTrue(mockGraphQLClient.query.calledOnce);
          const calledArgs = mockGraphQLClient.query.getCall(0).args;

          assert.include(calledArgs[0], "mutation CreateLocalPaymentContext");
          assert.include(
            calledArgs[0],
            "createLocalPaymentContext(input: $input)"
          );

          done();
        })
        .catch(done);
    });

    it("returns error result when GraphQL returns validation errors", function (done) {
      const amount = new MonetaryAmountInput("10.00", "EUR");
      const input = new CreateLocalPaymentContextInput({
        amount: amount,
        type: LocalPaymentType.MBWAY,
        merchantAccountId: "invalid-merchant-account",
      });

      const mockResponse = {
        errors: [
          {
            message: "Invalid merchant account",
            extensions: {
              errorClass: "VALIDATION",
              legacyCode: "91503",
            },
          },
        ],
      };

      mockGraphQLClient.query.resolves(mockResponse);

      gateway
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
    it("returns success result when GraphQL succeeds", function (done) {
      const mockResponse = {
        data: {
          node: {
            id: "payment-context-id",
            legacyId: "legacy-123",
            type: "MBWAY",
            orderId: "order-456",
            amount: {
              value: "10.00",
              currencyIsoCode: "EUR",
            },
          },
        },
      };

      mockGraphQLClient.query.resolves(mockResponse);

      gateway
        .find("payment-context-id")
        .then(function (result) {
          assert.isTrue(result.success);
          assert.isObject(result.target);
          assert.equal(result.target.id, "payment-context-id");
          assert.equal(result.target.legacyId, "legacy-123");
          assert.equal(result.target.type, "MBWAY");
          assert.equal(result.target.orderId, "order-456");
          assert.equal(result.target.amount.value, "10.00");
          assert.equal(result.target.amount.currencyCode, "EUR");

          assert.isTrue(mockGraphQLClient.query.calledOnce);
          const calledArgs = mockGraphQLClient.query.getCall(0).args;

          assert.include(calledArgs[0], "query Node($id: ID!)");
          assert.include(calledArgs[0], "node(id: $id)");
          assert.deepEqual(calledArgs[1], { id: "payment-context-id" });

          done();
        })
        .catch(done);
    });

    it("rejects with NotFoundError when node is not found", function (done) {
      const mockResponse = {
        data: {
          node: null,
        },
      };

      mockGraphQLClient.query.resolves(mockResponse);

      gateway
        .find("non-existent-id")
        .then(function () {
          done(new Error("Expected error to be thrown"));
        })
        .catch(function (error) {
          assert.include(error.message, "Local payment context not found");
          done();
        })
        .catch(done);
    });
  });
});
