'use strict';

let AttributeSetter = require('./attribute_setter').AttributeSetter;

class VisaCheckoutCard extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
  }
}

module.exports = {VisaCheckoutCard: VisaCheckoutCard};
