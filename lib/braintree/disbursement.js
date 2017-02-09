'use strict';

let AttributeSetter = require('./attribute_setter').AttributeSetter;

class Disbursement extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
  }
}

module.exports = {Disbursement: Disbursement};
