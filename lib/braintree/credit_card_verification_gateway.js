"use strict";

let Gateway = require("./gateway").Gateway;
let CreditCardVerification =
  require("./credit_card_verification").CreditCardVerification;
let CreditCardVerificationSearch =
  require("./credit_card_verification_search").CreditCardVerificationSearch;
let Util = require("./util").Util;
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
    let invalidKeysError = Util.verifyKeys(this._createSignature(), params);

    if (invalidKeysError) {
      return Promise.reject(invalidKeysError, null);
    }

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

  _createSignature() {
    return {
      valid: [
        "creditCard",
        "creditCard[billingAddress]",
        "creditCard[billingAddress][company]",
        "creditCard[billingAddress][countryCodeAlpha2]",
        "creditCard[billingAddress][countryCodeAlpha3]",
        "creditCard[billingAddress][countryCodeNumeric]",
        "creditCard[billingAddress][countryName]",
        "creditCard[billingAddress][extendedAddress]",
        "creditCard[billingAddress][firstName]",
        "creditCard[billingAddress][lastName]",
        "creditCard[billingAddress][locality]",
        "creditCard[billingAddress][postalCode]",
        "creditCard[billingAddress][region]",
        "creditCard[billingAddress][streetAddress]",
        "creditCard[cardholderName]",
        "creditCard[cvv]",
        "creditCard[expirationDate]",
        "creditCard[expirationMonth]",
        "creditCard[expirationYear]",
        "creditCard[number]",
        "externalVault",
        "externalVault[previousNetworkTransactionId]",
        "externalVault[status]",
        "intendedTransactionSource",
        "paymentMethodNonce",
        "options",
        "options[accountType]",
        "options[amount]",
        "options[merchantAccountId]",
        "riskData",
        "riskData[customerBrowser]",
        "riskData[customerIp]",
        "threeDSecureAuthenticationId",
        "threeDSecurePassThru",
        "threeDSecurePassThru[authenticationResponse]",
        "threeDSecurePassThru[cavv]",
        "threeDSecurePassThru[cavvAlgorithm]",
        "threeDSecurePassThru[directoryResponse]",
        "threeDSecurePassThru[dsTransactionId]",
        "threeDSecurePassThru[eciFlag]",
        "threeDSecurePassThru[xid]",
        "threeDSecurePassThru[threeDSecureVersion]",
      ],
    };
  }
}

module.exports = {
  CreditCardVerificationGateway: wrapPrototype(CreditCardVerificationGateway, {
    ignoreMethods: ["search"],
  }),
};
