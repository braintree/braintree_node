require('../../spec_helper')

{TransparentRedirectGateway} = require('../../../lib/braintree/transparent_redirect_gateway')

vows
  .describe('TransparentRedirectGateway')
  .addBatch
    'url':
      'sandbox environment':
        topic: ->
          sandboxConfig = {
            environment: braintree.Environment.Sandbox
            merchantId: 'integration_merchant_id'
          }
          new TransparentRedirectGateway(braintree.connect(sandboxConfig))
        'gives full dev url': (result) ->
          assert.equal(result.url, 'https://sandbox.braintreegateway.com/merchants/integration_merchant_id/transparent_redirect_requests')
      'production environment':
        topic: ->
          sandboxConfig = {
            environment: braintree.Environment.Production
            merchantId: 'integration_merchant_id'
          }
          new TransparentRedirectGateway(braintree.connect(sandboxConfig))
        'gives full dev url': (result) ->
          assert.equal(result.url, 'https://www.braintreegateway.com/merchants/integration_merchant_id/transparent_redirect_requests')
      'development environment':
        topic: ->
          sandboxConfig = {
            environment: braintree.Environment.Development
            merchantId: 'integration_merchant_id'
          }
          new TransparentRedirectGateway(braintree.connect(sandboxConfig))
        'gives full dev url': (result) ->
          assert.equal(result.url, "http://localhost:#{result.gateway.config.environment.port}/merchants/integration_merchant_id/transparent_redirect_requests")
  .export(module)
