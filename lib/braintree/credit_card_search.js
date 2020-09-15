'use strict';

const {AdvancedSearch} = require('./advanced_search');

class CreditCardSearch extends AdvancedSearch {
  static initClass() {
    this.multipleValueField('ids');
  }
}
CreditCardSearch.initClass();

module.exports = {CreditCardSearch};
