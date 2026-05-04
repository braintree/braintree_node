"use strict";

let Gateway = require("./gateway").Gateway;
let { LocalPaymentContext } = require("./local_payment_context");
let { GraphQLClient } = require("./graphql_client");
let exceptions = require("./exceptions");
let { errorTypes } = require("./error_types");
let wrapPrototype = require("@braintree/wrap-promise").wrapPrototype;

/**
 * Creates and manages local payment contexts.
 */
class LocalPaymentContextGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
    this._graphQLClient = this.gateway.graphQLClient;
  }

  /**
   * Creates a new local payment context.
   *
   * @param {CreateLocalPaymentContextInput} input The input parameters for creating a local payment context.
   * @return a Promise containing the result with LocalPaymentContext if successful, or errors otherwise.
   */
  create(input) {
    const CREATE_LOCAL_PAYMENT_CONTEXT =
      "mutation CreateLocalPaymentContext($input: CreateLocalPaymentContextInput!) { " +
      "  createLocalPaymentContext(input: $input) { " +
      "    paymentContext { " +
      "      id " +
      "      type " +
      "      paymentId " +
      "      approvalUrl " +
      "      merchantAccountId " +
      "      orderId " +
      "      createdAt " +
      "      transactedAt " +
      "      approvedAt " +
      "      amount { " +
      "        value " +
      "        currencyCode " +
      "      } " +
      "    } " +
      "  } " +
      "}";

    const variables = { input: input.toGraphQLVariables() };

    return this._graphQLClient
      .query(CREATE_LOCAL_PAYMENT_CONTEXT, variables)
      .then((response) => {
        const errors = GraphQLClient.getValidationErrors(response);

        if (errors) {
          return Promise.resolve(this.createErrorResult(errors));
        }

        try {
          const data = response.data;
          const result = data.createLocalPaymentContext;
          const paymentContextData = result.paymentContext;

          const paymentContext = new LocalPaymentContext(paymentContextData);

          return Promise.resolve(this.createSuccessResult(paymentContext));
        } catch (error) {
          return Promise.reject(
            new exceptions.UnexpectedError(
              "Couldn't parse response: " + error.message
            )
          );
        }
      });
  }

  /**
   * Finds a local payment context by ID.
   *
   * @param {string} id The global GraphQL ID of the local payment context.
   * @return a Promise containing the result with LocalPaymentContext if successful, or errors otherwise.
   */
  find(id) {
    const FIND_LOCAL_PAYMENT_CONTEXT =
      "query Node($id: ID!) { " +
      "  node(id: $id) { " +
      "    ... on LocalPaymentContext { " +
      "      id " +
      "      legacyId " +
      "      type " +
      "      amount { " +
      "        value " +
      "        currencyIsoCode " +
      "      } " +
      "      approvalUrl " +
      "      merchantAccountId " +
      "      transactedAt " +
      "      approvedAt " +
      "      createdAt " +
      "      updatedAt " +
      "      expiredAt " +
      "      paymentId " +
      "      orderId " +
      "    } " +
      "  } " +
      "}";

    const variables = { id: id };

    return this._graphQLClient
      .query(FIND_LOCAL_PAYMENT_CONTEXT, variables)
      .then((response) => {
        try {
          const data = response.data;
          const nodeData = data.node;

          if (!nodeData) {
            return Promise.reject(
              exceptions.NotFoundError("Local payment context not found") // eslint-disable-line new-cap
            );
          }

          const paymentContext = new LocalPaymentContext(nodeData);

          return Promise.resolve(this.createSuccessResult(paymentContext));
        } catch (error) {
          return Promise.reject(
            new exceptions.UnexpectedError(
              "Couldn't parse response: " + error.message
            )
          );
        }
      })
      .catch((error) => {
        if (error.type === errorTypes.notFoundError) {
          return Promise.reject(
            exceptions.NotFoundError("Local payment context not found") // eslint-disable-line new-cap
          );
        }

        return Promise.reject(error);
      });
  }

  createSuccessResult(target) {
    return {
      success: true,
      target: target,
    };
  }

  createErrorResult(errors) {
    return {
      success: false,
      errors: errors,
    };
  }
}

wrapPrototype(LocalPaymentContextGateway);

module.exports = { LocalPaymentContextGateway };
