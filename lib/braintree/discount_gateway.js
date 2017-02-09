'use strict';

let Discount = require('./discount').Discount;
let Gateway = require('./gateway').Gateway;

class DiscountGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  all(callback) {
    return this.gateway.http.get(`${this.config.baseMerchantPath()}/discounts`, this.createResponseHandler('discount', Discount, callback));
  }
}

module.exports = {DiscountGateway: DiscountGateway};
