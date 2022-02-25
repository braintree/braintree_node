"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;
let MonetaryAmount = require("./monetary_amount").MonetaryAmount;

class ExchangeRateQuote extends AttributeSetter {
  constructor(attributes) {
    super(attributes);

    if (attributes.baseAmount) {
      this.baseAmount = new MonetaryAmount(attributes.baseAmount);
    }

    if (attributes.quoteAmount) {
      this.quoteAmount = new MonetaryAmount(attributes.quoteAmount);
    }
  }
}

module.exports = { ExchangeRateQuote: ExchangeRateQuote };
