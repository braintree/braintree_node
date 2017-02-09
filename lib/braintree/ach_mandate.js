'use strict';

let AttributeSetter = require('./attribute_setter').AttributeSetter;

class AchMandate extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
    this.acceptedAt = new Date(this.acceptedAt);
  }
}

module.exports = {AchMandate: AchMandate};
