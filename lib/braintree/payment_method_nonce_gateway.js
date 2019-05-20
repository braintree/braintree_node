'use strict';

let Gateway = require('./gateway').Gateway;
let PaymentMethodNonce = require('./payment_method_nonce').PaymentMethodNonce;
let wrapPrototype = require('@braintree/wrap-promise').wrapPrototype;

class PaymentMethodNonceGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  responseHandler() {
    let handler = this.createResponseHandler('payment_method_nonce', PaymentMethodNonce);

    return function (payload) {
      return handler(payload).then((response) => {
        response.paymentMethodNonce = new PaymentMethodNonce(response.paymentMethodNonce);

        return response;
      });
    };
  }

  create(paymentMethodToken) {
    return this.gateway.http.post(`${this.config.baseMerchantPath()}/payment_methods/${paymentMethodToken}/nonces`, {}).then(this.responseHandler());
  }

  find(paymentMethodNonce) {
    return this.gateway.http.get(`${this.config.baseMerchantPath()}/payment_method_nonces/${paymentMethodNonce}`).then((response) => {
      return new PaymentMethodNonce(response.paymentMethodNonce);
    });
  }
}

module.exports = {PaymentMethodNonceGateway: wrapPrototype(PaymentMethodNonceGateway)};
