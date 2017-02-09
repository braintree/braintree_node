'use strict';

let AttributeSetter = require('./attribute_setter').AttributeSetter;

class ApplePayCard extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
  }
}

module.exports = {ApplePayCard: ApplePayCard};
