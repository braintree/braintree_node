'use strict';

let Gateway = require('./gateway').Gateway;
let Util = require('./util').Util;
let SettlementBatchSummary = require('./settlement_batch_summary').SettlementBatchSummary;

class SettlementBatchSummaryGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  generate(criteria, callback) {
    return this.gateway.http.post(
      `${this.config.baseMerchantPath()}/settlement_batch_summary`,
      {settlementBatchSummary: criteria},
      this.responseHandler(criteria, callback)
    );
  }

  responseHandler(criteria, callback) {
    return this.createResponseHandler('settlementBatchSummary', SettlementBatchSummary, (err, response) => {
      return callback(null, this.underscoreCustomField(criteria, response));
    }
    );
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

module.exports = {SettlementBatchSummaryGateway: SettlementBatchSummaryGateway};
