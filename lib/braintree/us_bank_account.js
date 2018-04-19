'use strict';

let AttributeSetter = require('./attribute_setter').AttributeSetter;
let AchMandate = require('./ach_mandate').AchMandate;

class UsBankAccount extends AttributeSetter {
  constructor(attributes) {
    super(attributes);
    this.achMandate = new AchMandate(this.achMandate);
  }
}

module.exports = {UsBankAccount: UsBankAccount};
