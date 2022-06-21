"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;
let ExchangeRateQuote = require("./exchange_rate_quote").ExchangeRateQuote;

class ExchangeRateQuotePayload extends AttributeSetter {
  constructor(attributes) {
    super(attributes);

    if (attributes.quotes) {
      this.quotes = attributes.quotes.map(
        (quote) => new ExchangeRateQuote(quote)
      );
    }
  }
}

module.exports = { ExchangeRateQuotePayload: ExchangeRateQuotePayload };
