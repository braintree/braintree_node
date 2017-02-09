'use strict';

let Gateway = require('./gateway').Gateway;
let ErrorResponse = require('./error_response').ErrorResponse;
let Util = require('./util').Util;
let exceptions = require('./exceptions');

let DEFAULT_VERSION = 2;

class ClientTokenGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  generate(params, callback) {
    let err;

    params = params || {};

    if (!params.version) { params.version = DEFAULT_VERSION; }

    err = Util.verifyKeys(this._generateSignature(), params);

    if (!err) {
      err = this.validateParams(params);
    }

    if (err) {
      callback(err, null);
      return;
    }
    params = {client_token: params}; // eslint-disable-line camelcase

    let responseHandler = this.responseHandler(callback);

    this.gateway.http.post(`${this.config.baseMerchantPath()}/client_token`, params, responseHandler);
  }

  validateParams(params) {
    if (params.customerId || !params.options) { return; }

    let options = ['makeDefault', 'verifyCard', 'failOnDuplicatePaymentMethod'];
    let invalidOptions = options.filter((name) => params.options[name]).map((name) => name);

    if (invalidOptions.length > 0) {
      return exceptions.UnexpectedError(`A customer id is required for the following options: ${invalidOptions.join(', ')}`); // eslint-disable-line consistent-return, new-cap
    }

    return null; // eslint-disable-line consistent-return
  }

  responseHandler(callback) {
    return function (err, response) {
      if (err) {
        callback(err, response);
        return;
      }

      if (response.clientToken) {
        response.success = true;
        response.clientToken = response.clientToken.value;
        callback(null, response);
      } else if (response.apiErrorResponse) {
        callback(null, new ErrorResponse(response.apiErrorResponse));
      }
    };
  }

  _generateSignature() {
    return {
      valid: [
        'addressId', 'customerId', 'proxyMerchantId', 'merchantAccountId',
        'version', 'sepaMandateAcceptanceLocation', 'sepaMandateType',
        'options', 'options[makeDefault]', 'options[verifyCard]', 'options[failOnDuplicatePaymentMethod]'
      ]
    };
  }
}

module.exports = {ClientTokenGateway: ClientTokenGateway};
