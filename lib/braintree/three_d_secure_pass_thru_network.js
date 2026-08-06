"use strict";

/**
 * @module three_d_secure_pass_thru
 */

/**
 * Enum for the supported `network` values on `threeDSecurePassThru`.
 * @readonly
 * @enum {string}
 */
const ThreeDSecurePassThruNetwork = {
  Eftpos: "eftpos",
  MasterCard: "Mastercard",
  Visa: "Visa",
};

module.exports = { ThreeDSecurePassThruNetwork };
