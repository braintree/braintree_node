"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;

class SepaDirectDebitAccountDetails extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
  }
}

module.exports = {
  SepaDirectDebitAccountDetails: SepaDirectDebitAccountDetails,
};
