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
    return this.gateway.http.get(`${this.config.baseMerchantPath()}/add_ons`)
      .then(this.createResponseHandler('add_on', AddOn))
      .then((response) => {
        if (!response.success) {
          return response;
        }

        // NEXT_MAJOR_VERSION all the other server sdks return the collection directly, rather
        // than a response object. For now, add the addOns and success properties to the collection
        // for backwards compatibility. We can drop these at the next major version.
        const collection = response.addOns;

        collection.success = response.success;
        collection.addOns = response.addOns;

        return collection;
      });
  }
}

module.exports = {AddOnGateway: wrapPrototype(AddOnGateway)};
