'use strict';

let Util = require('./util').Util;
let ValidationError = require('./validation_error').ValidationError;

class ValidationErrorsCollection {
  constructor(errorAttributes) {
    this.validationErrors = {};
    this.errorCollections = {};

    for (let key in errorAttributes) {
      if (!errorAttributes.hasOwnProperty(key)) {
        continue;
      }
      let val = errorAttributes[key];

      if (key === 'errors') {
        this.buildErrors(val);
      } else {
        this.errorCollections[key] = new ValidationErrorsCollection(val);
      }
    }
  }

  buildErrors(errors) {
    return errors.map((item) => {
      let key = Util.toCamelCase(item.attribute);

      this.validationErrors[key] = this.validationErrors[key] || [];

      return this.validationErrors[key].push(new ValidationError(item));
    });
  }

  deepErrors() {
    let errors = [];

    for (let key in this.validationErrors) {
      if (!this.validationErrors.hasOwnProperty(key)) {
        continue;
      }
      let val = this.validationErrors[key];

      errors = errors.concat(val);
    }

    for (let key in this.errorCollections) {
      if (!this.errorCollections.hasOwnProperty(key)) {
        continue;
      }
      let val = this.errorCollections[key];

      errors = errors.concat(val.deepErrors());
    }

    return errors;
  }

  for(name) {
    return this.errorCollections[name];
  }

  forIndex(index) {
    return this.errorCollections[`index${index}`];
  }

  on(name) {
    return this.validationErrors[name];
  }
}

module.exports = {ValidationErrorsCollection: ValidationErrorsCollection};
