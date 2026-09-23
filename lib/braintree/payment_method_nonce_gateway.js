"use strict";

let Gateway = require("./gateway").Gateway;
let Util = require("./util").Util;
let PaymentMethodNonce = require("./payment_method_nonce").PaymentMethodNonce;
let exceptions = require("./exceptions");
let wrapPrototype = require("@braintree/wrap-promise").wrapPrototype;

class PaymentMethodNonceGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  responseHandler() {
    let handler = this.createResponseHandler(
      "payment_method_nonce",
      PaymentMethodNonce
    );

    return function (payload) {
      return handler(payload).then((response) => {
        response.paymentMethodNonce = new PaymentMethodNonce(
          response.paymentMethodNonce
        );

        return response;
      });
    };
  }

  create(paymentMethodToken, params) {
    if (Util.isInvalidPathSegment(paymentMethodToken)) {
      return Promise.reject(exceptions.NotFoundError("Not Found")); // eslint-disable-line new-cap
    }

    let schema = {
      valid: [
        "paymentMethodNonce[merchantAccountId]",
        "paymentMethodNonce[authenticationInsight]",
        "paymentMethodNonce[authenticationInsightOptions][amount]",
        "paymentMethodNonce[authenticationInsightOptions][recurringCustomerConsent]",
        "paymentMethodNonce[authenticationInsightOptions][recurringMaxAmount]",
      ],
    };

    let invalidKeysError = Util.verifyKeys(schema, params);

    if (invalidKeysError) {
      return Promise.reject(invalidKeysError);
    }

    return this.gateway.http
      .post(
        `${this.config.baseMerchantPath()}/payment_methods/${paymentMethodToken}/nonces`,
        params
      )
      .then(this.responseHandler());
  }

  find(paymentMethodNonce) {
    if (Util.isInvalidPathSegment(paymentMethodNonce)) {
      return Promise.reject(exceptions.NotFoundError("Not Found")); // eslint-disable-line new-cap
    }

    return this.gateway.http
      .get(
        `${this.config.baseMerchantPath()}/payment_method_nonces/${paymentMethodNonce}`
      )
      .then((response) => {
        return new PaymentMethodNonce(response.paymentMethodNonce);
      });
  }
}

module.exports = {
  PaymentMethodNonceGateway: wrapPrototype(PaymentMethodNonceGateway),
};
