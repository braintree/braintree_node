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
