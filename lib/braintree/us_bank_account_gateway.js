"use strict";

let Gateway = require("./gateway").Gateway;
let UsBankAccount = require("./us_bank_account").UsBankAccount;
let TransactionGateway = require("./transaction_gateway").TransactionGateway;
let Util = require("./util").Util;
let exceptions = require("./exceptions");
let wrapPrototype = require("@braintree/wrap-promise").wrapPrototype;

class UsBankAccountGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  find(token) {
    if (Util.isInvalidPathSegment(token)) {
      return Promise.reject(exceptions.NotFoundError("Not Found"), null); // eslint-disable-line new-cap
    }

    return this.gateway.http
      .get(
        `${this.config.baseMerchantPath()}/payment_methods/us_bank_account/${token}`
      )
      .then(function (response) {
        return new UsBankAccount(response.usBankAccount);
      });
  }

  sale(token, transactionRequest) {
    transactionRequest.paymentMethodToken = token;
    if (!transactionRequest.options) {
      transactionRequest.options = {};
    }
    transactionRequest.options.submitForSettlement = true;

    return new TransactionGateway(this.gateway).sale(transactionRequest);
  }
}

module.exports = { UsBankAccountGateway: wrapPrototype(UsBankAccountGateway) };
