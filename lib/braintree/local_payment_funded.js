'use strict';

let Transaction = require('./transaction').Transaction;

let AttributeSetter = require('./attribute_setter').AttributeSetter;

class LocalPaymentFunded extends AttributeSetter {
  constructor(attributes, gateway) {
    super(attributes);

    if (attributes.transaction) { this.transaction = new Transaction(attributes.transaction, gateway); }
  }
}

module.exports = {LocalPaymentFunded: LocalPaymentFunded};
