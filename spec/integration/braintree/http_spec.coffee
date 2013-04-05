require('../../spec_helper')

braintree = specHelper.braintree
{Config} = require('../../../lib/braintree/config')
{Http} = require('../../../lib/braintree/http')

describe "Http", ->
  describe "request", ->
    it "returns a ServerError for 500s", (done) ->
      http = new Http(new Config(specHelper.defaultConfig))
      http.post '/test/error', '', (err, response) ->
        assert.equal(err.type, braintree.errorTypes.serverError)

        done()

    it "returns a down for maintenance error for 503s", (done) ->
      http = new Http(new Config(specHelper.defaultConfig))
      http.post '/test/maintenance', '', (err, response) ->
        assert.equal(err.type, braintree.errorTypes.downForMaintenanceError)

        done()

    it "can hit the sandbox", (done) ->
      @timeout 10000

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
      @timeout 10000

      http = new Http(new Config(
        environment: braintree.Environment.Production
        merchantId: 'node'
        publicKey: 'node'
        privateKey: 'node'
      ))

      http.get '/not_found', (err, response) ->
        assert.equal(err.type, braintree.errorTypes.notFoundError)

        done()
