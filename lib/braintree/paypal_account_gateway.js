'use strict';

let Gateway = require('./gateway').Gateway;
let PayPalAccount = require('./paypal_account').PayPalAccount;
let exceptions = require('./exceptions');

class PayPalAccountGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  find(token, callback) {
    if (token.trim() === '') {
      return callback(exceptions.NotFoundError('Not Found'), null); // eslint-disable-line new-cap
    }

    return this.gateway.http.get(`${this.config.baseMerchantPath()}/payment_methods/paypal_account/${token}`, function (err, response) {
      if (err) {
        return callback(err, null);
      }

      return callback(null, new PayPalAccount(response.paypalAccount));
    });
  }

  update(token, attributes, callback) {
    return this.gateway.http.put(`${this.config.baseMerchantPath()}/payment_methods/paypal_account/${token}`, {paypalAccount: attributes}, this.responseHandler(callback));
  }

  delete(token, callback) {
    return this.gateway.http.delete(`${this.config.baseMerchantPath()}/payment_methods/paypal_account/${token}`, callback);
  }

  responseHandler(callback) {
    return this.createResponseHandler('paypalAccount', PayPalAccount, callback);
  }
}

module.exports = {PayPalAccountGateway: PayPalAccountGateway};
