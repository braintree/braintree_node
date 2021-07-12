'use strict';

let AttributeSetter = require('./attribute_setter').AttributeSetter;

class AndroidPayCard extends AttributeSetter {
  constructor(attributes) {
    super(attributes);

    if (attributes) {
      this.commercial = attributes.commercial;
      this.debit = attributes.debit;
      this.durbinRegulated = attributes.durbinRegulated;
      this.healthcare = attributes.healthcare;
      this.payroll = attributes.payroll;
      this.prepaid = attributes.prepaid;
      this.productId = attributes.productId;
      this.countryOfIssuance = attributes.countryOfIssuance;
      this.issuingBank = attributes.issuingBank;
      this.cardType = attributes.virtualCardType;
      this.last4 = attributes.virtualCardLast4;
      this.bin = attributes.bin;
    }
  }
}

module.exports = {AndroidPayCard: AndroidPayCard};
