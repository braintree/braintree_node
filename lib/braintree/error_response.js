'use strict';

let Transaction = require('./transaction').Transaction;
let ValidationErrorsCollection = require('./validation_errors_collection').ValidationErrorsCollection;

class ErrorResponse {
  constructor(attributes, gateway) {
    for (let key in attributes) {
      if (!attributes.hasOwnProperty(key)) {
        continue;
      }
      let value = attributes[key];

      this[key] = value;
    }
    this.success = false;
    this.errors = new ValidationErrorsCollection(attributes.errors);
    if (attributes.transaction) { this.transaction = new Transaction(attributes.transaction, gateway); }
  }
}

module.exports = {ErrorResponse: ErrorResponse};
