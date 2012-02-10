require('../../spec_helper')

braintree = specHelper.braintree
{Config} = require('../../../lib/braintree/config')
{Http} = require('../../../lib/braintree/http')

vows
  .describe('Http')
  .addBatch
    'request':
      'when the http response status is 500':
        topic: ->
          http = new Http(new Config(specHelper.defaultConfig))
          http.post('/test/error', '', @callback)
          undefined
        'returns a ServerError': (err, response) ->
          assert.equal(err.type, braintree.errorTypes.serverError)

      'when the http response is 503':
        topic: ->
          http = new Http(new Config(specHelper.defaultConfig))
          http.post('/test/maintenance', '', @callback)
          undefined
        'returns a down for maintenance error': (err, response) ->
          assert.equal(err.type, braintree.errorTypes.downForMaintenanceError)

      'can hit the sandbox':
        topic: ->
          http = new Http(new Config(
            environment: braintree.Environment.Sandbox
            merchantId: 'node'
            publicKey: 'node'
            privateKey: 'node'
          ))
          http.get('/not_found', @callback)
          undefined
        'gets a not found error': (err, response) ->
          assert.equal(err.type, braintree.errorTypes.notFoundError)

      'can hit production':
        topic: ->
          http = new Http(new Config(
            environment: braintree.Environment.Production
            merchantId: 'node'
            publicKey: 'node'
            privateKey: 'node'
          ))
          http.get('/not_found', @callback)
          undefined
        'gets a not found error': (err, response) ->
          assert.equal(err.type, braintree.errorTypes.notFoundError)

  .export(module)
