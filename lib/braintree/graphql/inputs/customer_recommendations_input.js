"use strict";

/**
 * Represents the input to request PayPal customer session recommendations.
 */
class CustomerRecommendationsInput {
  constructor(builder) {
    this._merchantAccountId = builder._merchantAccountId;
    this._sessionId = builder._sessionId;
    this._recommendations = builder._recommendations;
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
    if (this._recommendations) {
      variables.recommendations = this._recommendations;
    }
    if (this._customer) {
      variables.customer = this._customer.toGraphQLVariables();
    }

    return variables;
  }

  /**
   * Creates a builder instance for fluent construction of CustomerRecommendationsInput objects.
   *
   * @param {string} sessionId The customer session id
   * @param {Recommendations[]}  recommendations  The types of recommendations to be requested
   *
   * @return CustomerRecommendationsInput.Builder
   */
  static builder(sessionId, recommendations) {
    // eslint-disable-next-line no-use-before-define
    return new Builder(sessionId, recommendations);
  }
}

/**
 * This class provides a fluent interface for constructing CustomerRecommendationsInput objects.
 */
class Builder {
  constructor(sessionId, recommendations) {
    this._sessionId = sessionId;
    this._recommendations = recommendations;
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
    return new CustomerRecommendationsInput(this);
  }
}

module.exports = CustomerRecommendationsInput;
