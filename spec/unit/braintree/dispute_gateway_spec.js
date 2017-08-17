'use strict';

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
      try {
        disputeGateway.accept(null);
        assert.fail("DisputeGateway.accept allowed null");
      } catch (e) {
        assert.equal("dispute with id 'null' not found", e.message);
      }
    });

    it('empty string throws NotFoundError', () => {
      try {
        disputeGateway.accept(" ");
        assert.fail("DisputeGateway.accept allowed empty string");
      } catch (e) {
        assert.equal("dispute with id ' ' not found", e.message);
      }
    });
  });

  describe('addTextEvidence', () => {
    it('null Dispute ID throws NotFoundError', () => {
      try {
        disputeGateway.addTextEvidence(null, "text evidence");
        assert.fail("DisputeGateway.addTextEvidence allowed null disputeId");
      } catch (e) {
        assert.equal("dispute with id 'null' not found", e.message);
      }
    });

    it('empty Dispute ID string throws NotFoundError', () => {
      try {
        disputeGateway.addTextEvidence(" ", "text evidence");
        assert.fail("DisputeGateway.addTextEvidence allowed empty disputeId string");
      } catch (e) {
        assert.equal("dispute with id ' ' not found", e.message);
      }
    });

    it('null text evidence throws NotFoundError', () => {
      try {
        disputeGateway.addTextEvidence("dispute_id", null);
        assert.fail("DisputeGateway.addTextEvidence allowed null content");
      } catch (e) {
        assert.equal("content cannot be null", e.message);
      }
    });

    it('empty text evidence string throws NotFoundError', () => {
      try {
        disputeGateway.addTextEvidence("dispute_id", " ");
        assert.fail("DisputeGateway.addTextEvidence allowed empty content string");
      } catch (e) {
        assert.equal("content cannot be null", e.message);
      }
    });
  });

  describe('addFileEvidence', () => {
    it('null Dispute ID throws NotFoundError', () => {
      try {
        disputeGateway.addFileEvidence(null, "document_id");
        assert.fail("DisputeGateway.addFileEvidence allowed null disputeId");
      } catch (e) {
        assert.equal("dispute with id 'null' not found", e.message);
      }
    });

    it('empty Dispute ID string throws NotFoundError', () => {
      try {
        disputeGateway.addFileEvidence(" ", "document_id");
        assert.fail("DisputeGateway.addFileEvidence allowed empty disputeId string");
      } catch (e) {
        assert.equal("dispute with id ' ' not found", e.message);
      }
    });

    it('null Document ID throws NotFoundError', () => {
      try {
        disputeGateway.addFileEvidence("dispute_id", null);
        assert.fail("DisputeGateway.addFileEvidence allowed null documentId");
      } catch (e) {
        assert.equal("document with id 'null' not found", e.message);
      }
    });

    it('empty DocumentID string throws NotFoundError', () => {
      try {
        disputeGateway.addFileEvidence("dispute_id", " ");
        assert.fail("DisputeGateway.addFileEvidence allowed empty documentId string");
      } catch (e) {
        assert.equal("document with id ' ' not found", e.message);
      }
    });
  });

  describe('finalize', () => {
    it('null throws NotFoundError', () => {
      try {
        disputeGateway.finalize(null);
        assert.fail("DisputeGateway.finalize allowed null");
      } catch (e) {
        assert.equal("dispute with id 'null' not found", e.message);
      }
    });

    it('empty string throws NotFoundError', () => {
      try {
        disputeGateway.finalize(" ");
        assert.fail("DisputeGateway.finalize allowed empty string");
      } catch (e) {
        assert.equal("dispute with id ' ' not found", e.message);
      }
    });
  });

  describe('find', () => {
    it('null throws NotFoundError', () => {
      try {
        disputeGateway.find(null);
        assert.fail("DisputeGateway.find allowed null");
      } catch (e) {
        assert.equal("dispute with id 'null' not found", e.message);
      }
    });

    it('empty string throws NotFoundError', () => {
      try {
        disputeGateway.find(" ");
        assert.fail("DisputeGateway.find allowed empty string");
      } catch (e) {
        assert.equal("dispute with id ' ' not found", e.message);
      }
    });
  });

  describe('removeEvidence', () => {
    it('null Dispute ID throws NotFoundError', () => {
      try {
        disputeGateway.removeEvidence(null, "evidence_id");
        assert.fail("DisputeGateway.removeEvidence allowed null disputeId");
      } catch (e) {
        assert.equal("evidence with id 'evidence_id' for dispute with id 'null' not found", e.message);
      }
    });

    it('empty Dispute ID string throws NotFoundError', () => {
      try {
        disputeGateway.removeEvidence(" ", "evidence_id");
        assert.fail("DisputeGateway.removeEvidence allowed empty disputeId string");
      } catch (e) {
        assert.equal("evidence with id 'evidence_id' for dispute with id ' ' not found", e.message);
      }
    });

    it('null Evidence ID throws NotFoundError', () => {
      try {
        disputeGateway.removeEvidence("dispute_id", null);
        assert.fail("DisputeGateway.removeEvidence allowed null evidenceId");
      } catch (e) {
        assert.equal("evidence with id 'null' for dispute with id 'dispute_id' not found", e.message);
      }
    });

    it('empty Evidence ID string throws NotFoundError', () => {
      try {
        disputeGateway.removeEvidence("dispute_id", " ");
        assert.fail("DisputeGateway.removeEvidence allowed empty evidenceId string");
      } catch (e) {
        assert.equal("evidence with id ' ' for dispute with id 'dispute_id' not found", e.message);
      }
    });
  });
});
