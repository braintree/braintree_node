"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;

class LocalPaymentReversed extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
  }
}

module.exports = { LocalPaymentReversed: LocalPaymentReversed };
