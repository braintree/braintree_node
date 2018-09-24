'use strict';

let DEVELOPMENT_PORT;

class Environment {
  static initClass() {
    DEVELOPMENT_PORT = process.env.GATEWAY_PORT || '3000';
    this.Development = new Environment('localhost', DEVELOPMENT_PORT, 'http://auth.venmo.dev:9292', false, 'graphql.bt.local', 8080);
    this.Qa = new Environment('gateway.qa.braintreepayments.com', '443', 'https://auth.venmo.qa2.braintreegateway.com', true, 'payments-qa.dev.braintree-api.com', '443');
    this.Sandbox = new Environment('api.sandbox.braintreegateway.com', '443', 'https://auth.sandbox.venmo.com', true, 'payments.sandbox.braintree-api.com', '443');
    this.Production = new Environment('api.braintreegateway.com', '443', 'https://auth.venmo.com', true, 'payments.braintree-api.com', '443');
  }

  constructor(server, port, authUrl, ssl, graphQLServer, graphQLPort) {
    this.server = server;
    this.port = port;
    this.authUrl = authUrl;
    this.ssl = ssl;
    this.graphQLServer = graphQLServer;
    this.graphQLPort = graphQLPort;
  }

  baseUrl() {
    let url = this.uriScheme() + this.server;

    if (this === Environment.Development) {
      url += `:${this.port}`;
    }

    return url;
  }

  baseGraphQLUrl() {
    let url = this.uriScheme() + this.graphQLServer;

    if (this === Environment.Development) {
      url += `:${this.graphQLPort}`;
    }
    url += '/graphql';

    return url;
  }

  uriScheme() {
    return this.ssl ? 'https://' : 'http://';
  }
}

Environment.initClass();

module.exports = {Environment: Environment};
