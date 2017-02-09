'use strict';

let AttributeSetter = require('./attribute_setter').AttributeSetter;

class TransactionDetails extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
  }
}

module.exports = {TransactionDetails: TransactionDetails};
