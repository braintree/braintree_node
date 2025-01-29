"use strict";

/**
 * Represents the input to request the creation of a PayPal customer session.
 */
class CreateCustomerSessionInput {
  constructor(builder) {
    this._merchantAccountId = builder._merchantAccountId;
    this._sessionId = builder._sessionId;
    this._customer = builder._customer;
    this._domain = builder._domain;
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
    if (this._sessionId) {
      variables.sessionId = this._sessionId;
    }
    if (this._customer) {
      variables.customer = this._customer.toGraphQLVariables();
    }
    if (this._domain) {
      variables.domain = this._domain;
    }

    return variables;
  }

  /**
   * Creates a builder instance for fluent construction of CreateCustomerSessionInput objects.
   *
   * @return CreateCustomerSessionInput.Builder
   */
  static builder() {
    // eslint-disable-next-line no-use-before-define
    return new Builder();
  }
}

/**
 * This class provides a fluent interface for constructing CreateCustomerSessionInput objects.
 */
class Builder {
  constructor() {
    this._merchantAccountId = null;
    this._sessionId = null;
    this._customer = null;
    this._domain = null;
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
   * Sets the customer session ID.
   *
   * @param {string} $sessionId The customer session ID.
   *
   * @return this
   */
  sessionId(sessionId) {
    this._sessionId = sessionId;

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

  /**
   * Sets the customer domain.
   *
   * @param {string} domain The customer domain.
   *
   * @return this
   */
  domain(domain) {
    this._domain = domain;

    return this;
  }

  build() {
    return new CreateCustomerSessionInput(this);
  }
}

module.exports = CreateCustomerSessionInput;
