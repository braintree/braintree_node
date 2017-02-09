'use strict';

let Gateway = require('./gateway').Gateway;
let CoinbaseAccount = require('./coinbase_account').CoinbaseAccount;
let exceptions = require('./exceptions');

class CoinbaseAccountGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  find(token, callback) {
    if (token.trim() === '') {
      return callback(exceptions.NotFoundError('Not Found'), null); // eslint-disable-line new-cap
    }

    return this.gateway.http.get(`${this.config.baseMerchantPath()}/payment_methods/coinbase_account/${token}`, function (err, response) {
      if (err) {
        return callback(err, null);
      }
      return callback(null, new CoinbaseAccount(response.coinbaseAccount));
    });
  }

  delete(token, callback) {
    return this.gateway.http.delete(`${this.config.baseMerchantPath()}/payment_methods/coinbase_account/${token}`, callback);
  }

  responseHandler(callback) {
    return this.createResponseHandler('coinbaseAccount', CoinbaseAccount, callback);
  }
}

module.exports = {CoinbaseAccountGateway: CoinbaseAccountGateway};
