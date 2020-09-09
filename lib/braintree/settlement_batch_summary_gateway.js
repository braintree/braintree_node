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
    /*
     * The response from the gateway API uses snake_case keys and the
     * Node SDK automatically transforms the keys to camelCase. This
     * works for everything except for merchant defined custom fields
     * as param values. Since these come back in the settlement batch
     * summary response as keys in the object, the Node SDK
     * accidentally changes them to camelCase. This function determines
     * if the custom field passed in by the merchant is snake_case and
     * if so, transforms the camelCased version back to the version the
     * merchant originally passed in (snake_case).
     */
    if (response.success && 'groupByCustomField' in criteria) {
      // if the custom field has no _, then no need to do transformation
      if (criteria.groupByCustomField.indexOf('_') === -1) {
        return response;
      }

      let camelCustomField = Util.toCamelCase(criteria.groupByCustomField);

      /*
       * loop through the records to add the merchant provided
       * snake_case param to the response and remove the camelCase
       * version that was accidentally applied in the response parsing
       */
      for (let record of response.settlementBatchSummary.records) {
        record[criteria.groupByCustomField] = record[camelCustomField];
        delete record[camelCustomField];
      }
    }

    return response;
  }
}

module.exports = {SettlementBatchSummaryGateway: wrapPrototype(SettlementBatchSummaryGateway)};
