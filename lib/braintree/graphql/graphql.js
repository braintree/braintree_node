"use strict";
/* eslint-disable new-cap */

let Http = require("../http").Http;
let exceptions = require("../exceptions");
let wrapPrototype = require("@braintree/wrap-promise").wrapPrototype;

class GraphQL extends Http {
  constructor(config) {
    super(config);
  }

  checkGraphQLErrors(response) {
    if (!("errors" in response) || !response.errors) {
      return null;
    }

    for (let i = 0; i < response.errors.length; i++) {
      let error = response.errors[i];
      let message = error.message;

      if (!error.extensions) {
        return exceptions.UnexpectedError(
          `Unexpected HTTP response: ${message}`
        );
      }

      switch (error.extensions.errorClass) {
        case "VALIDATION":
          continue;
        case "AUTHENTICATION":
          return exceptions.AuthenticationError("Authentication Error");
        case "AUTHORIZATION":
          return exceptions.AuthorizationError("Authorization Error");
        case "NOT_FOUND":
          return exceptions.NotFoundError("Not Found");
        case "UNSUPPORTED_CLIENT":
          return exceptions.UpgradeRequired("Upgrade Required");
        case "RESOURCE_LIMIT":
          return exceptions.TooManyRequestsError("Too Many Requests");
        case "INTERNAL":
          return exceptions.ServerError("Server Error");
        case "SERVICE_AVAILABILITY":
          return exceptions.ServiceUnavailableError("Service Unavailable");
        default:
          return exceptions.UnexpectedError(
            `Unexpected HTTP response: ${message}`
          );
      }
    }

    return null;
  }

  headers() {
    return {
      Accept: "application/json",
      "Braintree-Version": this.config.graphQLApiVersion,
      "Content-Type": "application/json",
    };
  }

  request(definition, variables) {
    let graphQLRequest = { query: definition };

    if (variables) {
      graphQLRequest.variables = variables;
    }

    return super
      .httpRequest(
        "POST",
        this.config.baseGraphQLUrl(),
        graphQLRequest,
        null,
        this.config.environment.graphQLServer,
        this.config.environment.graphQLPort,
        this.headers()
      )
      .then((response) => {
        const error = this.checkGraphQLErrors(response);

        if (error) {
          return Promise.reject(error);
        }

        return Promise.resolve(response);
      });
  }
}

module.exports = { GraphQL: wrapPrototype(GraphQL) };
