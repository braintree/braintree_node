'use strict';

let Gateway = require('./gateway').Gateway;
let Plan = require('./plan').Plan;

class PlanGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  all(callback) {
    return this.gateway.http.get(`${this.config.baseMerchantPath()}/plans`, this.createResponseHandler('plan', Plan, callback));
  }
}

module.exports = {PlanGateway: PlanGateway};
