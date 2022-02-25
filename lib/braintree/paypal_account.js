"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;

class PayPalAccount extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
  }
}

module.exports = { PayPalAccount: PayPalAccount };
