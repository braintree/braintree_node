require('../../spec_helper')

{TransparentRedirectGateway} = require('../../../lib/braintree/transparent_redirect_gateway')

describe "TransparentRedirectGateway", ->
  describe "url", ->
    it "gives the correct url for sandbox", ->
      config = {
        environment: braintree.Environment.Sandbox
        merchantId: 'integration_merchant_id'
      }
      gateway = new TransparentRedirectGateway(braintree.connect(config))

      assert.equal(gateway.url, 'https://sandbox.braintreegateway.com/merchants/integration_merchant_id/transparent_redirect_requests')

    it "gives the correct url for the production environment", ->
      config = {
        environment: braintree.Environment.Production
        merchantId: 'integration_merchant_id'
      }
      gateway = new TransparentRedirectGateway(braintree.connect(config))

      assert.equal(gateway.url, 'https://www.braintreegateway.com/merchants/integration_merchant_id/transparent_redirect_requests')

    it "gives the correct url for the development environment", ->
      config = {
        environment: braintree.Environment.Development
        merchantId: 'integration_merchant_id'
      }
      gateway = new TransparentRedirectGateway(braintree.connect(config))

      assert.equal(gateway.url, "http://localhost:#{gateway.gateway.config.environment.port}/merchants/integration_merchant_id/transparent_redirect_requests")
