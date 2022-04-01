"use strict";

let Gateway = require("./gateway").Gateway;
let PayPalAccount = require("./paypal_account").PayPalAccount;
let exceptions = require("./exceptions");
let wrapPrototype = require("@braintree/wrap-promise").wrapPrototype;

class PayPalAccountGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  find(token) {
    if (token.trim() === "") {
      return Promise.reject(exceptions.NotFoundError("Not Found"), null); // eslint-disable-line new-cap
    }

    return this.gateway.http
      .get(
        `${this.config.baseMerchantPath()}/payment_methods/paypal_account/${token}`
      )
      .then((response) => {
        return new PayPalAccount(response.paypalAccount);
      });
  }

  update(token, attributes) {
    return this.gateway.http
      .put(
        `${this.config.baseMerchantPath()}/payment_methods/paypal_account/${token}`,
        { paypalAccount: attributes }
      )
      .then(this.responseHandler());
  }

  delete(token) {
    let path = `${this.config.baseMerchantPath()}/payment_methods/paypal_account/${token}`;

    return this.gateway.http.delete(path);
  }

  responseHandler() {
    return this.createResponseHandler("paypalAccount", PayPalAccount);
  }
}

module.exports = { PayPalAccountGateway: wrapPrototype(PayPalAccountGateway) };
