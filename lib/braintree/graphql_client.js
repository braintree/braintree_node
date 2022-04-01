"use strict";

let wrapPrototype = require("@braintree/wrap-promise").wrapPrototype;
let GraphQL = require("./graphql").GraphQL;

class GraphQLClient {
  constructor(config) {
    this._service = new GraphQL(config);
  }

  query(definition, variables) {
    return this._service.request(definition, variables);
  }
}

module.exports = { GraphQLClient: wrapPrototype(GraphQLClient) };
