'use strict';

let Gateway = require('./gateway').Gateway;
let Address = require('./address').Address;
let exceptions = require('./exceptions');

class AddressGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  create(attributes, callback) {
    let customerId = attributes.customerId;

    delete attributes.customerId;
    return this.gateway.http.post(`${this.config.baseMerchantPath()}/customers/${customerId}/addresses`, {address: attributes}, this.responseHandler(callback));
  }

  delete(customerId, id, callback) {
    return this.gateway.http.delete(`${this.config.baseMerchantPath()}/customers/${customerId}/addresses/${id}`, callback);
  }

  find(customerId, id, callback) {
    if (customerId.trim() === '' || id.trim() === '') {
      return callback(exceptions.NotFoundError('Not Found'), null); // eslint-disable-line new-cap
    }

    return this.gateway.http.get(`${this.config.baseMerchantPath()}/customers/${customerId}/addresses/${id}`, function (err, response) {
      if (err) {
        return callback(err, null);
      }

      return callback(null, response.address);
    });
  }

  update(customerId, id, attributes, callback) {
    return this.gateway.http.put(`${this.config.baseMerchantPath()}/customers/${customerId}/addresses/${id}`, {address: attributes}, this.responseHandler(callback));
  }

  responseHandler(callback) {
    return this.createResponseHandler('address', Address, callback);
  }

  sharedSignature(prefix) {
    let signatureKeys = [
      'company', 'countryCodeAlpha2', 'countryCodeAlpha3', 'countryCodeNumeric',
      'countryName', 'extendedAddress', 'firstName',
      'lastName', 'locality', 'postalCode', 'region', 'streetAddress'
    ];

    let signature = [];

    for (let val of signatureKeys) {
      signature.push(prefix + '[' + val + ']');
    }

    return signature;
  }
}

module.exports = {AddressGateway: AddressGateway};
