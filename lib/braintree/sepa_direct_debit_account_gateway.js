"use strict";

let Gateway = require("./gateway").Gateway;
let SepaDirectDebitAccount =
  require("./sepa_direct_debit_account").SepaDirectDebitAccount;
let exceptions = require("./exceptions");
let wrapPrototype = require("@braintree/wrap-promise").wrapPrototype;

class SepaDirectDebitAccountGateway extends Gateway {
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
        `${this.config.baseMerchantPath()}/payment_methods/sepa_debit_account/${token}`
      )
      .then((response) => {
        return new SepaDirectDebitAccount(response.sepaDebitAccount);
      });
  }

  delete(token) {
    let path = `${this.config.baseMerchantPath()}/payment_methods/sepa_debit_account/${token}`;

    return this.gateway.http.delete(path);
  }

  responseHandler() {
    return this.createResponseHandler(
      "sepa_direct_debitAccount",
      SepaDirectDebitAccount
    );
  }
}

module.exports = {
  SepaDirectDebitAccountGateway: wrapPrototype(SepaDirectDebitAccountGateway),
};
