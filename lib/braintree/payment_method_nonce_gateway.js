'use strict';

let Gateway = require('./gateway').Gateway;
let PaymentMethodNonce = require('./payment_method_nonce').PaymentMethodNonce;

class PaymentMethodNonceGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  responseHandler(callback) {
    return this.createResponseHandler('payment_method_nonce', PaymentMethodNonce, function (err, response) {
      if (!err) {
        response.paymentMethodNonce = new PaymentMethodNonce(response.paymentMethodNonce);
      }
      return callback(err, response);
    });
  }

  create(paymentMethodToken, callback) {
    return this.gateway.http.post(`${this.config.baseMerchantPath()}/payment_methods/${paymentMethodToken}/nonces`, {}, this.responseHandler(callback));
  }

  find(paymentMethodNonce, callback) {
    return this.gateway.http.get(`${this.config.baseMerchantPath()}/payment_method_nonces/${paymentMethodNonce}`, function (err, response) {
      if (err) {
        return callback(err, null);
      }

      return callback(null, new PaymentMethodNonce(response.paymentMethodNonce));
    });
  }
}

module.exports = {PaymentMethodNonceGateway: PaymentMethodNonceGateway};
