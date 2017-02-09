'use strict';

let Gateway = require('./gateway').Gateway;
let CreditCard = require('./credit_card').CreditCard;
let exceptions = require('./exceptions');

class CreditCardGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  create(attributes, callback) {
    return this.gateway.http.post(`${this.config.baseMerchantPath()}/payment_methods`, {creditCard: attributes}, this.responseHandler(callback));
  }

  delete(token, callback) {
    return this.gateway.http.delete(`${this.config.baseMerchantPath()}/payment_methods/credit_card/${token}`, callback);
  }

  find(token, callback) {
    if (token.trim() === '') {
      return callback(exceptions.NotFoundError('Not Found'), null); // eslint-disable-line new-cap
    }

    return this.gateway.http.get(`${this.config.baseMerchantPath()}/payment_methods/credit_card/${token}`, function (err, response) {
      if (err) {
        return callback(err, null);
      }

      return callback(null, new CreditCard(response.creditCard));
    });
  }

  fromNonce(nonce, callback) {
    if (nonce.trim() === '') {
      return callback(exceptions.NotFoundError('Not Found'), null); // eslint-disable-line new-cap
    }

    return this.gateway.http.get(`${this.config.baseMerchantPath()}/payment_methods/from_nonce/${nonce}`, function (err, response) {
      if (err) {
        err.message = `Payment method with nonce ${nonce} locked, consumed or not found`;
        return callback(err, null);
      }

      return callback(null, new CreditCard(response.creditCard));
    });
  }

  update(token, attributes, callback) {
    return this.gateway.http.put(`${this.config.baseMerchantPath()}/payment_methods/credit_card/${token}`, {creditCard: attributes}, this.responseHandler(callback));
  }

  responseHandler(callback) {
    return this.createResponseHandler('creditCard', CreditCard, callback);
  }

  expired(callback) {
    return this.gateway.http.post(`${this.config.baseMerchantPath()}/payment_methods/all/expired_ids`, {}, this.searchResponseHandler(this, callback));
  }

  expiringBetween(after, before, callback) {
    let url = `${this.config.baseMerchantPath()}/payment_methods/all/expiring_ids?start=${this.dateFormat(after)}&end=${this.dateFormat(before)}`;

    return this.gateway.http.post(url, {}, this.searchResponseHandler(this, callback));
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

module.exports = {CreditCardGateway: CreditCardGateway};
