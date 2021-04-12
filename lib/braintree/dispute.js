'use strict';

let AttributeSetter = require('./attribute_setter').AttributeSetter;
let TransactionDetails = require('./transaction_details').TransactionDetails;

class Dispute extends AttributeSetter {
  static initClass() {
    this.Status = {
      Open: 'open',
      Lost: 'lost',
      Won: 'won',
      Accepted: 'accepted',
      Disputed: 'disputed',
      Expired: 'expired'
    };
    this.Reason = {
      CancelledRecurringTransaction: 'cancelled_recurring_transaction',
      CreditNotProcessed: 'credit_not_processed',
      Duplicate: 'duplicate',
      Fraud: 'fraud',
      General: 'general',
      InvalidAccount: 'invalid_account',
      NotRecognized: 'not_recognized',
      ProductNotReceived: 'product_not_received',
      ProductUnsatisfactory: 'product_unsatisfactory',
      Retrieval: 'retrieval',
      TransactionAmountDiffers: 'transaction_amount_differs'
    };
    this.Kind = {
      Chargeback: 'chargeback',
      PreArbitration: 'pre_arbitration',
      Retrieval: 'retrieval'
    };
  }

  constructor(attributes) {
    super(attributes);
    this.transactionDetails = new TransactionDetails(attributes.transaction);
  }
}
Dispute.initClass();

module.exports = {Dispute: Dispute};
