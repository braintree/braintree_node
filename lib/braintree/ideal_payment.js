'use strict';

let AttributeSetter = require('./attribute_setter').AttributeSetter;

class IdealPayment extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
  }
}

module.exports = {IdealPayment: IdealPayment};
