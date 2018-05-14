'use strict';

let AttributeSetter = require('./attribute_setter').AttributeSetter;

class ConnectedMerchantStatusTransitioned extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
    this.merchantId = this.merchantPublicId;
  }
}

module.exports = {ConnectedMerchantStatusTransitioned};
