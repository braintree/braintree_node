"use strict";

/**
 * @experimental
 * Input fields for billing address information.
 */
class BillingAddressInput {
  constructor(attributes = {}) {
    this.countryCodeAlpha2 = attributes.countryCodeAlpha2;
    this.streetAddress = attributes.streetAddress;
    this.extendedAddress = attributes.extendedAddress;
    this.locality = attributes.locality;
    this.region = attributes.region;
    this.postalCode = attributes.postalCode;
  }

  /**
   * Converts the input object to a dictionary to pass as variables to a GraphQL mutation.
   * @returns {Object} A dictionary representing the input object.
   */
  toGraphQLVariables() {
    const variables = {};

    if (this.countryCodeAlpha2) {
      variables.countryCode = this.countryCodeAlpha2;
    }
    if (this.streetAddress) {
      variables.streetAddress = this.streetAddress;
    }
    if (this.extendedAddress) {
      variables.extendedAddress = this.extendedAddress;
    }
    if (this.locality) {
      variables.locality = this.locality;
    }
    if (this.region) {
      variables.region = this.region;
    }
    if (this.postalCode) {
      variables.postalCode = this.postalCode;
    }

    return variables;
  }
}

module.exports = BillingAddressInput;
