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
    return this.gateway.http.get(`${this.config.baseMerchantPath()}/discounts`)
      .then(this.createResponseHandler('discount', Discount))
      .then((response) => {
        if (!response.success) {
          return response;
        }

        // NEXT_MAJOR_VERSION all the other server sdks return the collection directly, rather
        // than a response object. For now, add the discounts and success properties to the collection
        // for backwards compatibility. We can drop these at the next major version.
        const collection = response.discounts;

        collection.success = response.success;
        collection.discounts = response.discounts;

        return collection;
      });
  }
}

module.exports = {DiscountGateway: wrapPrototype(DiscountGateway)};
