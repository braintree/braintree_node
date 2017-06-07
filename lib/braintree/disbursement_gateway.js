'use strict';

let Gateway = require('./gateway').Gateway;
let wrapPrototype = require('@braintree/wrap-promise').wrapPrototype;

class DisbursementGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  transactions(disbursement) {
    let transactionIds = disbursement.transactionIds;

    return new Promise((resolve, reject) => {
      this.gateway.transaction.search((search) => {
        search.ids().in(transactionIds);
      }, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  }
}

module.exports = {DisbursementGateway: wrapPrototype(DisbursementGateway)};
