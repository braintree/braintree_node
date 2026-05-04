"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;
let CreditCardVerification =
  require("./credit_card_verification").CreditCardVerification;

class ApplePayCard extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
    if (attributes) {
      let sortedVerifications = (attributes.verifications || []).sort(
        (a, b) => b.created_at - a.created_at
      );

      if (sortedVerifications[0]) {
        this.verification = new CreditCardVerification(sortedVerifications[0]);
      }
    }
  }
}

module.exports = { ApplePayCard: ApplePayCard };
