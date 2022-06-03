"use strict";

let Gateway = require("./gateway").Gateway;
let wrapPrototype = require("@braintree/wrap-promise").wrapPrototype;
let GraphQLClient = require("./graphql_client").GraphQLClient;
let Util = require("./util").Util;
let ExchangeRateQuotePayload =
  require("./exchange_rate_quote_payload").ExchangeRateQuotePayload;

class ExchangeRateQuoteGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  generate(attributes) {
    let invalidKeysError = Util.verifyKeys(
      this._generateSignature(),
      attributes
    );

    if (invalidKeysError) {
      return Promise.reject(invalidKeysError, null);
    }

    const exchangeRateQuoteMutation = `mutation ($exchangeRateQuoteRequest: GenerateExchangeRateQuoteInput!) {
        generateExchangeRateQuote(input: $exchangeRateQuoteRequest) {
          quotes {
            id
            baseAmount {value, currencyCode}
            quoteAmount {value, currencyCode}
            exchangeRate
            tradeRate
            expiresAt
            refreshesAt
          }
        }
      }`;

    let graphQLClient = new GraphQLClient(this.config);
    let exchangeRateQuoteRequest = { exchangeRateQuoteRequest: attributes };

    return graphQLClient
      .query(exchangeRateQuoteMutation, exchangeRateQuoteRequest)
      .then((response) => {
        if (response && !response.errors) {
          response.success = true;
          response.exchangeRateQuotePayload = new ExchangeRateQuotePayload(
            response.data.generateExchangeRateQuote
          );
        }

        return response;
      });
  }

  _generateSignature() {
    let validKeys = [
      "quotes[baseCurrency]",
      "quotes[quoteCurrency]",
      "quotes[baseAmount]",
      "quotes[markup]",
    ];

    return {
      valid: validKeys,
    };
  }
}

module.exports = {
  ExchangeRateQuoteGateway: wrapPrototype(ExchangeRateQuoteGateway),
};
