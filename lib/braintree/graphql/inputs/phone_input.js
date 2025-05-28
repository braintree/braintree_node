"use strict";

/**
 * @experimental
 * Phone number input for PayPal customer session.
 */
class PhoneInput {
  constructor(builder) {
    this._countryPhoneCode = builder._countryPhoneCode;
    this._phoneNumber = builder._phoneNumber;
    this._extensionNumber = builder._extensionNumber;
  }

  /**
   *
   * @return A dictionary representing the input object, to pass as variables to a GraphQL mutation
   */
  toGraphQLVariables() {
    const variables = {};

    if (this._countryPhoneCode) {
      variables.countryPhoneCode = this._countryPhoneCode;
    }
    if (this._phoneNumber) {
      variables.phoneNumber = this._phoneNumber;
    }
    if (this._extensionNumber) {
      variables.extensionNumber = this._extensionNumber;
    }

    return variables;
  }

  /**
   * Creates a builder instance for fluent construction of PhoneInput objects.
   *
   * @return PhoneInput.Builder
   */
  static builder() {
    // eslint-disable-next-line no-use-before-define
    return new Builder();
  }
}

/**
 * This class provides a fluent interface for constructing PhoneInput objects.
 */
class Builder {
  /**
   * Sets the country phone code.
   *
   * @param {string} countryPhoneCode The country phone code.
   *
   * @return this
   */
  countryPhoneCode(countryPhoneCode) {
    this._countryPhoneCode = countryPhoneCode;

    return this;
  }

  /**
   * Sets the phone number.
   *
   * @param {string} phoneNumber The phone number.
   *
   * @return this
   */
  phoneNumber(phoneNumber) {
    this._phoneNumber = phoneNumber;

    return this;
  }

  /**
   * Sets the extension number.
   *
   * @param {string} extensionNumber The extension number.
   *
   * @return self
   */
  extensionNumber(extensionNumber) {
    this._extensionNumber = extensionNumber;

    return this;
  }

  build() {
    return new PhoneInput(this);
  }
}

module.exports = PhoneInput;
