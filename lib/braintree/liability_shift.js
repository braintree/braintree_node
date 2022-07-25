"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;

class LiabilityShift extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
  }
}

module.exports = { LiabilityShift: LiabilityShift };
