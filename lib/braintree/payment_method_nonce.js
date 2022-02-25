"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;
let ThreeDSecureInfo = require("./three_d_secure_info").ThreeDSecureInfo;

class PaymentMethodNonce extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
    if (attributes.threeDSecureInfo) {
      this.threeDSecureInfo = new ThreeDSecureInfo(attributes.threeDSecureInfo);
    }
  }
}

module.exports = { PaymentMethodNonce: PaymentMethodNonce };
