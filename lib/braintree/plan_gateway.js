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
    return this.gateway.http.get(`${this.config.baseMerchantPath()}/plans`).then(this.createResponseHandler('plan', Plan));
  }
}

module.exports = {PlanGateway: wrapPrototype(PlanGateway)};
