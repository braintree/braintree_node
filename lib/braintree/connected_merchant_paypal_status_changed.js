"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;

class ConnectedMerchantPayPalStatusChanged extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
    this.merchantId = this.merchantPublicId;
  }
}

module.exports = { ConnectedMerchantPayPalStatusChanged };
