"use strict";

/**
 * Represents a Bank Account Instant Verification JWT containing a JWT.
 */
class BankAccountInstantVerificationJwt {
  constructor(attributes) {
    this.jwt = attributes.jwt;
  }

  /**
   * Returns the JWT for Bank Account Instant Verification.
   *
   * @return the JWT as a string
   */
  getJwt() {
    return this.jwt;
  }
}

module.exports = { BankAccountInstantVerificationJwt };
