"use strict";

/**
 * @experimental
 * Payee and Amount of the item purchased.
 */
class PayPalPurchaseUnitInput {
  constructor(builder) {
    this._payee = builder._payee;
    this._amount = builder._amount;
  }

  /**
   *
   * @return A dictionary representing the input object, to pass as variables to a GraphQL mutation
   */
  toGraphQLVariables() {
    const variables = {};

    if (this._payee) {
      variables.payee = this._payee.toGraphQLVariables();
    }
    if (this._amount) {
      variables.amount = this._amount.toGraphQLVariables();
    }

    return variables;
  }

  /**
   * Creates a builder instance for fluent construction of PayPalPurchaseUnitInput objects.
   *
   * @param {MonetaryAmountInput} amount - The amount for the purchase unit.
   *
   * @return PayPalPurchaseUnitInput.Builder
   */
  static builder(amount) {
    // eslint-disable-next-line no-use-before-define
    return new Builder(amount);
  }
}

class Builder {
  /**
   * Creates an instance of the PayPalPurchaseUnit builder class.
   *
   * @param {MonetaryAmountInput} amount - The amount for the purchase unit.
   *
   */
  constructor(amount) {
    this._payee = null;
    this._amount = amount;
  }

  /**
   * Sets the PayPal payee.
   *
   * @param {PayPalPayeeInput} payee - The PayPal payee.
   *
   * @returns this
   */
  payee(payee) {
    this._payee = payee;

    return this;
  }

  build() {
    return new PayPalPurchaseUnitInput(this);
  }
}

module.exports = PayPalPurchaseUnitInput;
