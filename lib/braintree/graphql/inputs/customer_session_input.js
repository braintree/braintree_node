"use strict";

/**
 * @experimental
 * Customer identifying information for a PayPal customer session.
 */
class CustomerSessionInput {
  constructor(builder) {
    this._email = builder._email;
    this._phone = builder._phone;
    this._hashedEmail = builder._hashedEmail;
    this._hashedPhoneNumber = builder._hashedPhoneNumber;
    this._deviceFingerprintId = builder._deviceFingerprintId;
    this._paypalAppInstalled = builder._paypalAppInstalled;
    this._venmoAppInstalled = builder._venmoAppInstalled;
    this._userAgent = builder._userAgent;
  }

  /**
   *
   * @return A dictionary representing the input object, to pass as variables to a GraphQL mutation
   */
  toGraphQLVariables() {
    const variables = {};

    if (this._email) {
      variables.email = this._email;
    }
    if (this._phone) {
      variables.phone = this._phone.toGraphQLVariables();
    }
    if (this._hashedEmail) {
      variables.hashedEmail = this._hashedEmail;
    }
    if (this._hashedPhoneNumber) {
      variables.hashedPhoneNumber = this._hashedPhoneNumber;
    }
    if (this._deviceFingerprintId) {
      variables.deviceFingerprintId = this._deviceFingerprintId;
    }
    variables.paypalAppInstalled = this._paypalAppInstalled;
    variables.venmoAppInstalled = this._venmoAppInstalled;
    if (this._userAgent) {
      variables.userAgent = this._userAgent;
    }

    return variables;
  }

  /**
   * Creates a builder instance for fluent construction of CustomerSessionInput objects.
   *
   * @return CustomerSessionInput.Builder
   */
  static builder() {
    // eslint-disable-next-line no-use-before-define
    return new Builder();
  }
}

/**
 * This class provides a fluent interface for constructing CustomerSessionInput objects.
 */
class Builder {
  constructor() {
    this._email = null;
    this._phone = null;
    this._hashedEmail = null;
    this._hashedPhoneNumber = null;
    this._deviceFingerprintId = null;
    this._paypalAppInstalled = null;
    this._venmoAppInstalled = null;
    this._userAgent = null;
  }

  /**
   * Sets the customer email address.
   *
   * @param {string} email The customer email address.
   *
   * @return this
   */
  email(email) {
    this._email = email;

    return this;
  }

  /**
   * Sets the customer phone number input object.
   *
   * @param {PhoneInput} phone The input object representing the customer phone number.
   *
   * @return this
   */
  phone(phone) {
    this._phone = phone;

    return this;
  }

  /**
   * Sets the hashed customer email address.
   *
   * @param {string} hashedEmail The hashed customer email address.
   *
   * @return this
   */
  hashedEmail(hashedEmail) {
    this._hashedEmail = hashedEmail;

    return this;
  }

  /**
   * Sets the hashed customer phone number.
   *
   * @param {string} hashedPhoneNumber The hashed customer phone number.
   *
   * @return this
   */
  hashedPhoneNumber(hashedPhoneNumber) {
    this._hashedPhoneNumber = hashedPhoneNumber;

    return this;
  }

  /**
   * Sets the customer device fingerprint ID.
   *
   * @param {string} deviceFingerprintId The customer device fingerprint ID.
   *
   * @return this
   */
  deviceFingerprintId(deviceFingerprintId) {
    this._deviceFingerprintId = deviceFingerprintId;

    return this;
  }

  /**
   * Sets whether the PayPal app is installed on the customer's device.
   *
   * @param {boolean} paypalAppInstalled True if the PayPal app is installed, false otherwise.
   *
   * @return this
   */
  paypalAppInstalled(paypalAppInstalled) {
    this._paypalAppInstalled = paypalAppInstalled;

    return this;
  }

  /**
   * Sets whether the Venmo app is installed on the customer's device.
   *
   * @param {boolean} venmoAppInstalled True if the Venmo app is installed, false otherwise.
   *
   * @return this
   */
  venmoAppInstalled(venmoAppInstalled) {
    this._venmoAppInstalled = venmoAppInstalled;

    return this;
  }

  /**
   * Sets the user agent from the request originating from the customer's device.
   * This will be used to identify the customer's operating system and browser versions.
   *
   * @param {string} userAgent The user agent.
   *
   * @return this
   */
  userAgent(userAgent) {
    this._userAgent = userAgent;

    return this;
  }

  build() {
    return new CustomerSessionInput(this);
  }
}

module.exports = CustomerSessionInput;
