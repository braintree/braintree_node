"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;

class AccountUpdaterDailyReport extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
  }
}

module.exports = { AccountUpdaterDailyReport: AccountUpdaterDailyReport };
