'use strict';

let AdvancedSearch = require('./advanced_search').AdvancedSearch;

class CustomerSearch extends AdvancedSearch {
  static initClass() {
    this.textFields(
      'addressCountryName',
      'addressExtendedAddress',
      'addressFirstName',
      'addressLastName',
      'addressLocality',
      'addressPostalCode',
      'addressRegion',
      'addressStreetAddress',
      'cardholderName',
      'company',
      'email',
      'fax',
      'firstName',
      'id',
      'lastName',
      'paymentMethodToken',
      'paypalAccountEmail',
      'phone',
      'website',
      'paymentMethodTokenWithDuplicates'
    );

    this.equalityFields('creditCardExpirationDate');
    this.partialMatchFields('creditCardNumber');
    this.multipleValueField('ids');
    this.rangeFields('createdAt');
  }
}
CustomerSearch.initClass();

module.exports = {CustomerSearch: CustomerSearch};
