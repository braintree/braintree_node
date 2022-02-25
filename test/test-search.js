"use strict";

let AdvancedSearch = require("../lib/braintree/advanced_search").AdvancedSearch;

class TestSearch extends AdvancedSearch {
  constructor() {
    super();

    this.equalityFields = AdvancedSearch.equalityFields("equality");
    this.partialMatchFields = AdvancedSearch.partialMatchFields("partialMatch");
    this.textFields = AdvancedSearch.textFields("text");
    this.keyValueFields = AdvancedSearch.keyValueFields("key");
    this.multipleValueField = AdvancedSearch.multipleValueField("multiple");
    this.multipleValueField = AdvancedSearch.multipleValueField(
      "multipleWithAllows",
      { allows: ["Hello", "World"] }
    );
    this.multipleValueOrTextField = AdvancedSearch.multipleValueOrTextField(
      "multipleValueOrText"
    );
    this.rangeFields = AdvancedSearch.rangeFields("range");
  }
}

module.exports = TestSearch;
