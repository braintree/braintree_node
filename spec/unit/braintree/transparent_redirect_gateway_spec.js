require('../../spec_helper');
let braintree = require('../../../lib/braintree');

let { TransparentRedirectGateway } = require('../../../lib/braintree/transparent_redirect_gateway');

describe("TransparentRedirectGateway", () =>
  describe("url", function() {
    it("gives the correct url for sandbox", function() {
      let config = {
        environment: braintree.Environment.Sandbox,
        merchantId: 'integration_merchant_id',
        publicKey: 'integration_public_key',
        privateKey: 'integration_private_key'
      };
      let gateway = new TransparentRedirectGateway(braintree.connect(config));

      return assert.equal(gateway.url, 'https://api.sandbox.braintreegateway.com/merchants/integration_merchant_id/transparent_redirect_requests');
    });

    it("gives the correct url for the production environment", function() {
      let config = {
        environment: braintree.Environment.Production,
        merchantId: 'integration_merchant_id',
        publicKey: 'integration_public_key',
        privateKey: 'integration_private_key'
      };
      let gateway = new TransparentRedirectGateway(braintree.connect(config));

      return assert.equal(gateway.url, 'https://api.braintreegateway.com/merchants/integration_merchant_id/transparent_redirect_requests');
    });

    return it("gives the correct url for the development environment", function() {
      let config = {
        environment: braintree.Environment.Development,
        merchantId: 'integration_merchant_id',
        publicKey: 'integration_public_key',
        privateKey: 'integration_private_key'
      };
      let gateway = new TransparentRedirectGateway(braintree.connect(config));

      return assert.equal(gateway.url, `http://localhost:${gateway.gateway.config.environment.port}/merchants/integration_merchant_id/transparent_redirect_requests`);
    });
  })
);
