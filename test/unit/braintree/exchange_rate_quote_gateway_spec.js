"use strict";

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
  }));
