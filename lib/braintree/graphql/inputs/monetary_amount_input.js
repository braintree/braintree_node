"use strict";

/**
 * @experimental
 * Input fields representing an amount with currency.
 */
class MonetaryAmountInput {
  constructor(value, currencyCode) {
    this.value = value;
    this.currencyCode = currencyCode;
  }

  /**
   * Converts the input object to a dictionary to pass as variables to a GraphQL mutation.
   * @returns {Object} A dictionary representing the input object.
   */
  toGraphQLVariables() {
    return {
      value: this.value.toString(),
      currencyCode: this.currencyCode,
    };
  }
}

module.exports = MonetaryAmountInput;
