"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;

class LocalPayment extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
    // DEPRECATED The debugId attribute is deprecated
  }
}

module.exports = { LocalPayment: LocalPayment };
