'use strict';

const sinon = require('sinon');
let DisputeGateway = require('../../../lib/braintree/dispute_gateway').DisputeGateway;

describe('DisputeGateway', function () {
  var disputeGateway;

  beforeEach(() => {
    disputeGateway = new DisputeGateway({
      gateway: {
        config: {}
      }
    });
  });

  describe('accept', () => {
    it('null throws NotFoundError', () => {
      return disputeGateway.accept(null)
        .then(assert.fail)
        .catch((e) => {
          assert.equal('dispute with id \'null\' not found', e.message);
        });
    });

    it('empty string throws NotFoundError', () => {
      return disputeGateway.accept(' ')
        .then(assert.fail)
        .catch((e) => {
          assert.equal('dispute with id \' \' not found', e.message);
        });
    });
  });

  describe('addTextEvidence', () => {
    beforeEach(() => {
      sinon.spy(console, 'warn');
    });

    afterEach(() => {
      console.warn.restore(); // eslint-disable-line no-console
    });

    it('null Dispute ID throws NotFoundError', () => {
      return disputeGateway.addTextEvidence(null, 'text evidence')
        .then(assert.fail)
        .catch((e) => {
          assert.equal('notFoundError', e.type);
          assert.equal('dispute with id \'null\' not found', e.message);
        });
    });

    it('empty Dispute ID string throws NotFoundError', () => {
      return disputeGateway.addTextEvidence(' ', 'text evidence')
        .then(assert.fail)
        .catch((e) => {
          assert.equal('notFoundError', e.type);
          assert.equal('dispute with id \' \' not found', e.message);
        });
    });

    it('null text evidence throws NotFoundError', () => {
      return disputeGateway.addTextEvidence('dispute_id', null)
        .then(assert.fail)
        .catch((e) => {
          assert.equal('invalidKeysError', e.type);
          assert.equal('content cannot be null or empty', e.message);
        });
    });

    it('empty text evidence string throws NotFoundError', () => {
      return disputeGateway.addTextEvidence('dispute_id', ' ')
        .then(assert.fail)
        .catch((e) => {
          assert.equal('invalidKeysError', e.type);
          assert.equal('content cannot be null or empty', e.message);
        });
    });

    it('null content in evidence request throws invalidKeysError', () => {
      return disputeGateway.addTextEvidence('dispute_id', {content: null})
        .then(assert.fail)
        .catch((e) => {
          assert.equal('invalidKeysError', e.type);
          assert.equal('content cannot be null or empty', e.message);
        });
    });

    it('empty content in evidence request throws invalidKeysError', () => {
      return disputeGateway.addTextEvidence('dispute_id', {content: ' '})
        .then(assert.fail)
        .catch((e) => {
          assert.equal('invalidKeysError', e.type);
          assert.equal('content cannot be null or empty', e.message);
        });
    });

    it('non-numeric sequence_number in evidence request throws invalidKeysError', () => {
      return disputeGateway.addTextEvidence('dispute_id', {content: 'bob', sequenceNumber: 'hello'})
        .then(assert.fail)
        .catch((e) => {
          assert.equal('invalidKeysError', e.type);
          assert.equal('sequenceNumber must be a number', e.message);
        });
    });

    it('non-string tag in evidence request throws invalidKeysError', () => {
      return disputeGateway.addTextEvidence('dispute_id', {content: 'UPS', sequenceNumber: '0', tag: 4})
        .then(assert.fail)
        .catch((e) => {
          assert.equal('invalidKeysError', e.type);
          assert.equal('tag must be a string', e.message);
        });
    });

    it('empty tag in evidence request throws invalidKeysError', () => {
      return disputeGateway.addTextEvidence('dispute_id', {content: 'UPS', sequenceNumber: 2, tag: ''})
        .then(assert.fail)
        .catch((e) => {
          assert.equal('invalidKeysError', e.type);
          assert.equal('tag cannot be empty', e.message);
        });
    });
  });

  describe('addFileEvidence', () => {
    it('null Dispute ID throws NotFoundError', () => {
      return disputeGateway.addFileEvidence(null, 'document_id')
        .then(assert.fail)
        .catch((e) => {
          assert.equal('notFoundError', e.type);
          assert.equal('dispute with id \'null\' not found', e.message);
        });
    });

    it('empty Dispute ID string throws NotFoundError', () => {
      return disputeGateway.addFileEvidence(' ', 'document_id')
        .then(assert.fail)
        .catch((e) => {
          assert.equal('notFoundError', e.type);
          assert.equal('dispute with id \' \' not found', e.message);
        });
    });

    it('null Document ID throws NotFoundError', () => {
      return disputeGateway.addFileEvidence('dispute_id', null)
        .then(assert.fail)
        .catch((e) => {
          assert.equal('notFoundError', e.type);
          assert.equal('document with id \'null\' not found', e.message);
        });
    });

    it('empty DocumentID string throws NotFoundError', () => {
      return disputeGateway.addFileEvidence('dispute_id', ' ')
        .then(assert.fail)
        .catch((e) => {
          assert.equal('notFoundError', e.type);
          assert.equal('document with id \' \' not found', e.message);
        });
    });
  });

  describe('finalize', () => {
    it('null throws NotFoundError', () => {
      return disputeGateway.finalize(null)
        .then(assert.fail)
        .catch((e) => {
          assert.equal('notFoundError', e.type);
          assert.equal('dispute with id \'null\' not found', e.message);
        });
    });

    it('empty string throws NotFoundError', () => {
      return disputeGateway.finalize(' ')
        .then(assert.fail)
        .catch((e) => {
          assert.equal('notFoundError', e.type);
          assert.equal('dispute with id \' \' not found', e.message);
        });
    });
  });

  describe('find', () => {
    it('null throws NotFoundError', () => {
      return disputeGateway.find(null)
        .then(assert.fail)
        .catch((e) => {
          assert.equal('notFoundError', e.type);
          assert.equal('dispute with id \'null\' not found', e.message);
        });
    });

    it('empty string throws NotFoundError', () => {
      return disputeGateway.find(' ')
        .then(assert.fail)
        .catch((e) => {
          assert.equal('notFoundError', e.type);
          assert.equal('dispute with id \' \' not found', e.message);
        });
    });
  });

  describe('removeEvidence', () => {
    it('null Dispute ID throws NotFoundError', () => {
      return disputeGateway.removeEvidence(null, 'evidence_id')
        .then(assert.fail)
        .catch((e) => {
          assert.equal('notFoundError', e.type);
          assert.equal('evidence with id \'evidence_id\' for dispute with id \'null\' not found', e.message);
        });
    });

    it('empty Dispute ID string throws NotFoundError', () => {
      return disputeGateway.removeEvidence(' ', 'evidence_id')
        .then(assert.fail)
        .catch((e) => {
          assert.equal('notFoundError', e.type);
          assert.equal('evidence with id \'evidence_id\' for dispute with id \' \' not found', e.message);
        });
    });

    it('null Evidence ID throws NotFoundError', () => {
      return disputeGateway.removeEvidence('dispute_id', null)
        .then(assert.fail)
        .catch((e) => {
          assert.equal('notFoundError', e.type);
          assert.equal('evidence with id \'null\' for dispute with id \'dispute_id\' not found', e.message);
        });
    });

    it('empty Evidence ID string throws NotFoundError', () => {
      return disputeGateway.removeEvidence('dispute_id', ' ')
        .then(assert.fail)
        .catch((e) => {
          assert.equal('notFoundError', e.type);
          assert.equal('evidence with id \' \' for dispute with id \'dispute_id\' not found', e.message);
        });
    });
  });
});
