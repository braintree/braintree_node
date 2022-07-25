"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;
let LiabilityShift = require("./liability_shift").LiabilityShift;

class RiskData extends AttributeSetter {
  constructor(attributes) {
    super(attributes);

    if (attributes.liabilityShift) {
      this.liabilityShift = new LiabilityShift(attributes.liabilityShift);
    }
  }
}

module.exports = { RiskData: RiskData };
