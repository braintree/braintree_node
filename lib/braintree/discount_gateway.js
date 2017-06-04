'use strict';

let Discount = require('./discount').Discount;
let Gateway = require('./gateway').Gateway;
let wrapPrototype = require('@braintree/wrap-promise').wrapPrototype;

class DiscountGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  all() {
    return this.gateway.http.get(`${this.config.baseMerchantPath()}/discounts`).then(this.createResponseHandler('discount', Discount));
  }
}

module.exports = {DiscountGateway: wrapPrototype(DiscountGateway)};
