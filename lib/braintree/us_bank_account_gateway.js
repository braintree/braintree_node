'use strict';

let Gateway = require('./gateway').Gateway;
let UsBankAccount = require('./us_bank_account').UsBankAccount;
let TransactionGateway = require('./transaction_gateway').TransactionGateway;
let exceptions = require('./exceptions');

class UsBankAccountGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  find(token, callback) {
    if (token.trim() === '') {
      return callback(exceptions.NotFoundError('Not Found'), null); // eslint-disable-line new-cap
    }

    return this.gateway.http.get(`${this.config.baseMerchantPath()}/payment_methods/us_bank_account/${token}`, function (err, response) {
      if (err) {
        return callback(err, null);
      }

      return callback(null, new UsBankAccount(response.usBankAccount));
    });
  }

  sale(token, transactionRequest, callback) {
    transactionRequest.paymentMethodToken = token;
    if (!transactionRequest.options) { transactionRequest.options = {}; }
    transactionRequest.options.submitForSettlement = true;
    return new TransactionGateway(this.gateway).sale(transactionRequest, callback);
  }
}

module.exports = {UsBankAccountGateway: UsBankAccountGateway};
