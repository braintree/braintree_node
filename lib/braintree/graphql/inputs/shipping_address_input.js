"use strict";

/**
 * @experimental
 * Input fields for shipping address.
 */
class ShippingAddressInput {
  constructor(attributes = {}) {
    this.streetAddress = attributes.streetAddress;
    this.extendedAddress = attributes.extendedAddress;
    this.locality = attributes.locality;
    this.region = attributes.region;
    this.postalCode = attributes.postalCode;
    this.countryCode = attributes.countryCode;
  }

  /**
   * Converts the input object to a dictionary to pass as variables to a GraphQL mutation.
   * @returns {Object} A dictionary representing the input object.
   */
  toGraphQLVariables() {
    const variables = {};

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
    if (this.countryCode) {
      variables.countryCode = this.countryCode;
    }

    return variables;
  }
}

module.exports = ShippingAddressInput;
