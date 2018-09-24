'use strict';

let braintree = specHelper.braintree;
let Config = require('../../../lib/braintree/config').Config;
let GraphQL = require('../../../lib/braintree/graphql').GraphQL;
let Environment = require('../../../lib/braintree/environment').Environment;

describe('GraphQL', () =>
  describe('request', () => {
    describe('ssl', () => {
      let ping = 'query { ping }';

      it('makes successful http requests in development', (done) => {
        let config = Object.assign({}, specHelper.defaultConfig, {environment: Environment.Development});
        let graphQL = new GraphQL(new Config(config));

        graphQL.request(ping, null, (err, response) => {
          assert.notExists(response.errors);
          assert.equal(response.data.ping, 'pong');
          done();
        });
      });

      it('makes successful https requests in sandbox', (done) => {
        let config = Object.assign({}, specHelper.defaultConfig, {environment: Environment.Sandbox});
        let graphQL = new GraphQL(new Config(config));

        graphQL.request(ping, null, (err) => {
          assert.equal(err.type, braintree.errorTypes.authenticationError);
          done();
        });
      });

      it('makes successful https requests in production', (done) => {
        let config = Object.assign({}, specHelper.defaultConfig, {environment: Environment.Production});
        let graphQL = new GraphQL(new Config(config));

        graphQL.request(ping, null, (err) => {
          assert.equal(err.type, braintree.errorTypes.authenticationError);
          done();
        });
      });
    });

    it('is successful for a valid request with variables', (done) => {
      let graphQL = new GraphQL(new Config(specHelper.defaultConfig));

      let definition = `
mutation CreateClientToken($input: CreateClientTokenInput!) {
  createClientToken(input: $input) {
    clientMutationId
    clientToken
  }
}`;
      let variables = {
        input: {
          clientMutationId: 'abc123',
          clientToken: {
            merchantAccountId: 'ABC123'
          }
        }
      };

      graphQL.request(definition, variables, (err, response) => {
        assert.notExists(response.errors);
        assert.typeOf(response.data.createClientToken.clientToken, 'string');
        done();
      });
    });

    it('returns a parsable error response when unsuccessful', (done) => {
      let graphQL = new GraphQL(new Config(specHelper.defaultConfig));

      let definition = `
query TransactionLevelFeeReport($date: Date!, $merchantAccountId: ID) {
  report {
      transactionLevelFees(date: $date, merchantAccountId: $merchantAccountId) {
          url
      }
  }
}`;
      let variables = {
        date: '2018-01-01',
        merchantAccountId: 'some_merchant'
      };

      graphQL.request(definition, variables, (err, response) => {
        assert.equal(response.errors[0].message, 'Invalid merchant account id: some_merchant');
        done();
      });
    });
  })
);
