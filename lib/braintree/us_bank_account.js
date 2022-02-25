"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;
let AchMandate = require("./ach_mandate").AchMandate;
let UsBankAccountVerification =
  require("./us_bank_account_verification").UsBankAccountVerification;

class UsBankAccount extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
    this.achMandate = new AchMandate(this.achMandate);

    if (this.verifications) {
      this.verifications = this.verifications.map(
        (usBankAccountVerification) => {
          return new UsBankAccountVerification(usBankAccountVerification);
        }
      );
    } else {
      this.verifications = [];
    }
  }
}

module.exports = { UsBankAccount: UsBankAccount };
