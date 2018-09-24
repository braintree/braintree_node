'use strict';

let braintree = specHelper.braintree;
let Config = require('../../../lib/braintree/config').Config;
let GraphQL = require('../../../lib/braintree/graphql').GraphQL;

describe('GraphQL', function () {
  describe('checkGraphQLErrors', function () {
    it('returns a null for non-error responses', function () {
      let graphQL = new GraphQL(new Config(specHelper.defaultConfig));
      let response = {
        data: 'successful_result'
      };

      assert.equal(graphQL.checkGraphQLErrors(response), null);
    });

    let exceptions = {
      AUTHENTICATION: braintree.errorTypes.authenticationError,
      AUTHORIZATION: braintree.errorTypes.authorizationError,
      NOT_FOUND: braintree.errorTypes.notFoundError,
      UNSUPPORTED_CLIENT: braintree.errorTypes.upgradeRequired,
      RESOURCE_LIMIT: braintree.errorTypes.tooManyRequestsError,
      INTERNAL: braintree.errorTypes.serverError,
      SERVICE_AVAILABILITY: braintree.errorTypes.downForMaintenanceError,
      UNDOCUMENTED_ERROR: braintree.errorTypes.unexpectedError
    };

    Object.keys(exceptions).forEach(function (errorClass) {
      let expectedException = exceptions[errorClass];

      it('returns exception for ' + errorClass + ' response', function () {
        let graphQL = new GraphQL(new Config(specHelper.defaultConfig));
        let response = {
          errors: [
            {
              message: 'error_message',
              extensions: {
                errorClass: errorClass
              }
            }
          ]
        };

        assert.equal(graphQL.checkGraphQLErrors(response).type, expectedException);
      });
    });

    it('does not return an exception for VALIDATION response', function () {
      let graphQL = new GraphQL(new Config(specHelper.defaultConfig));
      let response = {
        errors: [
          {
            message: 'validation_error',
            extensions: {
              errorClass: 'VALIDATION'
            }
          }
        ]
      };

      assert.equal(graphQL.checkGraphQLErrors(response), null);
    });

    it('returns an exception if both VALIDATION and another error are present in the response', function () {
      let graphQL = new GraphQL(new Config(specHelper.defaultConfig));
      let response = {
        errors: [
          {
            message: 'validation_error',
            extensions: {
              errorClass: 'VALIDATION'
            }
          },
          {
            message: 'error_message',
            extensions: {
              errorClass: 'AUTHORIZATION'
            }
          }
        ]
      };

      assert.equal(graphQL.checkGraphQLErrors(response).type, braintree.errorTypes.authorizationError);
    });
  });
});
