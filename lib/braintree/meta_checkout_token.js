"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;

class MetaCheckoutToken extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
  }
}

module.exports = { MetaCheckoutToken: MetaCheckoutToken };
