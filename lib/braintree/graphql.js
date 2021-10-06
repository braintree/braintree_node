'use strict';

let Http = require('./http').Http;
let exceptions = require('./exceptions');
let wrapPrototype = require('@braintree/wrap-promise').wrapPrototype;

class GraphQL extends Http {
  constructor(config) {
    super(config);
  }

  checkGraphQLErrors(response) {
    if (!('errors' in response) || !response.errors) {
      return null;
    }

    for (let i = 0; i < response.errors.length; i++) {
      let error = response.errors[i];
      let message = error.message;

      if (!error.extensions) {
        return exceptions.UnexpectedError(`Unexpected HTTP response: ${message}`); // eslint-disable-line new-cap
      }

      switch (error.extensions.errorClass) {
        case 'VALIDATION': continue;
        case 'AUTHENTICATION': return exceptions.AuthenticationError('Authentication Error'); // eslint-disable-line new-cap
        case 'AUTHORIZATION': return exceptions.AuthorizationError('Authorization Error'); // eslint-disable-line new-cap
        case 'NOT_FOUND': return exceptions.NotFoundError('Not Found'); // eslint-disable-line new-cap
        case 'UNSUPPORTED_CLIENT': return exceptions.UpgradeRequired('Upgrade Required'); // eslint-disable-line new-cap
        case 'RESOURCE_LIMIT': return exceptions.TooManyRequestsError('Too Many Requests'); // eslint-disable-line new-cap
        case 'INTERNAL': return exceptions.ServerError('Server Error'); // eslint-disable-line new-cap
        case 'SERVICE_AVAILABILITY': return exceptions.ServiceUnavailableError('Service Unavailable'); // eslint-disable-line new-cap
        default: return exceptions.UnexpectedError(`Unexpected HTTP response: ${message}`); // eslint-disable-line new-cap
      }
    }

    return null;
  }

  headers() {
    return {
      Accept: 'application/json',
      'Braintree-Version': this.config.graphQLApiVersion,
      'Content-Type': 'application/json'
    };
  }

  request(definition, variables) {
    let graphQLRequest = {query: definition};

    if (variables) {
      graphQLRequest.variables = variables;
    }

    return super.httpRequest(
      'POST',
      this.config.baseGraphQLUrl(),
      graphQLRequest,
      null,
      this.config.environment.graphQLServer,
      this.config.environment.graphQLPort,
      this.headers()
    ).then(response => {
      const error = this.checkGraphQLErrors(response);

      if (error) {
        return Promise.reject(error);
      }

      return Promise.resolve(response);
    });
  }
}

module.exports = {GraphQL: wrapPrototype(GraphQL)};
