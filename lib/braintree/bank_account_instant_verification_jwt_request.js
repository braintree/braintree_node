"use strict";

/**
 * Provides a fluent interface to build requests for creating Bank Account Instant Verification JWTs.
 */
class BankAccountInstantVerificationJwtRequest {
  constructor() {
    this._businessName = null;
    this._returnUrl = null;
    this._cancelUrl = null;
  }

  /**
   * Sets the officially registered business name for the merchant.
   *
   * @param {string} businessName the business name
   * @return the BankAccountInstantVerificationJwtRequest
   */
  businessName(businessName) {
    this._businessName = businessName;

    return this;
  }

  /**
   * Sets the URL to redirect the consumer after successful account selection.
   *
   * @param {string} returnUrl the return URL
   * @return the BankAccountInstantVerificationJwtRequest
   */
  returnUrl(returnUrl) {
    this._returnUrl = returnUrl;

    return this;
  }

  /**
   * Sets the URL to redirect the consumer upon cancellation of the Open Banking flow.
   *
   * @param {string} cancelUrl the cancel URL
   * @return the BankAccountInstantVerificationJwtRequest
   */
  cancelUrl(cancelUrl) {
    this._cancelUrl = cancelUrl;

    return this;
  }

  getBusinessName() {
    return this._businessName;
  }

  getReturnUrl() {
    return this._returnUrl;
  }

  getCancelUrl() {
    return this._cancelUrl;
  }

  toGraphQLVariables() {
    const variables = {};
    const input = {};

    if (this._businessName !== null) {
      input.businessName = this._businessName;
    }
    if (this._returnUrl !== null) {
      input.returnUrl = this._returnUrl;
    }
    // cancelUrl is required by the GraphQL schema, use returnUrl as default if not provided
    if (this._cancelUrl !== null) {
      input.cancelUrl = this._cancelUrl;
    } else if (this._returnUrl !== null) {
      input.cancelUrl = this._returnUrl;
    }

    variables.input = input;

    return variables;
  }
}

module.exports = { BankAccountInstantVerificationJwtRequest };
