'use strict';

let AttributeSetter = require('./attribute_setter').AttributeSetter;
let Transaction = require('./transaction').Transaction;

class Subscription extends AttributeSetter {
  static initClass() {
    this.Source = {
      Api: 'api',
      ControlPanel: 'control_panel',
      Recurring: 'recurring'
    };

    this.Status = {
      Active: 'Active',
      Canceled: 'Canceled',
      Expired: 'Expired',
      PastDue: 'Past Due',
      Pending: 'Pending',
      All() {
        let all = [];

        for (let key in this) {
          if (!this.hasOwnProperty(key)) {
            continue;
          }
          let value = this[key];

          if (key !== 'All') { all.push(value); }
        }
        return all;
      }
    };
  }

  constructor(attributes) {
    super(attributes);

    if (!attributes.transactions) {
      this.transactions = [];
    }
    else if (attributes.transactions instanceof Array) {
      this.transactions = attributes.transactions.map((transactionAttributes) => {
        return new Transaction(transactionAttributes);
      });
    } else {
      // this creates an Array of a single element as required to assert transaction using .length method.
      this.transactions = [].concat(new Transaction(attributes.transactions));
    }
  }
}
Subscription.initClass();

module.exports = {Subscription: Subscription};
