'use strict';

let AttributeSetter = require('./attribute_setter').AttributeSetter;

class LocalPaymentCompleted extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
  }
}

module.exports = {LocalPaymentCompleted: LocalPaymentCompleted};
