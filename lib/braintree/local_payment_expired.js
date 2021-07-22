'use strict';

let AttributeSetter = require('./attribute_setter').AttributeSetter;

class LocalPaymentExpired extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
  }
}

module.exports = {LocalPaymentExpired: LocalPaymentExpired};
