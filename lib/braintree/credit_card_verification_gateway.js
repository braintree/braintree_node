"use strict";

let Gateway = require("./gateway").Gateway;
let CreditCardVerification =
  require("./credit_card_verification").CreditCardVerification;
let CreditCardVerificationSearch =
  require("./credit_card_verification_search").CreditCardVerificationSearch;
let exceptions = require("./exceptions");
let wrapPrototype = require("@braintree/wrap-promise").wrapPrototype;

class CreditCardVerificationGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  find(creditCardVerificationId) {
    if (creditCardVerificationId.trim() === "") {
      return Promise.reject(exceptions.NotFoundError("Not Found")); // eslint-disable-line new-cap
    }

    return this.gateway.http
      .get(
        `${this.config.baseMerchantPath()}/verifications/${creditCardVerificationId}`
      )
      .then(function (response) {
        return new CreditCardVerification(response.verification);
      });
  }

  search(fn, callback) {
    let search = new CreditCardVerificationSearch();

    fn(search);

    return this.createSearchResponse(
      `${this.config.baseMerchantPath()}/verifications/advanced_search_ids`,
      search,
      this.pagingFunctionGenerator(search),
      callback
    );
  }

  create(params) {
    return this.gateway.http
      .post(`${this.config.baseMerchantPath()}/verifications`, {
        verification: params,
      })
      .then(this.createResponseHandler("verification", CreditCardVerification));
  }

  responseHandler() {
    return this.createResponseHandler(
      "creditCardVerification",
      CreditCardVerification
    );
  }

  pagingFunctionGenerator(search) {
    return (ids, callback) => {
      let searchCriteria = search.toHash();

      searchCriteria.ids = ids;

      return this.gateway.http.post(
        `${this.config.baseMerchantPath()}/verifications/advanced_search`,
        { search: searchCriteria },
        function (err, response) {
          if (err) {
            return callback(err, null);
          } else if (
            Array.isArray(response.creditCardVerifications.verification)
          ) {
            return response.creditCardVerifications.verification.map(
              (creditCardVerification) =>
                callback(
                  null,
                  new CreditCardVerification(creditCardVerification)
                )
            );
          }

          return callback(
            null,
            new CreditCardVerification(
              response.creditCardVerifications.verification
            )
          );
        }
      );
    };
  }
}

module.exports = {
  CreditCardVerificationGateway: wrapPrototype(CreditCardVerificationGateway, {
    ignoreMethods: ["search"],
  }),
};
