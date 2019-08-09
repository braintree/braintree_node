'use strict';

let AttributeSetter = require('./attribute_setter').AttributeSetter;

class PayPalHereDetails extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
  }
}

module.exports = {PayPalHereDetails: PayPalHereDetails};
