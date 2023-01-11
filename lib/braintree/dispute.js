"use strict";

let AttributeSetter = require("./attribute_setter").AttributeSetter;
let TransactionDetails = require("./transaction_details").TransactionDetails;

class Dispute extends AttributeSetter {
  static initClass() {
    this.Status = {
      Open: "open",
      Lost: "lost",
      Won: "won",
      Accepted: "accepted",
      AutoAccepted: "auto_accepted",
      Disputed: "disputed",
      Expired: "expired",
    };
    this.Reason = {
      CancelledRecurringTransaction: "cancelled_recurring_transaction",
      CreditNotProcessed: "credit_not_processed",
      Duplicate: "duplicate",
      Fraud: "fraud",
      General: "general",
      InvalidAccount: "invalid_account",
      NotRecognized: "not_recognized",
      ProductNotReceived: "product_not_received",
      ProductUnsatisfactory: "product_unsatisfactory",
      Retrieval: "retrieval",
      TransactionAmountDiffers: "transaction_amount_differs",
    };
    this.Kind = {
      Chargeback: "chargeback",
      PreArbitration: "pre_arbitration",
      Retrieval: "retrieval",
    };
    // NEXT_MAJOR_VERSION Remove this attribute
    // DEPRECATED The chargebackProtectionLevel attribute is deprecated in favor of protectionLevel
    this.ChargebackProtectionLevel = {
      Effortless: "effortless",
      Standard: "standard",
      NotProtected: "not_protected",
    };
    this.ProtectionLevel = {
      EffortlessCBP: "Effortless Chargeback Protection tool",
      StandardCBP: "Chargeback Protection tool",
      NoProtection: "No Protection",
    };
    this.PreDisputeProgram = {
      None: "none",
      VisaRdr: "visa_rdr",
    };
  }

  constructor(attributes) {
    super(attributes);
    this.transactionDetails = new TransactionDetails(attributes.transaction);

    let protectionLevel = {
      effortless: Dispute.ProtectionLevel.EffortlessCBP,
      standard: Dispute.ProtectionLevel.StandardCBP,
      not_protected: Dispute.ProtectionLevel.NoProtection, // eslint-disable-line camelcase
    };

    this.protectionLevel =
      protectionLevel[this.chargebackProtectionLevel] ||
      Dispute.ProtectionLevel.NoProtection;
  }
}
Dispute.initClass();

module.exports = { Dispute: Dispute };
