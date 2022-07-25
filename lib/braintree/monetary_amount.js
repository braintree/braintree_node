"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;

class MonetaryAmount extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
  }
}

module.exports = { MonetaryAmount: MonetaryAmount };
