"use strict";

let AdvancedSearch = require("./advanced_search").AdvancedSearch;

class DisputeSearch extends AdvancedSearch {
  static initClass() {
    this.textFields(
      "caseNumber",
      "customerId",
      "id",
      "referenceNumber",
      "transactionId"
    );
    // NEXT_MAJOR_VERSION Remove this attribute
    // DEPRECATED The chargebackProtectionLevel attribute is deprecated in favor of protectionLevel
    this.multipleValueField("chargebackProtectionLevel");
    this.multipleValueField("protectionLevel");
    this.multipleValueField("kind");
    this.multipleValueField("merchantAccountId");
    this.multipleValueField("preDisputeProgram");
    this.multipleValueField("reason");
    this.multipleValueField("reasonCode");
    this.multipleValueField("status");
    this.multipleValueField("transactionSource");
    this.rangeFields(
      "amountDisputed",
      "amountWon",
      "disbursementDate",
      "effectiveDate",
      "receivedDate",
      "replyByDate"
    );
  }
}
DisputeSearch.initClass();

module.exports = { DisputeSearch: DisputeSearch };
