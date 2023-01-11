"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;
let ThreeDSecureInfo = require("./three_d_secure_info").ThreeDSecureInfo;
let SepaDirectDebitNonceDetails =
  require("./sepa_direct_debit_nonce_details").SepaDirectDebitNonceDetails;

class PaymentMethodNonce extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
    if (attributes.threeDSecureInfo) {
      this.threeDSecureInfo = new ThreeDSecureInfo(attributes.threeDSecureInfo);
    } else if (attributes.bankReferenceToken && attributes.ibanLastChars) {
      this.sepaDirectDebitNonceDetails = new SepaDirectDebitNonceDetails(
        attributes
      );
    }
  }
}

module.exports = { PaymentMethodNonce: PaymentMethodNonce };
