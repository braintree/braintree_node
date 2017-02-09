'use strict';

let AttributeSetter = require('./attribute_setter').AttributeSetter;

class DisbursementDetails extends AttributeSetter {
  isValid() {
    return this.disbursementDate != null;
  }
}

module.exports = {DisbursementDetails: DisbursementDetails};
