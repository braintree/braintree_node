'use strict';

let AttributeSetter = require('./attribute_setter').AttributeSetter;

class CoinbaseAccount extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
  }
}

module.exports = {CoinbaseAccount: CoinbaseAccount};
