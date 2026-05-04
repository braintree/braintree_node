"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;

class LocalPaymentContext extends AttributeSetter {
  constructor(attributes) {
    super(attributes);

    // Handle amount parsing with support for both currencyCode and currencyIsoCode
    if (attributes.amount) {
      this.amount = {
        value: attributes.amount.value,
        currencyCode:
          attributes.amount.currencyCode || attributes.amount.currencyIsoCode,
      };
    }
  }
}

module.exports = { LocalPaymentContext: LocalPaymentContext };
