"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;

class ThreeDSecureInfo extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
  }
}

module.exports = { ThreeDSecureInfo: ThreeDSecureInfo };
