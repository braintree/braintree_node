"use strict";

let Gateway = require("./gateway").Gateway;
let TransactionLineItem =
  require("./transaction_line_item").TransactionLineItem;
let exceptions = require("./exceptions");
let wrapPrototype = require("@braintree/wrap-promise").wrapPrototype;

class TransactionLineItemGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  findAll(transactionId) {
    if (transactionId.trim() === "") {
      return Promise.reject(exceptions.NotFoundError("Not Found"), null); // eslint-disable-line new-cap
    }

    return this.gateway.http
      .get(
        `${this.config.baseMerchantPath()}/transactions/${transactionId}/line_items`
      )
      .then((response) => {
        return response.lineItems.map(function (lineItem) {
          return new TransactionLineItem(lineItem);
        });
      });
  }
}

module.exports = {
  TransactionLineItemGateway: wrapPrototype(TransactionLineItemGateway, {}),
};
