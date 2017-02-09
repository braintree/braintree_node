'use strict';

let DEVELOPMENT_PORT;

class Environment {
  static initClass() {
    DEVELOPMENT_PORT = process.env.GATEWAY_PORT || '3000';
    this.Development = new Environment('localhost', DEVELOPMENT_PORT, 'http://auth.venmo.dev:9292', false);
    this.Qa = new Environment('gateway.qa.braintreepayments.com', '443', 'https://auth.venmo.qa2.braintreegateway.com', true);
    this.Sandbox = new Environment('api.sandbox.braintreegateway.com', '443', 'https://auth.sandbox.venmo.com', true);
    this.Production = new Environment('api.braintreegateway.com', '443', 'https://auth.venmo.com', true);
  }

  constructor(server, port, authUrl, ssl) {
    this.server = server;
    this.port = port;
    this.authUrl = authUrl;
    this.ssl = ssl;
  }

  baseUrl() {
    let url = this.uriScheme() + this.server;

    if (this === Environment.Development) {
      url += `:${this.port}`;
    }

    return url;
  }

  uriScheme() {
    return this.ssl ? 'https://' : 'http://';
  }
}
Environment.initClass();

module.exports = {Environment: Environment};
