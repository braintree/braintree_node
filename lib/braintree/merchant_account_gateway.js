"use strict";

let Gateway = require("./gateway").Gateway;
let MerchantAccount = require("./merchant_account").MerchantAccount;
let PaginatedResponse = require("./paginated_response").PaginatedResponse;
let exceptions = require("./exceptions");
let wrapPrototype = require("@braintree/wrap-promise").wrapPrototype;

class MerchantAccountGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  create(attributes) {
    return this.gateway.http
      .post(
        `${this.config.baseMerchantPath()}/merchant_accounts/create_via_api`,
        { merchantAccount: attributes }
      )
      .then(this.responseHandler());
  }

  update(id, attributes) {
    return this.gateway.http
      .put(
        `${this.config.baseMerchantPath()}/merchant_accounts/${id}/update_via_api`,
        { merchantAccount: attributes }
      )
      .then(this.responseHandler());
  }

  find(id) {
    if (id.trim() === "") {
      return Promise.reject(exceptions.NotFoundError("Not Found"), null); // eslint-disable-line new-cap
    }

    return this.gateway.http
      .get(`${this.config.baseMerchantPath()}/merchant_accounts/${id}`)
      .then(function (response) {
        return new MerchantAccount(response.merchantAccount);
      });
  }

  responseHandler() {
    return this.createResponseHandler("merchantAccount", MerchantAccount);
  }

  all(callback) {
    let response = new PaginatedResponse(this.fetchMerchantAccounts.bind(this));

    if (callback != null) {
      return response.all(callback);
    }

    response.ready();

    return response.stream;
  }

  fetchMerchantAccounts(pageNumber, callback) {
    return this.gateway.http.get(
      this.config.baseMerchantPath() + "/merchant_accounts?page=" + pageNumber,
      (err, response) => {
        let body, merchantAccounts, pageSize, ref, totalItems;

        if (err) {
          return callback(err);
        }

        body = response.merchantAccounts;
        ref = response.merchantAccounts;
        totalItems = ref.totalItems;
        pageSize = ref.pageSize;
        merchantAccounts = body.merchantAccount;
        if (!Array.isArray(merchantAccounts)) {
          merchantAccounts = [merchantAccounts];
        }

        return callback(null, totalItems, pageSize, merchantAccounts);
      }
    );
  }

  createForCurrency(attributes) {
    return this.gateway.http
      .post(
        this.config.baseMerchantPath() +
          "/merchant_accounts/create_for_currency",
        {
          merchantAccount: attributes,
        }
      )
      .then(this.createForCurrencyResponseHandler());
  }

  createForCurrencyResponseHandler() {
    let handler = this.createResponseHandler(null, null);

    return function (payload) {
      return handler(payload).then((response) => {
        if (response.success) {
          response.merchantAccount = new MerchantAccount(
            response.response.merchantAccount
          );
          delete response.response;
        }

        return response;
      });
    };
  }
}

module.exports = {
  MerchantAccountGateway: wrapPrototype(MerchantAccountGateway, {
    ignoreMethods: ["all", "fetchMerchantAccounts"],
  }),
};
