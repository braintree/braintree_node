"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;

class VenmoProfileData extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
  }
}

module.exports = { VenmoProfileData: VenmoProfileData };
