'use strict';

let AdvancedSearch = require('./advanced_search').AdvancedSearch;
let UsBankAccountVerification = require('./us_bank_account_verification').UsBankAccountVerification;

class UsBankAccountVerificationSearch extends AdvancedSearch {
  static initClass() {
    this.textFields(
      'accountHolderName',
      'customerEmail',
      'customerId',
      'id',
      'paymentMethodToken',
      'routingNumber'
    );

    this.multipleValueField('ids');
    this.multipleValueField('status', {allows: UsBankAccountVerification.StatusType.All()}); // eslint-disable-line new-cap
    this.multipleValueField('verificationMethod', {allows: UsBankAccountVerification.VerificationMethod.All()}); // eslint-disable-line new-cap

    this.rangeFields('createdAt');

    this.equalityFields('accountType');

    this.endsWithFields('accountNumber');
  }
}
UsBankAccountVerificationSearch.initClass();

module.exports = {UsBankAccountVerificationSearch: UsBankAccountVerificationSearch};
