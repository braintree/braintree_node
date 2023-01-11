"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;

class SepaDirectDebitAccount extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
  }
}

module.exports = { SepaDirectDebitAccount: SepaDirectDebitAccount };
