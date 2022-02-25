"use strict";

let Gateway = require("./gateway").Gateway;
let Environment = require("./environment").Environment;
let exceptions = require("./exceptions");
let wrapPrototype = require("@braintree/wrap-promise").wrapPrototype;

class TestingGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  settle(transactionId) {
    return this.settlementOperationWithEnvironmentCheck(
      transactionId,
      "settle"
    );
  }

  settlementPending(transactionId) {
    return this.settlementOperationWithEnvironmentCheck(
      transactionId,
      "settlement_pending"
    );
  }

  settlementConfirm(transactionId) {
    return this.settlementOperationWithEnvironmentCheck(
      transactionId,
      "settlement_confirm"
    );
  }

  settlementDecline(transactionId) {
    return this.settlementOperationWithEnvironmentCheck(
      transactionId,
      "settlement_decline"
    );
  }

  settlementOperationWithEnvironmentCheck(transactionId, operation) {
    if (this.config.environment === Environment.Production) {
      return Promise.reject(
        // eslint-disable-next-line new-cap
        exceptions.TestOperationPerformedInProductionError(
          "Test operation performed in production"
        ),
        null
      );
    }

    return this.gateway.http.put(
      `${this.config.baseMerchantPath()}/transactions/${transactionId}/${operation}`,
      null
    );
  }
}

module.exports = { TestingGateway: wrapPrototype(TestingGateway) };
