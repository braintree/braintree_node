'use strict';

class AttributeSetter {
  constructor(attributes, gateway) {
    for (let key in attributes) {
      if (!attributes.hasOwnProperty(key)) {
        continue;
      }
      let value = attributes[key];

      this[key] = value;
    }

    this.getGateway = () => gateway;
  }
}

module.exports = {AttributeSetter: AttributeSetter};
