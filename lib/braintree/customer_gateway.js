'use strict';

let Gateway = require('./gateway').Gateway;
let Customer = require('./customer').Customer;
let CustomerSearch = require('./customer_search').CustomerSearch;
let exceptions = require('./exceptions');

class CustomerGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  create(attributes, callback) {
    return this.gateway.http.post(`${this.config.baseMerchantPath()}/customers`, {customer: attributes}, this.responseHandler(callback));
  }

  delete(customerId, callback) {
    return this.gateway.http.delete(`${this.config.baseMerchantPath()}/customers/${customerId}`, callback);
  }

  find(customerId, callback) {
    if (customerId.trim() === '') {
      return callback(exceptions.NotFoundError('Not Found'), null); // eslint-disable-line new-cap
    }

    return this.gateway.http.get(`${this.config.baseMerchantPath()}/customers/${customerId}`, function (err, response) {
      if (err) {
        return callback(err, null);
      }

      return callback(null, new Customer(response.customer));
    });
  }

  update(customerId, attributes, callback) {
    return this.gateway.http.put(`${this.config.baseMerchantPath()}/customers/${customerId}`, {customer: attributes}, this.responseHandler(callback));
  }

  search(fn, callback) {
    let search = new CustomerSearch();

    fn(search);
    return this.createSearchResponse(`${this.config.baseMerchantPath()}/customers/advanced_search_ids`, search, this.pagingFunctionGenerator(search), callback);
  }

  responseHandler(callback) {
    return this.createResponseHandler('customer', Customer, callback);
  }

  pagingFunctionGenerator(search) {
    return super.pagingFunctionGenerator(search, 'customers', Customer, 'customers', response => response.customers.customer);
  }
}

module.exports = {CustomerGateway: CustomerGateway};
