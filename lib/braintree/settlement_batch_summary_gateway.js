'use strict';

let Gateway = require('./gateway').Gateway;
let Util = require('./util').Util;
let SettlementBatchSummary = require('./settlement_batch_summary').SettlementBatchSummary;
let wrapPrototype = require('@braintree/wrap-promise').wrapPrototype;

class SettlementBatchSummaryGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  generate(criteria) {
    return this.gateway.http.post(`${this.config.baseMerchantPath()}/settlement_batch_summary`, {
      settlementBatchSummary: criteria
    }).then(this.responseHandler(criteria));
  }

  responseHandler(criteria) {
    let handler = this.createResponseHandler('settlementBatchSummary', SettlementBatchSummary);

    return (payload) => {
      return handler(payload).then((response) => {
        return this.underscoreCustomField(criteria, response);
      });
    };
  }

  underscoreCustomField(criteria, response) {
    if (response.success && 'groupByCustomField' in criteria) {
      let camelCustomField = Util.toCamelCase(criteria.groupByCustomField);

      for (let record of response.settlementBatchSummary.records) {
        record[criteria.groupByCustomField] = record[camelCustomField];
        record[camelCustomField] = null;
      }
    }

    return response;
  }
}

module.exports = {SettlementBatchSummaryGateway: wrapPrototype(SettlementBatchSummaryGateway)};
