"use strict";

const sinon = require("sinon");
const { GraphQLClient } = require("../../../lib/braintree/graphql_client");
const { Config } = require("../../../lib/braintree/config");
const {
  ValidationErrorsCollection,
} = require("../../../lib/braintree/validation_errors_collection");

describe("GraphQLClient", () => {
  let client;

  beforeEach(() => {
    const config = new Config({
      merchantId: "merchantId",
      publicKey: "publicKey",
      privateKey: "privateKey",
      environment: "development",
    });

    client = new GraphQLClient(config);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("query", () => {
    it("should call the GraphQL service with the provided definition and variables", async () => {
      const definition = "some gql";
      const variables = { some: "variables" };
      const expectedResponse = { data: "some data" };
      const stub = sinon.stub(client._service, "request");

      stub.resolves(expectedResponse);

      const response = await client.query(definition, variables);

      assert.equal(expectedResponse, response);
      sinon.assert.calledWith(stub, definition, variables);
    });

    it("should reject if the GraphQL service rejects", async () => {
      const definition = "some gql";
      const variables = { some: "variables" };
      const expectedError = new Error("some error");
      const stub = sinon.stub(client._service, "request");

      stub.rejects(expectedError);
      try {
        await client.query(definition, variables);
        assert.fail("Expected an error to be thrown.");
      } catch (err) {
        assert.equal(err, expectedError);
      }
    });
  });

  describe("getValidationErrorCode", () => {
    it("should return the legacy code if present", () => {
      const error = { extensions: { legacyCode: "12345" } };
      const code = GraphQLClient.getValidationErrorCode(error);

      assert.equal(code, "12345");
    });

    it("should return null if extensions is not present", () => {
      const error = {};
      const code = GraphQLClient.getValidationErrorCode(error);

      assert.isNull(code);
    });

    it("should return null if legacyCode is not present", () => {
      const error = { extensions: {} };
      const code = GraphQLClient.getValidationErrorCode(error);

      assert.isNull(code);
    });
  });

  describe("getValidationErrors", () => {
    it("should return null if no errors are present", () => {
      const response = {};
      const errors = GraphQLClient.getValidationErrors(response);

      assert.isNull(errors);
    });

    it("should return a ValidationErrorsCollection with the correct errors", () => {
      const response = {
        errors: [
          {
            message: "Some error message",
            extensions: { legacyCode: "12345" },
          },
          {
            message: "Another error message",
            extensions: { legacyCode: "67890" },
          },
        ],
      };
      const errors = GraphQLClient.getValidationErrors(response);

      assert.instanceOf(errors, ValidationErrorsCollection);
      assert.lengthOf(errors.deepErrors(), 2);
      assert.equal(errors.deepErrors()[0].code, "12345");
      assert.equal(errors.deepErrors()[0].message, "Some error message");
      assert.equal(errors.deepErrors()[1].code, "67890");
      assert.equal(errors.deepErrors()[1].message, "Another error message");
    });

    it("should handle errors without extensions", () => {
      const response = {
        errors: [{ message: "Some error message" }],
      };

      const errors = GraphQLClient.getValidationErrors(response);

      assert.instanceOf(errors, ValidationErrorsCollection);
      assert.lengthOf(errors.deepErrors(), 1);
      assert.isNull(errors.deepErrors()[0].code);
      assert.equal(errors.deepErrors()[0].message, "Some error message");
    });
  });
});
