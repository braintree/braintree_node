"use strict";

let Gateway = require("./gateway").Gateway;
let {
  BankAccountInstantVerificationJwt,
} = require("./bank_account_instant_verification_jwt");
let { GraphQLClient } = require("./graphql_client");
let exceptions = require("./exceptions");
let wrapPrototype = require("@braintree/wrap-promise").wrapPrototype;

/**
 * Provides methods to interact with Bank Account Instant Verification functionality.
 *
 * This gateway enables merchants to create JWTs for initiating the Open Banking flow
 * and retrieve bank account details for display purposes.
 */
class BankAccountInstantVerificationGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
    this._graphQLClient = this.gateway.graphQLClient;
  }

  /**
   * Creates a Bank Account Instant Verification JWT for initiating the Open Banking flow.
   *
   * @param {BankAccountInstantVerificationJwtRequest} request the JWT creation request containing business name and redirect URLs
   * @return a Promise containing the JWT token
   */
  createJwt(request) {
    const CREATE_TOKEN_MUTATION =
      "mutation CreateBankAccountInstantVerificationJwt($input: CreateBankAccountInstantVerificationJwtInput!) { " +
      "createBankAccountInstantVerificationJwt(input: $input) {" +
      "    jwt" +
      "  }" +
      "}";

    return this._graphQLClient
      .query(CREATE_TOKEN_MUTATION, request.toGraphQLVariables())
      .then((response) => {
        const errors = GraphQLClient.getValidationErrors(response);

        if (errors) {
          return Promise.resolve(this.createErrorResult(errors));
        }

        try {
          const data = response.data;
          const result = data.createBankAccountInstantVerificationJwt;

          const jwt = result.jwt;

          const jwtObject = new BankAccountInstantVerificationJwt({
            jwt: jwt,
          });

          return Promise.resolve(this.createSuccessResult(jwtObject));
        } catch (error) {
          return Promise.reject(
            new exceptions.UnexpectedException(
              "Couldn't parse response: " + error.message
            )
          );
        }
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

wrapPrototype(BankAccountInstantVerificationGateway);

module.exports = { BankAccountInstantVerificationGateway };
