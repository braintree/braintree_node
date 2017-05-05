'use strict';

let AttributeSetter = require('./attribute_setter').AttributeSetter;

class MasterpassCard extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
  }
}

module.exports = {MasterpassCard: MasterpassCard};
