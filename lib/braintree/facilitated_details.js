"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;

class FacilitatedDetails extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
  }
}

module.exports = { FacilitatedDetails: FacilitatedDetails };
