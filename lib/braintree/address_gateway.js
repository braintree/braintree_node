"use strict";

let Gateway = require("./gateway").Gateway;
let Address = require("./address").Address;
let exceptions = require("./exceptions");
let wrapPrototype = require("@braintree/wrap-promise").wrapPrototype;

class AddressGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  create(attributes) {
    let customerId = attributes.customerId;

    delete attributes.customerId;

    return this.gateway.http
      .post(
        `${this.config.baseMerchantPath()}/customers/${customerId}/addresses`,
        { address: attributes }
      )
      .then(this.responseHandler());
  }

  delete(customerId, id) {
    let path = `${this.config.baseMerchantPath()}/customers/${customerId}/addresses/${id}`;

    return this.gateway.http.delete(path);
  }

  find(customerId, id) {
    if (customerId.trim() === "" || id.trim() === "") {
      return Promise.reject(exceptions.NotFoundError("Not Found")); // eslint-disable-line new-cap
    }

    return this.gateway.http
      .get(
        `${this.config.baseMerchantPath()}/customers/${customerId}/addresses/${id}`
      )
      .then((response) => {
        return response.address;
      });
  }

  update(customerId, id, attributes) {
    return this.gateway.http
      .put(
        `${this.config.baseMerchantPath()}/customers/${customerId}/addresses/${id}`,
        { address: attributes }
      )
      .then(this.responseHandler());
  }

  responseHandler() {
    return this.createResponseHandler("address", Address);
  }

  sharedSignature(prefix) {
    let signatureKeys = [
      "company",
      "countryCodeAlpha2",
      "countryCodeAlpha3",
      "countryCodeNumeric",
      "countryName",
      "extendedAddress",
      "firstName",
      "lastName",
      "locality",
      "phoneNumber",
      "postalCode",
      "region",
      "streetAddress",
    ];

    let signature = [];

    for (let val of signatureKeys) {
      signature.push(prefix + "[" + val + "]");
    }

    return signature;
  }
}

module.exports = { AddressGateway: wrapPrototype(AddressGateway) };
