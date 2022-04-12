"use strict";

const sinon = require("sinon");
let GraphQLClient =
  require("../../../lib/braintree/graphql_client").GraphQLClient;
let ExchangeRateQuoteGateway =
  require("../../../lib/braintree/exchange_rate_quote_gateway").ExchangeRateQuoteGateway;

describe("ExchangeRateQuoteGateway", () =>
  describe("generate", function () {
    let fakeGateway = {
      config: {
        baseMerchantPath() {
          return "";
        },
      },
      http: {
        post(url, params) {
          return Promise.resolve(params);
        },
      },
    };

    it("does not accept invalid key", function (done) {
      let exchangeRateQuoteGateway = new ExchangeRateQuoteGateway(fakeGateway);
      let exchangeRateQuoteRequest = {
        quotes: [
          {
            baseCurrency: "USD",
            quoteCurrency: "EUR",
            invalidKey: "value",
          },
          {
            baseCurrency: "EUR",
            quoteCurrency: "CAD",
          },
        ],
      };

      exchangeRateQuoteGateway.generate(
        exchangeRateQuoteRequest,
        (err, params) => {
          assert.exists(err);
          assert.equal(err.name, "invalidKeysError");
          assert.equal(err.type, "invalidKeysError");
          assert.equal(
            err.message,
            "These keys are invalid: quotes[invalidKey]"
          );
          assert.notExists(params);
          done();
        }
      );
    });

    it("accepts valid keys", function (done) {
      sinon.stub(GraphQLClient.prototype, "query").resolves({
        data: {
          generateExchangeRateQuote: {
            clientMutationId: null,
            quotes: [
              {
                id: "ZXhjaGFuZ2VyYXRlcXVvdGVfMDEyM0FCQw",
                baseAmount: {
                  value: "15.16",
                  currencyCode: "USD",
                },
                quoteAmount: {
                  value: "12.16",
                  currencyCode: "EUR",
                },
                exchangeRate: "0.997316360864",
                tradeRate: "0.01",
                expiresAt: "2021-06-16T02:00:00.000000Z",
                refreshesAt: "2021-06-16T00:00:00.000000Z",
              },
            ],
          },
        },
        extensions: {
          requestId: "9e30486e-be31-4477-942f-26f30e93a5ac",
        },
      });

      let exchangeRateQuoteGateway = new ExchangeRateQuoteGateway(fakeGateway);
      let exchangeRateQuoteRequest = {
        quotes: [
          {
            baseCurrency: "USD",
            quoteCurrency: "EUR",
            baseAmount: "15.16",
          },
        ],
      };

      exchangeRateQuoteGateway.generate(
        exchangeRateQuoteRequest,
        (err, params) => {
          assert.notExists(err);
          assert.isTrue(params.success);
          done();
        }
      );
    });
  }));
