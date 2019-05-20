'use strict';

let AttributeSetter = require('./attribute_setter').AttributeSetter;

class LocalPayment extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
  }
}

module.exports = {LocalPayment: LocalPayment};
