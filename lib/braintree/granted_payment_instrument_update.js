"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;
let PaymentMethodNonce = require("./payment_method_nonce").PaymentMethodNonce;

class GrantedPaymentInstrumentUpdate extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
    if (attributes.paymentMethodNonce) {
      this.paymentMethodNonce = new PaymentMethodNonce(
        attributes.paymentMethodNonce
      );
    }
  }
}

module.exports = {
  GrantedPaymentInstrumentUpdate: GrantedPaymentInstrumentUpdate,
};
