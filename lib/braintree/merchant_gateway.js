'use strict';

let Gateway = require('./gateway').Gateway;
let Merchant = require('./merchant').Merchant;
let OAuthCredentials = require('./oauth_credentials').OAuthCredentials;

class MerchantGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  create(attributes, callback) {
    return this.gateway.http.post('/merchants/create_via_api', {merchant: attributes}, this.responseHandler(callback));
  }

  responseHandler(callback) {
    return this.createResponseHandler(null, null, function (err, response) {
      if (!err && response.success) {
        response.merchant = new Merchant(response.response.merchant);
        response.credentials = new OAuthCredentials(response.response.credentials);
        delete response.response;
      }
      return callback(err, response);
    });
  }
}

module.exports = {MerchantGateway: MerchantGateway};
