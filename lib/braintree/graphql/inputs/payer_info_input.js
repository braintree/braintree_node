"use strict";

/**
 * @experimental
 * Input fields for payer information.
 */
class PayerInfoInput {
  constructor(attributes = {}) {
    this.givenName = attributes.givenName;
    this.surname = attributes.surname;
    this.email = attributes.email;
    this.phoneCountryCode = attributes.phoneCountryCode;
    this.phoneNumber = attributes.phoneNumber;
    this.billingAddress = attributes.billingAddress;
    this.shippingAddress = attributes.shippingAddress;
  }

  /**
   * Converts the input object to a dictionary to pass as variables to a GraphQL mutation.
   * @returns {Object} A dictionary representing the input object.
   */
  toGraphQLVariables() {
    const variables = {};

    if (this.givenName) {
      variables.givenName = this.givenName;
    }
    if (this.surname) {
      variables.surname = this.surname;
    }
    if (this.email) {
      variables.email = this.email;
    }
    if (this.phoneCountryCode) {
      variables.phoneCountryCode = this.phoneCountryCode;
    }
    if (this.phoneNumber) {
      variables.phoneNumber = this.phoneNumber;
    }
    if (this.billingAddress) {
      variables.billingAddress = this.billingAddress.toGraphQLVariables();
    }
    if (this.shippingAddress) {
      variables.shippingAddress = this.shippingAddress.toGraphQLVariables();
    }

    return variables;
  }
}

module.exports = PayerInfoInput;
