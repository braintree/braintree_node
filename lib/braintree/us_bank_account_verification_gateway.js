'use strict';

let Gateway = require('./gateway').Gateway;
let UsBankAccountVerification = require('./us_bank_account_verification').UsBankAccountVerification;
let UsBankAccountVerificationSearch = require('./us_bank_account_verification_search').UsBankAccountVerificationSearch;
let _ = require('underscore');
let exceptions = require('./exceptions');
let wrapPrototype = require('@braintree/wrap-promise').wrapPrototype;

class UsBankAccountVerificationGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  find(usBankAccountVerificationId) {
    if (usBankAccountVerificationId.trim() === '') {
      return Promise.reject(exceptions.NotFoundError('Not Found')); // eslint-disable-line new-cap
    }

    return this.gateway.http.get(`${this.config.baseMerchantPath()}/us_bank_account_verifications/${usBankAccountVerificationId}`).then(function (response) {
      return new UsBankAccountVerification(response.verification);
    });
  }

  search(fn, callback) {
    let search = new UsBankAccountVerificationSearch();

    fn(search);
    return this.createSearchResponse(`${this.config.baseMerchantPath()}/us_bank_account_verifications/advanced_search_ids`, search, this.pagingFunctionGenerator(search), callback);
  }

  responseHandler() {
    return this.createResponseHandler('usBankAccountVerification', UsBankAccountVerification);
  }

  pagingFunctionGenerator(search) {
    return (ids, callback) => {
      let searchCriteria = search.toHash();

      searchCriteria.ids = ids;
      return this.gateway.http.post(`${this.config.baseMerchantPath()}/us_bank_account_verifications/advanced_search`,
        {search: searchCriteria},
        function (err, response) {
          if (err) {
            return callback(err, null);
          } else if (_.isArray(response.usBankAccountVerifications.verification)) {
            return response.usBankAccountVerifications.verification.map((usBankAccountVerification) =>
                callback(null, new UsBankAccountVerification(usBankAccountVerification)));
          }

          return callback(null, new UsBankAccountVerification(response.usBankAccountVerifications.verification));
        });
    };
  }
}

module.exports = {UsBankAccountVerificationGateway: wrapPrototype(UsBankAccountVerificationGateway, {
  ignoreMethods: ['search']
})};
