'use strict';

let AddOn = require('./add_on').AddOn;
let Gateway = require('./gateway').Gateway;
let wrapPrototype = require('@braintree/wrap-promise').wrapPrototype;

class AddOnGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  all() {
    return this.gateway.http.get(`${this.config.baseMerchantPath()}/add_ons`).then(this.createResponseHandler('add_on', AddOn));
  }
}

module.exports = {AddOnGateway: wrapPrototype(AddOnGateway)};
