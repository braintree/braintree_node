"use strict";

let Gateway = require("./gateway").Gateway;
let Plan = require("./plan").Plan;
let wrapPrototype = require("@braintree/wrap-promise").wrapPrototype;
let exceptions = require("./exceptions");

class PlanGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  all() {
    return this.gateway.http
      .get(`${this.config.baseMerchantPath()}/plans`)
      .then(this.createResponseHandler("plan", Plan))
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

  create(attributes) {
    return this.gateway.http
      .post(`${this.config.baseMerchantPath()}/plans`, { plan: attributes })
      .then(this.responseHandler());
  }

  find(planId) {
    if (planId.trim() === "") {
      return Promise.reject(exceptions.NotFoundError("Not Found"), null); // eslint-disable-line new-cap
    }

    return this.gateway.http
      .get(`${this.config.baseMerchantPath()}/plans/${planId}`)
      .then((response) => {
        return new Plan(response.plan, this.gateway);
      });
  }

  update(planId, attributes) {
    return this.gateway.http
      .put(`${this.config.baseMerchantPath()}/plans/${planId}`, {
        plan: attributes,
      })
      .then(this.responseHandler());
  }

  responseHandler() {
    return this.createResponseHandler("plan", Plan);
  }
}

module.exports = { PlanGateway: wrapPrototype(PlanGateway) };
