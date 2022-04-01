"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;

class VenmoAccountDetails extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
  }
}

module.exports = { VenmoAccountDetails: VenmoAccountDetails };
