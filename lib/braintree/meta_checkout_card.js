"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;

class MetaCheckoutCard extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
  }
}

module.exports = { MetaCheckoutCard: MetaCheckoutCard };
