"use strict";

let AdvancedSearch = require("./advanced_search").AdvancedSearch;
let CreditCard = require("./credit_card").CreditCard;
let CreditCardVerification =
  require("./credit_card_verification").CreditCardVerification;

class CreditCardVerificationSearch extends AdvancedSearch {
  static initClass() {
    this.textFields(
      "billingAddressDetailsPostalCode",
      "creditCardCardholderName",
      "customerEmail",
      "customerId",
      "id",
      "paymentMethodToken"
    );

    this.equalityFields("creditCardExpirationDate");

    this.partialMatchFields("creditCardNumber");

    this.multipleValueField("creditCardCardType", {
      // eslint-disable-next-line new-cap
      allows: CreditCard.CardType.All(),
    });
    this.multipleValueField("status", {
      // eslint-disable-next-line new-cap
      allows: CreditCardVerification.StatusType.All(),
    });
    this.multipleValueField("ids");

    this.rangeFields("createdAt");
  }
}
CreditCardVerificationSearch.initClass();

module.exports = { CreditCardVerificationSearch: CreditCardVerificationSearch };
