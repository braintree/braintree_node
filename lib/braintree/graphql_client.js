"use strict";

let wrapPrototype = require("@braintree/wrap-promise").wrapPrototype;
let GraphQL = require("./graphql").GraphQL;
let ValidationErrorsCollection =
  require("./validation_errors_collection").ValidationErrorsCollection;

class GraphQLClient {
  constructor(config) {
    this._service = new GraphQL(config);
  }

  query(definition, variables) {
    return this._service.request(definition, variables);
  }

  static getValidationErrorCode(error) {
    const extensions = error.extensions;

    if (!extensions) {
      return null;
    }

    const code = extensions.legacyCode;

    if (!code) {
      return null;
    }

    return code;
  }

  static getValidationErrors(response) {
    const errors = response.errors;

    if (!errors) {
      return null;
    }

    const validationErrors = [];

    for (const error of errors) {
      validationErrors.push({
        attribute: "", // The GraphQL response doesn't include an attribute
        code: this.getValidationErrorCode(error),
        message: error.message,
      });
    }

    const validationErrorsCollection = new ValidationErrorsCollection({
      errors: validationErrors,
    });

    return validationErrorsCollection;
  }
}

module.exports = { GraphQLClient: wrapPrototype(GraphQLClient) };
