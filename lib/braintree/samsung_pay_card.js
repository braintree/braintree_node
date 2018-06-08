'use strict';

let AttributeSetter = require('./attribute_setter').AttributeSetter;

class SamsungPayCard extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
  }
}

module.exports = {SamsungPayCard: SamsungPayCard};
