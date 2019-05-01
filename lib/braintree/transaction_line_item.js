'use strict';

let AttributeSetter = require('./attribute_setter').AttributeSetter;

class TransactionLineItem extends AttributeSetter {
  static initClass() {
    this.Kind = {
      Credit: 'credit',
      Debit: 'debit',
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
  }
}
TransactionLineItem.initClass();

module.exports = {TransactionLineItem: TransactionLineItem};
