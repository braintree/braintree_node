'use strict';

class AttributeSetter {
  constructor(attributes) {
    for (let key in attributes) {
      if (!attributes.hasOwnProperty(key)) {
        continue;
      }
      let value = attributes[key];

      this[key] = value;
    }
  }
}

module.exports = {AttributeSetter: AttributeSetter};
