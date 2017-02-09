'use strict';

let Gateway = require('./gateway').Gateway;
let Environment = require('./environment').Environment;
let exceptions = require('./exceptions');

class TestingGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  settle(transactionId, callback) {
    return this.settlementOperationWithEnvironmentCheck(transactionId, 'settle', callback);
  }

  settlementPending(transactionId, callback) {
    return this.settlementOperationWithEnvironmentCheck(transactionId, 'settlement_pending', callback);
  }

  settlementConfirm(transactionId, callback) {
    return this.settlementOperationWithEnvironmentCheck(transactionId, 'settlement_confirm', callback);
  }

  settlementDecline(transactionId, callback) {
    return this.settlementOperationWithEnvironmentCheck(transactionId, 'settlement_decline', callback);
  }

  settlementOperationWithEnvironmentCheck(transactionId, operation, callback) {
    if (this.config.environment === Environment.Production) {
      return callback(exceptions.TestOperationPerformedInProductionError('Test operation performed in production'), null); // eslint-disable-line new-cap
    }

    return this.gateway.http.put(
      `${this.config.baseMerchantPath()}/transactions/${transactionId}/${operation}`,
      null,
      callback
    );
  }
}

module.exports = {TestingGateway: TestingGateway};
