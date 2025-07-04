"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;
let CreditCardVerification =
  require("./credit_card_verification").CreditCardVerification;

class CreditCard extends AttributeSetter {
  static initClass() {
    this.CardType = {
      AmEx: "American Express",
      CarteBlanche: "Carte Blanche",
      ChinaUnionPay: "China UnionPay",
      DinersClubInternational: "Diners Club",
      Discover: "Discover",
      Elo: "Elo",
      JCB: "JCB",
      Laser: "Laser",
      UKMaestro: "UK Maestro",
      Maestro: "Maestro",
      MasterCard: "MasterCard",
      Solo: "Solo",
      Switch: "Switch",
      Visa: "Visa",
      Unknown: "Unknown",
      All() {
        let all = [];

        for (let key in this) {
          if (!this.hasOwnProperty(key)) {
            continue;
          }
          let value = this[key];

          if (key !== "All") {
            all.push(value);
          }
        }

        return all;
      },
    };

    this.CustomerLocation = {
      International: "international",
      US: "us",
    };

    this.CardTypeIndicator = {
      Yes: "Yes",
      No: "No",
      Unknown: "Unknown",
    };

    this.DebitNetwork = {
      Accel: "ACCEL",
      Nyce: "NYCE",
      Pulse: "PULSE",
      Star: "STAR",
      StarAccess: "STAR_ACCESS",
      Maestro: "MAESTRO",
      All() {
        let all = [];

        for (let key in this) {
          if (!this.hasOwnProperty(key)) {
            continue;
          }
          let value = this[key];

          if (key !== "All") {
            all.push(value);
          }
        }

        return all;
      },
    };

    this.Business =
      this.Commercial =
      this.Consumer =
      this.Corporate =
      this.CountryOfIssuance =
      this.Debit =
      this.DurbinRegulated =
      this.Healthcare =
      this.IssuingBank =
      this.Payroll =
      this.Prepaid =
      this.PrepaidReloadable =
      this.ProductId =
      this.Purchase =
        this.CardTypeIndicator;
  }

  constructor(attributes) {
    super(attributes);
    this.maskedNumber = `${this.bin}******${this.last4}`;
    this.expirationDate = `${this.expirationMonth}/${this.expirationYear}`;
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
CreditCard.initClass();

module.exports = { CreditCard: CreditCard };
