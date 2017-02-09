'use strict';

let Gateway = require('./gateway').Gateway;
let Subscription = require('./subscription').Subscription;
let SubscriptionSearch = require('./subscription_search').SubscriptionSearch;
let TransactionGateway = require('./transaction_gateway').TransactionGateway;
let exceptions = require('./exceptions');

class SubscriptionGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  create(attributes, callback) {
    return this.gateway.http.post(`${this.config.baseMerchantPath()}/subscriptions`, {subscription: attributes}, this.responseHandler(callback));
  }

  cancel(subscriptionId, callback) {
    return this.gateway.http.put(`${this.config.baseMerchantPath()}/subscriptions/${subscriptionId}/cancel`, null, this.responseHandler(callback));
  }

  find(subscriptionId, callback) {
    if (subscriptionId.trim() === '') {
      return callback(exceptions.NotFoundError('Not Found'), null); // eslint-disable-line new-cap
    }

    return this.gateway.http.get(`${this.config.baseMerchantPath()}/subscriptions/${subscriptionId}`, function (err, response) {
      if (err) {
        return callback(err, null);
      }

      return callback(null, new Subscription(response.subscription));
    });
  }

  responseHandler(callback) {
    return this.createResponseHandler('subscription', Subscription, callback);
  }

  retryCharge(subscriptionId, amount, callback) {
    if (!callback) {
      callback = amount;
      amount = undefined; // eslint-disable-line no-undefined
    }

    return new TransactionGateway(this.gateway).sale({
      amount: amount,
      subscriptionId
    }, callback);
  }

  search(fn, callback) {
    let search = new SubscriptionSearch();

    fn(search);
    return this.createSearchResponse(`${this.config.baseMerchantPath()}/subscriptions/advanced_search_ids`, search, this.pagingFunctionGenerator(search), callback);
  }

  update(subscriptionId, attributes, callback) {
    return this.gateway.http.put(`${this.config.baseMerchantPath()}/subscriptions/${subscriptionId}`, {subscription: attributes}, this.responseHandler(callback));
  }

  pagingFunctionGenerator(search) {
    return super.pagingFunctionGenerator(search, 'subscriptions', Subscription, 'subscriptions', response => response.subscriptions.subscription);
  }
}

module.exports = {SubscriptionGateway: SubscriptionGateway};
