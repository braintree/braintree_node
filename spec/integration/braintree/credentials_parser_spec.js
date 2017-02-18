'use strict';

require('../../spec_helper');

let CredentialsParser = require('../../../lib/braintree/credentials_parser').CredentialsParser;

let braintree = specHelper.braintree;

describe('CredentialsParser', function () {
  describe('parseClientCredentials', function () {
    it('parses client credentials', function () {
      let parser = new CredentialsParser();

      parser.parseClientCredentials('client_id$development$integration_client_id', 'client_secret$development$integration_client_secret');
      assert.equal(parser.clientId, 'client_id$development$integration_client_id');
      assert.equal(parser.clientSecret, 'client_secret$development$integration_client_secret');
      return assert.equal(parser.environment, braintree.Environment.Development);
    });

    it('raises on inconsistent environment', function () {
      let parser = new CredentialsParser();

      return assert.throws(() => parser.parseClientCredentials('client_id$development$integration_client_id', 'client_secret$qa$integration_client_secret')
      , 'Mismatched credential environments');
    });

    it('raises error on null clientId', function () {
      let parser = new CredentialsParser();

      return assert.throws(() => parser.parseClientCredentials(null, 'client_secret$qa$integration_client_secret')
      , 'Missing clientId');
    });

    it('raises error on null clientSecret', function () {
      let parser = new CredentialsParser();

      return assert.throws(() => parser.parseClientCredentials('client_id$development$integration_client_id', null)
      , 'Missing clientSecret');
    });

    it('raises error on invalid clientId', function () {
      let parser = new CredentialsParser();

      return assert.throws(() => parser.parseClientCredentials('client_secret$qa$integration_client_secret', 'client_secret$qa$integration_client_secret')
      , 'Value passed for clientId is not a client id');
    });

    return it('raises error on invalid clientSecret', function () {
      let parser = new CredentialsParser();

      return assert.throws(() => parser.parseClientCredentials('client_id$development$integration_client_id', 'client_id$development$integration_client_id')
      , 'Value passed for clientSecret is not a client secret');
    });
  });

  return describe('parseAccessToken', function () {
    it('parses an access token', function () {
      let parser = new CredentialsParser();

      parser.parseAccessToken('access_token$development$integration_merchant_id$f388b1cc');
      assert.equal(parser.accessToken, 'access_token$development$integration_merchant_id$f388b1cc');
      assert.equal(parser.environment, braintree.Environment.Development);
      return assert.equal(parser.merchantId, 'integration_merchant_id');
    });

    it('raises error on null accessToken', function () {
      let parser = new CredentialsParser();

      return assert.throws(() => parser.parseAccessToken(null)
      , 'Missing access token');
    });

    return it('raises error on invalid accessToken', function () {
      let parser = new CredentialsParser();

      return assert.throws(() => parser.parseAccessToken('client_id$development$integration_client_id')
      , 'Value passed for accessToken is not a valid access token');
    });
  });
});
