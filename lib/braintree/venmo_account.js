"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;

class VenmoAccount extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
  }
}

module.exports = { VenmoAccount: VenmoAccount };
