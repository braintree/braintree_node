"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;

class Disbursement extends AttributeSetter {
  static initClass() {
    this.Types = {
      Credit: "credit",
      Debit: "debit",
    };
  }

  constructor(attributes) {
    super(attributes);
  }

  isDebit() {
    return this.disbursementType === Disbursement.Types.Debit;
  }

  isCredit() {
    return this.disbursementType === Disbursement.Types.Credit;
  }
}

Disbursement.initClass();

module.exports = { Disbursement: Disbursement };
