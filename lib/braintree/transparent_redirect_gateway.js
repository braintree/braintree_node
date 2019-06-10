'use strict';

let Digest = require('./digest').Digest;
let Util = require('./util').Util;
let querystring = require('../../vendor/querystring.node.js.511d6a2/querystring');
let dateFormat = require('dateformat');
let CreditCardGateway = require('./credit_card_gateway').CreditCardGateway;
let CustomerGateway = require('./customer_gateway').CustomerGateway;
let TransactionGateway = require('./transaction_gateway').TransactionGateway;
let SignatureService = require('./signature_service').SignatureService;
let exceptions = require('./exceptions');
let wrapPrototype = require('@braintree/wrap-promise').wrapPrototype;

let KIND;

class TransparentRedirectGateway {
  static initClass() {
    KIND = {
      CREATE_CUSTOMER: 'create_customer',
      UPDATE_CUSTOMER: 'update_customer',
      CREATE_CREDIT_CARD: 'create_payment_method',
      UPDATE_CREDIT_CARD: 'update_payment_method',
      CREATE_TRANSACTION: 'create_transaction'
    };
  }

  constructor(gateway) {
    this.gateway = gateway;
    this.config = this.gateway.config;
    this.url = `${this.config.baseMerchantUrl()}/transparent_redirect_requests`;
  }

  generateTrData(inputData) {
    let data = Util.convertObjectKeysToUnderscores(inputData);

    data.api_version = this.gateway.config.apiVersion; // eslint-disable-line camelcase
    data.time = dateFormat(new Date(), 'yyyymmddHHMMss', true);
    data.public_key = this.gateway.config.publicKey; // eslint-disable-line camelcase
    let dataSegment = querystring.stringify(data);

    return new SignatureService(this.gateway.config.privateKey, Digest.Sha1hexdigest).sign(dataSegment);
  }

  createCreditCardData(data) {
    data.kind = KIND.CREATE_CREDIT_CARD;

    return this.generateTrData(data);
  }

  updateCreditCardData(data) {
    data.kind = KIND.UPDATE_CREDIT_CARD;

    return this.generateTrData(data);
  }

  createCustomerData(data) {
    data.kind = KIND.CREATE_CUSTOMER;

    return this.generateTrData(data);
  }

  updateCustomerData(data) {
    data.kind = KIND.UPDATE_CUSTOMER;

    return this.generateTrData(data);
  }

  transactionData(data) {
    data.kind = KIND.CREATE_TRANSACTION;

    return this.generateTrData(data);
  }

  validateQueryString(queryString) {
    let matches = queryString.match(/^(.+)&hash=(.+?)$/);

    return Digest.Sha1hexdigest(this.gateway.config.privateKey, matches[1]) === matches[2];
  }

  confirm(queryString) {
    let statusMatch = queryString.match(/http_status=(\d+)/);

    if (statusMatch && statusMatch[1]) {
      let error = this.gateway.http.checkHttpStatus(statusMatch[1]);

      if (error) { return Promise.reject(error); }
    }
    if (!this.validateQueryString(queryString)) {
      return Promise.reject(exceptions.InvalidTransparentRedirectHashError('The transparent redirect hash is invalid'), null); // eslint-disable-line new-cap
    }
    let params = querystring.parse(queryString);
    let confirmResponse;

    switch (params.kind) { // eslint-disable-line default-case
      case KIND.CREATE_CUSTOMER:
      case KIND.UPDATE_CUSTOMER:
        confirmResponse = new CustomerGateway(this.gateway).responseHandler();
        break;
      case KIND.CREATE_CREDIT_CARD:
      case KIND.UPDATE_CREDIT_CARD:
        confirmResponse = new CreditCardGateway(this.gateway).responseHandler();
        break;
      case KIND.CREATE_TRANSACTION:
        confirmResponse = new TransactionGateway(this.gateway).responseHandler();
        break;
    }

    return this.gateway.http.post(`${this.config.baseMerchantPath()}/transparent_redirect_requests/` + params.id + '/confirm', null).then(confirmResponse);
  }
}
TransparentRedirectGateway.initClass();

module.exports = {TransparentRedirectGateway: wrapPrototype(TransparentRedirectGateway)};
