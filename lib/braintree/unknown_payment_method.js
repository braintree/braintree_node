"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;

class UnknownPaymentMethod extends AttributeSetter {
  constructor(attributes) {
    let name = (() => {
      let result = [];

      for (let keys of Object.keys(attributes)) {
        result.push(keys);
      }

      return result;
    })()[0];

    if (typeof attributes[name] === "object") {
      attributes[name].imageUrl =
        "https://assets.braintreegateway.com/payment_method_logo/unknown.png";
    }
    super(attributes[name]);
  }
}

module.exports = { UnknownPaymentMethod: UnknownPaymentMethod };
