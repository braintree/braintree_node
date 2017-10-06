'use strict';

let AttributeSetter = require('./attribute_setter').AttributeSetter;

class GrantedPaymentInstrumentUpdate extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
  }
}

module.exports = {GrantedPaymentInstrumentUpdate: GrantedPaymentInstrumentUpdate};
