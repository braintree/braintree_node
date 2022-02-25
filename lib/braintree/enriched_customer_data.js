"use strict";

let VenmoProfileData = require("./venmo_profile_data").VenmoProfileData;

let AttributeSetter = require("./attribute_setter").AttributeSetter;

class EnrichedCustomerData extends AttributeSetter {
  constructor(attributes) {
    super(attributes);

    this.profileData = new VenmoProfileData(attributes.profileData);
  }
}

module.exports = { EnrichedCustomerData: EnrichedCustomerData };
