'use strict';

let Gateway = require('./gateway').Gateway;
let Merchant = require('./merchant').Merchant;
let OAuthCredentials = require('./oauth_credentials').OAuthCredentials;
let wrapPrototype = require('@braintree/wrap-promise').wrapPrototype;

class MerchantGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  create(attributes) {
    return this.gateway.http.post('/merchants/create_via_api', {merchant: attributes}).then(this.responseHandler());
  }

  responseHandler() {
    let handler = this.createResponseHandler(null, null);

    return function (payload) {
      return handler(payload).then((response) => {
        if (response.success) {
          response.merchant = new Merchant(response.response.merchant);
          response.credentials = new OAuthCredentials(response.response.credentials);
          delete response.response;
        }

        return response;
      });
    };
  }
}

module.exports = {MerchantGateway: wrapPrototype(MerchantGateway)};
