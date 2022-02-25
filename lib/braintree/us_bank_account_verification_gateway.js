"use strict";

let Gateway = require("./gateway").Gateway;
let UsBankAccountVerification =
  require("./us_bank_account_verification").UsBankAccountVerification;
let UsBankAccountVerificationSearch =
  require("./us_bank_account_verification_search").UsBankAccountVerificationSearch;
let exceptions = require("./exceptions");
let wrapPrototype = require("@braintree/wrap-promise").wrapPrototype;

class UsBankAccountVerificationGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  find(usBankAccountVerificationId) {
    if (usBankAccountVerificationId.trim() === "") {
      return Promise.reject(exceptions.NotFoundError("Not Found")); // eslint-disable-line new-cap
    }

    return this.gateway.http
      .get(
        `${this.config.baseMerchantPath()}/us_bank_account_verifications/${usBankAccountVerificationId}`
      )
      .then(function (response) {
        return new UsBankAccountVerification(
          response.usBankAccountVerification
        );
      });
  }

  search(fn, callback) {
    let search = new UsBankAccountVerificationSearch();

    fn(search);

    return this.createSearchResponse(
      `${this.config.baseMerchantPath()}/us_bank_account_verifications/advanced_search_ids`,
      search,
      this.pagingFunctionGenerator(search),
      callback
    );
  }

  confirmMicroTransferAmounts(
    usBankAccountVerificationId,
    depositAmounts,
    callback
  ) {
    let params = {
      usBankAccountVerification: {
        depositAmounts: depositAmounts,
      },
    };

    return this.gateway.http
      .put(
        `${this.config.baseMerchantPath()}/us_bank_account_verifications/${usBankAccountVerificationId}/confirm_micro_transfer_amounts`,
        params,
        callback
      )
      .then(this.responseHandler());
  }

  responseHandler() {
    return this.createResponseHandler(
      "usBankAccountVerification",
      UsBankAccountVerification
    );
  }

  pagingFunctionGenerator(search) {
    return (ids, callback) => {
      let searchCriteria = search.toHash();

      searchCriteria.ids = ids;

      return this.gateway.http.post(
        `${this.config.baseMerchantPath()}/us_bank_account_verifications/advanced_search`,
        { search: searchCriteria },
        function (err, response) {
          if (err) {
            return callback(err, null);
          } else if (
            Array.isArray(
              response.usBankAccountVerifications.usBankAccountVerification
            )
          ) {
            return response.usBankAccountVerifications.usBankAccountVerification.map(
              (usBankAccountVerification) =>
                callback(
                  null,
                  new UsBankAccountVerification(usBankAccountVerification)
                )
            );
          }

          return callback(
            null,
            new UsBankAccountVerification(
              response.usBankAccountVerifications.usBankAccountVerification
            )
          );
        }
      );
    };
  }
}

module.exports = {
  UsBankAccountVerificationGateway: wrapPrototype(
    UsBankAccountVerificationGateway,
    {
      ignoreMethods: ["search"],
    }
  ),
};
