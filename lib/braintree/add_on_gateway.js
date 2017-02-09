'use strict';

let AddOn = require('./add_on').AddOn;
let Gateway = require('./gateway').Gateway;

class AddOnGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  all(callback) {
    return this.gateway.http.get(`${this.config.baseMerchantPath()}/add_ons`, this.createResponseHandler('add_on', AddOn, callback));
  }
}

module.exports = {AddOnGateway: AddOnGateway};
