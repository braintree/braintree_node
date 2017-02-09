'use strict';

let AttributeSetter = require('./attribute_setter').AttributeSetter;

class FacilitatorDetails extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
  }
}

module.exports = {FacilitatorDetails: FacilitatorDetails};
