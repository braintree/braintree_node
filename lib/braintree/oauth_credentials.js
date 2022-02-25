"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;

class OAuthCredentials extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
  }
}

module.exports = { OAuthCredentials: OAuthCredentials };
