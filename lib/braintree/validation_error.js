"use strict";

class ValidationError {
  constructor(error) {
    this.attribute = error.attribute;
    this.code = error.code;
    this.message = error.message;
  }
}

module.exports = { ValidationError: ValidationError };
