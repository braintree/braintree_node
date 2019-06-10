'use strict';

let Gateway = require('./gateway').Gateway;
let CreditCard = require('./credit_card').CreditCard;
let exceptions = require('./exceptions');
let wrapPrototype = require('@braintree/wrap-promise').wrapPrototype;

class CreditCardGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  create(attributes) {
    return this.gateway.http.post(`${this.config.baseMerchantPath()}/payment_methods`, {creditCard: attributes}).then(this.responseHandler());
  }

  delete(token) {
    let path = `${this.config.baseMerchantPath()}/payment_methods/credit_card/${token}`;

    return this.gateway.http.delete(path);
  }

  find(token) {
    if (token.trim() === '') {
      return Promise.reject(exceptions.NotFoundError('Not Found')); // eslint-disable-line new-cap
    }

    return this.gateway.http.get(`${this.config.baseMerchantPath()}/payment_methods/credit_card/${token}`).then(function (response) {
      return new CreditCard(response.creditCard);
    });
  }

  fromNonce(nonce) {
    if (nonce.trim() === '') {
      return Promise.reject(exceptions.NotFoundError('Not Found')); // eslint-disable-line new-cap
    }

    return this.gateway.http.get(`${this.config.baseMerchantPath()}/payment_methods/from_nonce/${nonce}`).then((response) => {
      return new CreditCard(response.creditCard);
    }).catch((err) => {
      err.message = `Payment method with nonce ${nonce} locked, consumed or not found`;

      return Promise.reject(err);
    });
  }

  update(token, attributes) {
    return this.gateway.http.put(`${this.config.baseMerchantPath()}/payment_methods/credit_card/${token}`, {creditCard: attributes}).then(this.responseHandler());
  }

  responseHandler() {
    return this.createResponseHandler('creditCard', CreditCard);
  }

  expired() {
    return new Promise((resolve, reject) => {
      this.gateway.http.post(`${this.config.baseMerchantPath()}/payment_methods/all/expired_ids`, {}, this.searchResponseHandler(this, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      }));
    });
  }

  expiringBetween(after, before) {
    let url = `${this.config.baseMerchantPath()}/payment_methods/all/expiring_ids?start=${this.dateFormat(after)}&end=${this.dateFormat(before)}`;

    return new Promise((resolve, reject) => {
      this.gateway.http.post(url, {}, this.searchResponseHandler(this, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      }));
    });
  }

  dateFormat(date) {
    let month = date.getMonth() + 1;

    if (month < 10) {
      month = `0${month}`;
    } else {
      month = `${month}`;
    }

    return month + date.getFullYear();
  }
}

module.exports = {CreditCardGateway: wrapPrototype(CreditCardGateway)};
