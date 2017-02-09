'use strict';

let AttributeSetter = require('./attribute_setter').AttributeSetter;
let RiskData = require('./risk_data').RiskData;

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
  }
}
CreditCardVerification.initClass();

module.exports = {CreditCardVerification: CreditCardVerification};
