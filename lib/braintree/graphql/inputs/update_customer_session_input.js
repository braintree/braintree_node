"use strict";
/**
 * Represents the input to request an update to a PayPal customer session.
 */
class UpdateCustomerSessionInput {
  constructor(builder) {
    this._merchantAccountId = builder._merchantAccountId;
    this._sessionId = builder._sessionId;
    this._customer = builder._customer;
  }

  /**
   *
   * @return A dictionary representing the input object, to pass as variables to a GraphQL mutation
   */
  toGraphQLVariables() {
    const variables = {};

    if (this._merchantAccountId) {
      variables.merchantAccountId = this._merchantAccountId;
    }
    variables.sessionId = this._sessionId;
    if (this._customer) {
      variables.customer = this._customer.toGraphQLVariables();
    }

    return variables;
  }

  /**
   * Creates a builder instance for fluent construction of UpdateCustomerSessionInput objects.
   *
   * @param {string} sessionId ID of the customer session to be updated.
   *
   * @return UpdateCustomerSessionInput.Builder
   */
  static builder(sessionId) {
    // eslint-disable-next-line no-use-before-define
    return new Builder(sessionId);
  }
}

/**
 * This class provides a fluent interface for constructing CreateCustomerSessionInput objects.
 */
class Builder {
  constructor(sessionId) {
    this._sessionId = sessionId;
    this._merchantAccountId = null;
    this._customer = null;
  }

  /**
   * Sets the merchant account ID.
   *
   * @param {string} merchantAccountId The merchant account ID.
   *
   * @return this
   */
  merchantAccountId(merchantAccountId) {
    this._merchantAccountId = merchantAccountId;

    return this;
  }

  /**
   * Sets the input object representing customer information relevant to the customer session.
   *
   * @param {CustomerSessionInput} customer The input object representing the customer information relevant to the customer session.
   *
   * @return this
   */
  customer(customer) {
    this._customer = customer;

    return this;
  }

  build() {
    return new UpdateCustomerSessionInput(this);
  }
}

module.exports = UpdateCustomerSessionInput;
