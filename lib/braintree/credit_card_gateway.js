"use strict";
/* eslint-disable no-console */
const { Gateway } = require("./gateway");
const { CreditCard } = require("./credit_card");
const exceptions = require("./exceptions");
const { CreditCardSearch } = require("./credit_card_search");
const { wrapPrototype } = require("@braintree/wrap-promise");

class CreditCardGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  create(attributes) {
    this._checkForDeprecatedAttributes(attributes);

    return this.gateway.http
      .post(`${this.config.baseMerchantPath()}/payment_methods`, {
        creditCard: attributes,
      })
      .then(this.responseHandler());
  }

  delete(token) {
    let path = `${this.config.baseMerchantPath()}/payment_methods/credit_card/${token}`;

    return this.gateway.http.delete(path);
  }

  find(token) {
    if (token.trim() === "") {
      return Promise.reject(exceptions.NotFoundError("Not Found")); // eslint-disable-line new-cap
    }

    return this.gateway.http
      .get(
        `${this.config.baseMerchantPath()}/payment_methods/credit_card/${token}`
      )
      .then(function (response) {
        return new CreditCard(response.creditCard);
      });
  }

  fromNonce(nonce) {
    if (nonce.trim() === "") {
      return Promise.reject(exceptions.NotFoundError("Not Found")); // eslint-disable-line new-cap
    }

    return this.gateway.http
      .get(
        `${this.config.baseMerchantPath()}/payment_methods/from_nonce/${nonce}`
      )
      .then((response) => {
        return new CreditCard(response.creditCard);
      })
      .catch((err) => {
        err.message = `Payment method with nonce ${nonce} locked, consumed or not found`;

        return Promise.reject(err);
      });
  }

  update(token, attributes) {
    this._checkForDeprecatedAttributes(attributes);

    return this.gateway.http
      .put(
        `${this.config.baseMerchantPath()}/payment_methods/credit_card/${token}`,
        { creditCard: attributes }
      )
      .then(this.responseHandler());
  }

  responseHandler() {
    return this.createResponseHandler("creditCard", CreditCard);
  }

  expired(callback) {
    const searchUrl = `${this.config.baseMerchantPath()}/payment_methods/all/expired_ids`;
    const search = new CreditCardSearch();
    const pagingFunction = this.pagingFunctionGenerator(
      search,
      "payment_methods/all/expired"
    );

    return this.createSearchResponse(
      searchUrl,
      search,
      pagingFunction,
      callback
    );
  }

  expiringBetween(startDate, endDate, callback) {
    const query = `start=${this.dateFormat(startDate)}&end=${this.dateFormat(
      endDate
    )}`;
    const searchUrl = `${this.config.baseMerchantPath()}/payment_methods/all/expiring_ids?${query}`;
    const search = new CreditCardSearch();
    const pagingFunction = this.pagingFunctionGenerator(
      search,
      `payment_methods/all/expiring?${query}`
    );

    return this.createSearchResponse(
      searchUrl,
      search,
      pagingFunction,
      callback
    );
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

  pagingFunctionGenerator(search, url) {
    return super.pagingFunctionGenerator(
      search,
      url,
      CreditCard,
      "paymentMethods",
      (response) => response.paymentMethods.creditCard
    );
  }

  _checkForDeprecatedAttributes(attributes) {
    if (attributes.deviceSessionId != null) {
      console.warn(
        "[DEPRECATED] `deviceSessionId` is a deprecated param for CreditCard objects. Use `deviceData` instead"
      );
    }

    if (attributes.fraudMerchantId != null) {
      console.warn(
        "[DEPRECATED] `fraudMerchantId` is a deprecated param for CreditCard objects. Use `deviceData` instead"
      );
    }
  }
}

module.exports = {
  CreditCardGateway: wrapPrototype(CreditCardGateway, {
    ignoreMethods: ["expired", "expiringBetween"],
  }),
};
