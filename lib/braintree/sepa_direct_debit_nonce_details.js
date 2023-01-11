"use strict";

class SepaDirectDebitNonceDetails {
  constructor(attributes) {
    const sepaDirectDebitKeys = [
      "bankReferenceToken",
      "correlationId",
      "ibanLastChars",
      "mandateType",
      "merchantOrPartnerCustomerId",
    ];

    for (let key in attributes) {
      if (!sepaDirectDebitKeys.includes(key)) {
        continue;
      }

      this[key] = attributes[key];
    }
  }
}

module.exports = { SepaDirectDebitNonceDetails: SepaDirectDebitNonceDetails };
