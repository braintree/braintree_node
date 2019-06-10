'use strict';

let Gateway = require('./gateway').Gateway;
let Subscription = require('./subscription').Subscription;
let SubscriptionSearch = require('./subscription_search').SubscriptionSearch;
let TransactionGateway = require('./transaction_gateway').TransactionGateway;
let exceptions = require('./exceptions');
let wrapPrototype = require('@braintree/wrap-promise').wrapPrototype;

class SubscriptionGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  create(attributes) {
    return this.gateway.http.post(`${this.config.baseMerchantPath()}/subscriptions`, {subscription: attributes}).then(this.responseHandler());
  }

  cancel(subscriptionId) {
    return this.gateway.http.put(`${this.config.baseMerchantPath()}/subscriptions/${subscriptionId}/cancel`, null).then(this.responseHandler());
  }

  find(subscriptionId) {
    if (subscriptionId.trim() === '') {
      return Promise.reject(exceptions.NotFoundError('Not Found'), null); // eslint-disable-line new-cap
    }

    return this.gateway.http.get(`${this.config.baseMerchantPath()}/subscriptions/${subscriptionId}`).then((response) => {
      return new Subscription(response.subscription, this.gateway);
    });
  }

  responseHandler() {
    return this.createResponseHandler('subscription', Subscription);
  }

  retryCharge(subscriptionId, amount, submitForSettlement) {
    if (typeof amount === 'function') {
      amount = undefined; // eslint-disable-line no-undefined
    }

    if (typeof submitForSettlement === 'function') {
      submitForSettlement = false; // eslint-disable-line no-undefined
    }

    return new TransactionGateway(this.gateway).sale({
      amount: amount,
      subscriptionId,
      options: {
        submitForSettlement: submitForSettlement
      }
    });
  }

  search(fn, callback) {
    let search = new SubscriptionSearch();

    fn(search);

    return this.createSearchResponse(`${this.config.baseMerchantPath()}/subscriptions/advanced_search_ids`, search, this.pagingFunctionGenerator(search), callback);
  }

  update(subscriptionId, attributes) {
    return this.gateway.http.put(`${this.config.baseMerchantPath()}/subscriptions/${subscriptionId}`, {subscription: attributes}).then(this.responseHandler());
  }

  pagingFunctionGenerator(search) {
    return super.pagingFunctionGenerator(search, 'subscriptions', Subscription, 'subscriptions', response => response.subscriptions.subscription);
  }
}

module.exports = {SubscriptionGateway: wrapPrototype(SubscriptionGateway, {
  ignoreMethods: ['search']
})};
