"use strict";

let AdvancedSearch = require("./advanced_search").AdvancedSearch;
let Subscription = require("./subscription").Subscription;

class SubscriptionSearch extends AdvancedSearch {
  static initClass() {
    this.multipleValueField("inTrialPeriod");
    this.multipleValueField("ids");
    this.textFields("id", "transactionId");
    this.multipleValueOrTextField("planId");
    this.multipleValueField("status", { allows: Subscription.Status.All() }); // eslint-disable-line new-cap
    this.multipleValueField("merchantAccountId");
    this.rangeFields(
      "price",
      "daysPastDue",
      "billingCyclesRemaining",
      "nextBillingDate",
      "createdAt"
    );
  }
}
SubscriptionSearch.initClass();

module.exports = { SubscriptionSearch: SubscriptionSearch };
