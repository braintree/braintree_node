'use strict';

let AttributeSetter = require('./attribute_setter').AttributeSetter;
let RiskData = require('./risk_data').RiskData;
let ThreeDSecureInfo = require('./three_d_secure_info').ThreeDSecureInfo;

class CreditCardVerification extends AttributeSetter {
  static initClass() {
    this.StatusType = {
      Failed: 'failed',
      GatewayRejected: 'gateway_rejected',
      ProcessorDeclined: 'processor_declined',
      Verified: 'verified',
      All() {
        let all = [];

        for (let key in this) {
          if (!this.hasOwnProperty(key)) {
            continue;
          }
          let value = this[key];

          if (key !== 'All') { all.push(value); }
        }

        return all;
      }
    };
  }

  constructor(attributes) {
    super(attributes);
    if (attributes.riskData) { this.riskData = new RiskData(attributes.riskData); }
    if (attributes.threeDSecureInfo) { this.threeDSecureInfo = new ThreeDSecureInfo(attributes.threeDSecureInfo); }
  }
}
CreditCardVerification.initClass();

module.exports = {CreditCardVerification: CreditCardVerification};
