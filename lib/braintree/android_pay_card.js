'use strict';

let AttributeSetter = require('./attribute_setter').AttributeSetter;

class AndroidPayCard extends AttributeSetter {
  constructor(attributes) {
    super(attributes);

    if (attributes) {
      this.cardType = attributes.virtualCardType;
      this.last4 = attributes.virtualCardLast4;
    }
  }
}

module.exports = {AndroidPayCard: AndroidPayCard};
