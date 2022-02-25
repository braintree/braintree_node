"use strict";

let Gateway = require("./gateway").Gateway;
let ErrorResponse = require("./error_response").ErrorResponse;
let Util = require("./util").Util;
let exceptions = require("./exceptions");
let wrapPrototype = require("@braintree/wrap-promise").wrapPrototype;

let DEFAULT_VERSION = 2;

class ClientTokenGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  generate(params) {
    let err;

    params = params || {};

    if (!params.version) {
      params.version = DEFAULT_VERSION;
    }

    err = Util.verifyKeys(this._generateSignature(), params);

    if (!err) {
      err = this.validateParams(params);
    }

    if (err) {
      return Promise.reject(err);
    }
    params = { client_token: params }; // eslint-disable-line camelcase

    return this.gateway.http
      .post(`${this.config.baseMerchantPath()}/client_token`, params)
      .then(this.responseHandler());
  }

  validateParams(params) {
    if (params.customerId || !params.options) {
      return;
    }

    let options = ["makeDefault", "verifyCard", "failOnDuplicatePaymentMethod"];
    let invalidOptions = options
      .filter((name) => params.options[name])
      .map((name) => name);

    if (invalidOptions.length > 0) {
      // eslint-disable-next-line consistent-return, new-cap
      return exceptions.UnexpectedError(
        `A customer id is required for the following options: ${invalidOptions.join(
          ", "
        )}`
      );
    }

    return null; // eslint-disable-line consistent-return
  }

  responseHandler() {
    let gateway = this.gateway;

    // eslint-disable-next-line consistent-return
    return function (response) {
      if (response.clientToken) {
        response.success = true;
        response.clientToken = response.clientToken.value;

        return response;
      } else if (response.apiErrorResponse) {
        return new ErrorResponse(response.apiErrorResponse, gateway);
      }
    };
  }

  _generateSignature() {
    return {
      valid: [
        "addressId",
        "customerId",
        "proxyMerchantId",
        "merchantAccountId",
        "version",
        "options",
        "options[makeDefault]",
        "options[verifyCard]",
        "options[failOnDuplicatePaymentMethod]",
      ],
    };
  }
}

module.exports = { ClientTokenGateway: wrapPrototype(ClientTokenGateway) };
