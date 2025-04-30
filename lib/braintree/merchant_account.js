"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;

class MerchantAccount extends AttributeSetter {
  static initClass() {
    this.Status = {
      Pending: "pending",
      Active: "active",
      Suspended: "suspended",
    };

    this.FundingDestination = {
      Bank: "bank",
      Email: "email",
      MobilePhone: "mobile_phone",
    };
  }

  constructor(attributes) {
    super(attributes);
  }
}
MerchantAccount.initClass();

module.exports = { MerchantAccount: MerchantAccount };
