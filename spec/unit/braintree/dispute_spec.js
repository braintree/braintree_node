'use strict';

let Dispute = require('../../../lib/braintree/dispute').Dispute;

describe('Dispute', function () {
  let attributes = {
    amount: '100.00',
    amountDisputed: '100.00',
    amountWon: '0.00',
    caseNumber: 'CB123456',
    createdAt: '2013-04-10',
    currencyIsoCode: 'USD',
    dateOpened: '2013-04-01',
    dateWon: '2013-04-02',
    processorComments: 'Forwarded comments',
    id: '123456',
    kind: 'chargeback',
    merchantAccountId: 'abc123',
    originalDisputeId: 'original_dispute_id',
    reason: 'fraud',
    reasonCode: '83',
    reasonDescription: 'Reason code 83 description',
    receivedDate: '2013-04-10',
    referenceNumber: '123456',
    replyByDate: '2013-04-17',
    status: 'open',
    updatedAt: '2013-04-10',
    evidence: [{
      comment: null,
      createdAt: '2013-04-11',
      id: 'evidence1',
      sentToProcessorAt: null,
      category: 'GENERAL',
      url: 'url_of_file_evidence'
    }, {
      comment: 'text evidence',
      createdAt: '2013-04-11',
      id: 'evidence2',
      sentToProcessorAt: '2009-04-11',
      url: null
    }],
    statusHistory: [{
      effectiveDate: '2013-04-10',
      status: 'open',
      timestamp: '2013-04-10'
    }],
    transaction: {
      id: 'transaction_id',
      amount: '100.00',
      createdAt: '2013-03-19',
      orderId: null,
      purchaseOrderNumber: 'po',
      paymentInstrumentSubtype: 'Visa'
    }
  };

  describe('constructor', () => {
    it('allows legacy attributes', () => {
      let dispute = new Dispute({
        transaction: {
          id: 'transaction_id',
          amount: '100.00'
        },
        id: '123456',
        currencyIsoCode: 'USD',
        status: 'open',
        amount: '100.00',
        receivedDate: '2013-04-10',
        replyByDate: '2013-04-10',
        reason: 'fraud',
        transactionIds: ['asdf', 'qwer'],
        dateOpened: '2013-04-01',
        dateWon: '2013-04-02',
        kind: 'chargeback'
      });

      assert.equal('123456', dispute.id);
      assert.equal('100.00', dispute.amount);
      assert.equal('USD', dispute.currencyIsoCode);
      assert.equal(Dispute.Reason.Fraud, dispute.reason);
      assert.equal(Dispute.Status.Open, dispute.status);
      assert.equal('transaction_id', dispute.transactionDetails.id);
      assert.equal('100.00', dispute.transactionDetails.amount);
      assert.equal('2013-04-01', dispute.dateOpened);
      assert.equal('2013-04-02', dispute.dateWon);
      assert.equal(Dispute.Kind.Chargeback, dispute.kind);
    });

    it('allows mix of new and old attributes', () => {
      let dispute = new Dispute(attributes);

      assert.equal('123456', dispute.id);
      assert.equal('100.00', dispute.amount);
      assert.equal('USD', dispute.currencyIsoCode);
      assert.equal(Dispute.Reason.Fraud, dispute.reason);
      assert.equal(Dispute.Status.Open, dispute.status);
      assert.equal('transaction_id', dispute.transactionDetails.id);
      assert.equal('100.00', dispute.transactionDetails.amount);
      assert.equal('2013-04-01', dispute.dateOpened);
      assert.equal('2013-04-02', dispute.dateWon);
      assert.equal(Dispute.Kind.Chargeback, dispute.kind);
    });

    it('populates new fields', () => {
      let dispute = new Dispute(attributes);

      assert.equal(100.0, dispute.amountDisputed);
      assert.equal(0.00, dispute.amountWon);
      assert.equal('CB123456', dispute.caseNumber);
      assert.equal('2013-04-10', dispute.createdAt);
      assert.equal('Forwarded comments', dispute.processorComments);
      assert.equal('abc123', dispute.merchantAccountId);
      assert.equal('original_dispute_id', dispute.originalDisputeId);
      assert.equal('83', dispute.reasonCode);
      assert.equal('Reason code 83 description', dispute.reasonDescription);
      assert.equal('123456', dispute.referenceNumber);
      assert.equal('2013-04-10', dispute.updatedAt);
      assert.equal(null, dispute.evidence[0].comment);
      assert.equal('2013-04-11', dispute.evidence[0].createdAt);
      assert.equal('evidence1', dispute.evidence[0].id);
      assert.equal(null, dispute.evidence[0].sentToProcessorAt);
      assert.equal('GENERAL', dispute.evidence[0].category);
      assert.equal('url_of_file_evidence', dispute.evidence[0].url);
      assert.equal('text evidence', dispute.evidence[1].comment);
      assert.equal('2013-04-11', dispute.evidence[1].createdAt);
      assert.equal('evidence2', dispute.evidence[1].id);
      assert.equal('2009-04-11', dispute.evidence[1].sentToProcessorAt);
      assert.equal(null, dispute.evidence[1].url);
      assert.equal('2013-04-10', dispute.statusHistory[0].effectiveDate);
      assert.equal('open', dispute.statusHistory[0].status);
      assert.equal('2013-04-10', dispute.statusHistory[0].timestamp);
    });

    it('handles null fields', () => {
      let dispute = new Dispute({
        amount: null,
        dateOpened: null,
        dateWon: null,
        evidence: null,
        replyByDate: null,
        statusHistory: null
      });

      assert.equal(null, dispute.amount);
      assert.equal(null, dispute.dateOpened);
      assert.equal(null, dispute.dateWon);
      assert.equal(null, dispute.evidence);
      assert.equal(null, dispute.replyByDate);
      assert.equal(null, dispute.statusHistory);
    });

    it('populates transaction', () => {
      let dispute = new Dispute(attributes);

      assert.equal('transaction_id', dispute.transaction.id);
      assert.equal('100.00', dispute.transaction.amount);
      assert.equal('2013-03-19', dispute.transaction.createdAt);
      assert.equal(null, dispute.transaction.orderId);
      assert.equal('po', dispute.transaction.purchaseOrderNumber);
      assert.equal('Visa', dispute.transaction.paymentInstrumentSubtype);
    });
  });
});
