"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;

class UsBankAccountVerification extends AttributeSetter {
  static initClass() {
    this.StatusType = {
      Failed: "failed",
      GatewayRejected: "gateway_rejected",
      Pending: "pending",
      ProcessorDeclined: "processor_declined",
      Verified: "verified",
      All() {
        let all = [];

        for (let key in this) {
          if (!this.hasOwnProperty(key)) {
            continue;
          }
          let value = this[key];

          if (key !== "All") {
            all.push(value);
          }
        }

        return all;
      },
    };

    this.VerificationMethod = {
      IndependentCheck: "independent_check",
      InstantVerificationAccountValidation:
        "instant_verification_account_validation",
      MicroTransfers: "micro_transfers",
      NetworkCheck: "network_check",
      TokenizedCheck: "tokenized_check",
      All() {
        let all = [];

        for (let key in this) {
          if (!this.hasOwnProperty(key)) {
            continue;
          }
          let value = this[key];

          if (key !== "All") {
            all.push(value);
          }
        }

        return all;
      },
    };

    this.VerificationAddOns = {
      CustomerVerification: "customer_verification",
      All() {
        let all = [];

        for (let key in this) {
          if (!this.hasOwnProperty(key)) {
            continue;
          }
          let value = this[key];

          if (key !== "All") {
            all.push(value);
          }
        }

        return all;
      },
    };
  }
}
UsBankAccountVerification.initClass();

module.exports = { UsBankAccountVerification: UsBankAccountVerification };
