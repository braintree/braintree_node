"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;

// NEXT_MAJOR_VERSION remove this class
// SamsungPayCard has been deprecated
class SamsungPayCard extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
  }
}

module.exports = { SamsungPayCard: SamsungPayCard };
