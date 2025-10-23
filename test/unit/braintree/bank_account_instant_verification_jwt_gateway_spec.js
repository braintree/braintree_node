"use strict";

const sinon = require("sinon");
let BankAccountInstantVerificationGateway =
  require("../../../lib/braintree/bank_account_instant_verification_gateway").BankAccountInstantVerificationGateway;
let BankAccountInstantVerificationJwtRequest =
  require("../../../lib/braintree/bank_account_instant_verification_jwt_request").BankAccountInstantVerificationJwtRequest;

describe("BankAccountInstantVerificationGateway", function () {
  let gateway, mockGateway, mockGraphQLClient;

  beforeEach(function () {
    mockGraphQLClient = {
      query: sinon.stub(),
    };

    mockGateway = {
      graphQLClient: mockGraphQLClient,
      config: {},
    };

    gateway = new BankAccountInstantVerificationGateway(mockGateway);
  });

  describe("createJwt", function () {
    it("returns success result when GraphQL succeeds", function (done) {
      let request = new BankAccountInstantVerificationJwtRequest()
        .businessName("Test Business")
        .returnUrl("https://example.com/success")
        .cancelUrl("https://example.com/cancel");

      let mockResponse = {
        data: {
          createBankAccountInstantVerificationJwt: {
            jwt: "test-jwt-token",
          },
        },
      };

      mockGraphQLClient.query.resolves(mockResponse);

      gateway
        .createJwt(request)
        .then(function (result) {
          assert.isTrue(result.success);
          assert.isObject(result.target);
          assert.equal(result.target.getJwt(), "test-jwt-token");

          // Verify GraphQL was called with correct mutation
          assert.isTrue(mockGraphQLClient.query.calledOnce);
          let calledArgs = mockGraphQLClient.query.getCall(0).args;

          assert.include(
            calledArgs[0],
            "mutation CreateBankAccountInstantVerificationJwt"
          );
          assert.include(
            calledArgs[0],
            "createBankAccountInstantVerificationJwt(input: $input)"
          );
          assert.deepEqual(calledArgs[1], request.toGraphQLVariables());

          done();
        })
        .catch(done);
    });

    it("returns error result when GraphQL returns validation errors", function (done) {
      let request = new BankAccountInstantVerificationJwtRequest()
        .businessName("")
        .returnUrl("invalid-url");

      let mockResponse = {
        errors: [
          {
            message: "Validation error",
            extensions: {},
          },
        ],
      };

      mockGraphQLClient.query.resolves(mockResponse);

      gateway
        .createJwt(request)
        .then(function (result) {
          assert.isFalse(result.success);
          assert.isObject(result.errors);

          done();
        })
        .catch(done);
    });

    it("works with minimal request", function (done) {
      let request = new BankAccountInstantVerificationJwtRequest()
        .businessName("Test Business")
        .returnUrl("https://example.com/success");

      let mockResponse = {
        data: {
          createBankAccountInstantVerificationJwt: {
            jwt: "test-jwt-token",
          },
        },
      };

      mockGraphQLClient.query.resolves(mockResponse);

      gateway
        .createJwt(request)
        .then(function (result) {
          assert.isTrue(result.success);
          assert.equal(result.target.getJwt(), "test-jwt-token");

          done();
        })
        .catch(done);
    });
  });
});
