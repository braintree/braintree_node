'use strict';

let AttributeSetter = require('./attribute_setter').AttributeSetter;

class AmexExpressCheckoutCard extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
  }
}

module.exports = {AmexExpressCheckoutCard: AmexExpressCheckoutCard};
