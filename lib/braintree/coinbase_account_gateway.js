'use strict';

let Gateway = require('./gateway').Gateway;
let CoinbaseAccount = require('./coinbase_account').CoinbaseAccount;
let exceptions = require('./exceptions');
let wrapPrototype = require('@braintree/wrap-promise').wrapPrototype;

class CoinbaseAccountGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  find(token) {
    if (token.trim() === '') {
      return Promise.reject(exceptions.NotFoundError('Not Found')); // eslint-disable-line new-cap
    }

    return this.gateway.http.get(`${this.config.baseMerchantPath()}/payment_methods/coinbase_account/${token}`).then(function (response) {
      return new CoinbaseAccount(response.coinbaseAccount);
    });
  }

  delete(token) {
    return this.gateway.http.delete(`${this.config.baseMerchantPath()}/payment_methods/coinbase_account/${token}`);
  }

  responseHandler() {
    return this.createResponseHandler('coinbaseAccount', CoinbaseAccount);
  }
}

module.exports = {CoinbaseAccountGateway: wrapPrototype(CoinbaseAccountGateway)};
