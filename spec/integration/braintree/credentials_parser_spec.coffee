require('../../spec_helper')

{CredentialsParser} = require('../../../lib/braintree/credentials_parser')

braintree = specHelper.braintree

describe "CredentialsParser", ->
  describe "parseClientCredentials", ->
    it "parses client credentials", ->
      parser = new CredentialsParser()
      parser.parseClientCredentials('client_id$development$integration_client_id', 'client_secret$development$integration_client_secret')
      assert.equal(parser.clientId, 'client_id$development$integration_client_id')
      assert.equal(parser.clientSecret, 'client_secret$development$integration_client_secret')
      assert.equal(parser.environment, braintree.Environment.Development)

    it "raises on inconsistent environment", ->
      parser = new CredentialsParser()
      assert.throws(->
        parser.parseClientCredentials('client_id$development$integration_client_id', 'client_secret$qa$integration_client_secret')
      , 'Mismatched credential environments')

    it "raises error on null clientId", ->
      parser = new CredentialsParser()
      assert.throws(->
        parser.parseClientCredentials(null, 'client_secret$qa$integration_client_secret')
      , 'Missing clientId')

    it "raises error on null clientSecret", ->
      parser = new CredentialsParser()
      assert.throws(->
        parser.parseClientCredentials('client_id$development$integration_client_id', null)
      , 'Missing clientSecret')

    it "raises error on invalid clientId", ->
      parser = new CredentialsParser()
      assert.throws(->
        parser.parseClientCredentials('client_secret$qa$integration_client_secret', 'client_secret$qa$integration_client_secret')
      , 'Value passed for clientId is not a client id')

    it "raises error on invalid clientSecret", ->
      parser = new CredentialsParser()
      assert.throws(->
        parser.parseClientCredentials('client_id$development$integration_client_id', 'client_id$development$integration_client_id')
      , 'Value passed for clientSecret is not a client secret')

  describe "parseAccessToken", ->
    it "parses an access token", ->
      parser = new CredentialsParser()
      parser.parseAccessToken('access_token$development$integration_merchant_id$f388b1cc')
      assert.equal(parser.accessToken, 'access_token$development$integration_merchant_id$f388b1cc')
      assert.equal(parser.environment, braintree.Environment.Development)
      assert.equal(parser.merchantId, 'integration_merchant_id')

    it "raises error on null accessToken", ->
      parser = new CredentialsParser()
      assert.throws(->
        parser.parseAccessToken(null)
      , 'Missing access token')

    it "raises error on invalid accessToken", ->
      parser = new CredentialsParser()
      assert.throws(->
        parser.parseAccessToken('client_id$development$integration_client_id')
      , 'Value passed for accessToken is not a valid access token')
