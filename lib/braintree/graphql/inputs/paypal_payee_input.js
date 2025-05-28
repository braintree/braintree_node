"use strict";

/**
 * @experimental
 * The details for the merchant who receives the funds and fulfills the order. The merchant is also known as the payee.
 */
class PayPalPayeeInput {
  constructor(builder) {
    this._emailAddress = builder._emailAddress;
    this._clientId = builder._clientId;
  }

  /**
   *
   * @return A dictionary representing the input object, to pass as variables to a GraphQL mutation
   */
  toGraphQLVariables() {
    const variables = {};

    if (this._emailAddress) {
      variables.emailAddress = this._emailAddress;
    }
    if (this._clientId) {
      variables.clientId = this._clientId;
    }

    return variables;
  }

  /**
   * Creates a builder instance for fluent construction of PayPalPayeeInput objects.
   *
   * @return PayPalPayeeInput.Builder
   */
  static builder() {
    // eslint-disable-next-line no-use-before-define
    return new Builder();
  }
}

class Builder {
  constructor() {
    this._emailAddress = null;
    this._clientId = null;
  }

  /**
   * Sets the email address this merchant.
   *
   * @param {string} emailAddress - The email address.
   *
   * @returns this
   */
  emailAddress(emailAddress) {
    this._emailAddress = emailAddress;

    return this;
  }

  /**
   * Sets the public ID for the payee- or merchant-created app. Introduced to support use cases, such as BrainTree integration with PayPal, where payee 'emailAddress' or 'merchantId' is not available.
   *
   * @param {string} clientId - The public ID for the payee.
   *
   * @returns {this} The current instance for method chaining.
   */
  clientId(clientId) {
    this._clientId = clientId;

    return this;
  }

  build() {
    return new PayPalPayeeInput(this);
  }
}

module.exports = PayPalPayeeInput;
