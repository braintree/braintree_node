require('../../spec_helper')

braintree = specHelper.braintree
{Config} = require('../../../lib/braintree/config')
{Http} = require('../../../lib/braintree/http')
{Environment} = require('../../../lib/braintree/environment')

describe "Http", ->
  describe "request", ->
    it "returns a ServerError for 500s", (done) ->
      http = new Http(new Config(specHelper.defaultConfig))
      http.post '/test/error', '', (err, response) ->
        assert.equal(err.type, braintree.errorTypes.serverError)

        done()

    it "can hit the sandbox", (done) ->

      http = new Http(new Config(
        environment: braintree.Environment.Sandbox
        merchantId: 'node'
        publicKey: 'node'
        privateKey: 'node'
      ))

      http.get '/not_found', (err, response) ->
        assert.equal(err.type, braintree.errorTypes.notFoundError)

        done()

    it "can hit production", (done) ->

      http = new Http(new Config(
        environment: braintree.Environment.Production
        merchantId: 'node'
        publicKey: 'node'
        privateKey: 'node'
      ))

      http.get '/not_found', (err, response) ->
        assert.equal(err.type, braintree.errorTypes.notFoundError)

        done()

    it "returns timeout errors", (done) ->
      config = new Config(
        environment: new Environment('not_a_subdomain.braintreegateway.com', '12345', false)
        merchantId: 'node'
        publicKey: 'node'
        privateKey: 'node'
      )
      config.timeout = 1
      http = new Http(config)

      http.get '/not_a_real_url', (err, response) ->
        assert.equal(err.type, braintree.errorTypes.unexpectedError)
        assert.equal(err.message, 'Request timed out')

        done()

    it "returns errors to the callback", (done) ->
      config = new Config(
        environment: new Environment('not_a_subdomain.braintreegateway.com', '12345', false)
        merchantId: 'node'
        publicKey: 'node'
        privateKey: 'node'
      )
      http = new Http(config)

      http.get '/not_a_real_url', (err, response) ->
        assert.equal(err.type, braintree.errorTypes.unexpectedError)
        assert.match(err.message, /Unexpected request error:/)

        done()
