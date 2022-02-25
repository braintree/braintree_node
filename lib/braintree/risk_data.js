"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;

class RiskData extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
  }
}

module.exports = { RiskData: RiskData };
