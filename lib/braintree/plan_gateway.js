'use strict';

let Gateway = require('./gateway').Gateway;
let Plan = require('./plan').Plan;
let wrapPrototype = require('@braintree/wrap-promise').wrapPrototype;

class PlanGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  all() {
    return this.gateway.http.get(`${this.config.baseMerchantPath()}/plans`)
      .then(this.createResponseHandler('plan', Plan))
      .then((response) => {
        if (!response.success) {
          return response;
        }

        // NEXT_MAJOR_VERSION all the other server sdks return the collection directly, rather
        // than a response object. For now, add the plans and success properties to the collection
        // for backwards compatibility. We can drop these at the next major version.
        const collection = response.plans;

        collection.success = response.success;
        collection.plans = response.plans;

        return collection;
      });
  }
}

module.exports = {PlanGateway: wrapPrototype(PlanGateway)};
