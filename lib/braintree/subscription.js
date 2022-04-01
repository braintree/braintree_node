"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;
let Transaction = require("./transaction").Transaction;

class Subscription extends AttributeSetter {
  static initClass() {
    this.Source = {
      Api: "api",
      ControlPanel: "control_panel",
      Recurring: "recurring",
    };

    this.Status = {
      Active: "Active",
      Canceled: "Canceled",
      Expired: "Expired",
      PastDue: "Past Due",
      Pending: "Pending",
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
  }

  constructor(attributes, gateway) {
    super(attributes, gateway);
    this.transactions = attributes.transactions.map(
      (transactionAttributes) => new Transaction(transactionAttributes, gateway)
    );
  }
}
Subscription.initClass();

module.exports = { Subscription: Subscription };
