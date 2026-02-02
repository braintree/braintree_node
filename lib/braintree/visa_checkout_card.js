"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;

/**
 * DEPRECATED: Visa Checkout is no longer supported for creating new transactions.
 * This class is retained for search functionality and historical transaction data only.
 */
class VisaCheckoutCard extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
  }
}

module.exports = { VisaCheckoutCard: VisaCheckoutCard };
