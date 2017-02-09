'use strict';

let Gateway = require('./gateway').Gateway;

class DisbursementGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  transactions(disbursement, callback) {
    let transactionIds = disbursement.transactionIds;

    return this.gateway.transaction.search(search => search.ids().in(transactionIds), callback);
  }
}

module.exports = {DisbursementGateway: DisbursementGateway};
