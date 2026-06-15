"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;

class PayPalAccount extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
    // DEPRECATED The debugId attribute is deprecated
  }
}

module.exports = { PayPalAccount: PayPalAccount };
