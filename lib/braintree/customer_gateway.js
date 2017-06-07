'use strict';

let Gateway = require('./gateway').Gateway;
let Customer = require('./customer').Customer;
let CustomerSearch = require('./customer_search').CustomerSearch;
let exceptions = require('./exceptions');
let wrapPrototype = require('@braintree/wrap-promise').wrapPrototype;

class CustomerGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  create(attributes) {
    return this.gateway.http.post(`${this.config.baseMerchantPath()}/customers`, {customer: attributes}).then(this.responseHandler());
  }

  delete(customerId) {
    return this.gateway.http.delete(`${this.config.baseMerchantPath()}/customers/${customerId}`);
  }

  find(customerId) {
    if (customerId.trim() === '') {
      return Promise.reject(exceptions.NotFoundError('Not Found'), null); // eslint-disable-line new-cap
    }

    return this.gateway.http.get(`${this.config.baseMerchantPath()}/customers/${customerId}`).then(function (response) {
      return new Customer(response.customer);
    });
  }

  update(customerId, attributes) {
    return this.gateway.http.put(`${this.config.baseMerchantPath()}/customers/${customerId}`, {customer: attributes}).then(this.responseHandler());
  }

  search(fn, callback) {
    let search = new CustomerSearch();

    fn(search);
    return this.createSearchResponse(`${this.config.baseMerchantPath()}/customers/advanced_search_ids`, search, this.pagingFunctionGenerator(search), callback);
  }

  responseHandler() {
    return this.createResponseHandler('customer', Customer);
  }

  pagingFunctionGenerator(search) {
    return super.pagingFunctionGenerator(search, 'customers', Customer, 'customers', response => response.customers.customer);
  }
}

module.exports = {CustomerGateway: wrapPrototype(CustomerGateway, {
  ignoreMethods: ['search']
})};
