'use strict';

let AttributeSetter = require('./attribute_setter').AttributeSetter;
let MerchantAccount = require('./merchant_account').MerchantAccount;

class Merchant extends AttributeSetter {
  constructor(attributes) {
    super(attributes);

    if (attributes.merchantAccounts) {
      this.merchantAccounts = attributes.merchantAccounts.map((merchantAccountAttributes) => new MerchantAccount(merchantAccountAttributes));
    }
  }
}

module.exports = {Merchant: Merchant};
