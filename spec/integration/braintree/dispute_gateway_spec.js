'use strict';

let fs = require('fs');
let CreditCardNumbers = require('../../../lib/braintree/test/credit_card_numbers').CreditCardNumbers;
let Dispute = require('../../../lib/braintree/dispute').Dispute;
let DocumentUpload = require('../../../lib/braintree/document_upload').DocumentUpload;
let ValidationErrorCodes = require('../../../lib/braintree/validation_error_codes').ValidationErrorCodes;

describe('DisputeGateway', () => {
  let disputeGateway,
    transactionGateway;

  beforeEach(() => {
    disputeGateway = specHelper.defaultGateway.dispute;
    transactionGateway = specHelper.defaultGateway.transaction;
  });

  function createEvidenceDocument() {
    let documentUploadParams = {
      file: fs.createReadStream('./spec/fixtures/bt_logo.png'),
      kind: DocumentUpload.Kind.EvidenceDocument
    };

    return specHelper.defaultGateway.documentUpload.create(documentUploadParams)
      .then((result) => {
        return result.documentUpload;
      });
  }

  function createSampleDispute() {
    let transactionParams = {
      amount: '100.00',
      creditCard: {
        number: CreditCardNumbers.Dispute.Chargeback,
        expirationDate: '12/2019'
      }
    };

    return transactionGateway.sale(transactionParams).then((result) => {
      return result.transaction.disputes[0];
    });
  }

  describe('self.accept', () => {
    it('changes dispute status to accept', () => {
      var disputeId;

      return createSampleDispute()
        .then((dispute) => {
          disputeId = dispute.id;

          return disputeGateway.accept(disputeId);
        })
        .then(() => {
          return disputeGateway.find(disputeId);
        })
        .then((result) => {
          assert.equal(Dispute.Status.Accepted, result.dispute.status);

          return transactionGateway.find(result.dispute.transaction.id);
        })
        .then((result) => {
          assert.equal(Dispute.Status.Accepted, result.disputes[0].status);
        });
    });

    it('returns error when dispute not open', () => {
      return disputeGateway.accept('wells_dispute')
        .then((response) => {
          let error = response.errors.for('dispute').on('status')[0];

          assert.isFalse(response.success);
          assert.equal(ValidationErrorCodes.Dispute.CanOnlyAcceptOpenDispute, error.code);
          assert.equal('Disputes can only be accepted when they are in an Open state', error.message);
        });
    });

    it('throws error when dispute not found', () => {
      return disputeGateway.accept('invalid-id')
        .then(assert.fail)
        .catch((err) => {
          assert.equal(err.type, 'notFoundError');
          assert.equal(err.message, 'dispute with id \'invalid-id\' not found');
        });
    });
  });

  describe('self.addFileEvidence', () => {
    it('adds file evidence', () => {
      let disputeId, evidenceId;

      return createSampleDispute()
        .then((dispute) => {
          disputeId = dispute.id;

          return createEvidenceDocument();
        })
        .then((document) => {
          return disputeGateway.addFileEvidence(disputeId, document.id);
        })
        .then((response) => {
          evidenceId = response.evidence.id;

          assert.isTrue(response.success);

          return disputeGateway.find(disputeId);
        })
        .then((response) => {
          assert.equal(evidenceId, response.dispute.evidence[0].id);
        });
    });

    it('adds file evidence with category', () => {
      let disputeId, evidenceId;

      return createSampleDispute()
        .then((dispute) => {
          disputeId = dispute.id;

          return createEvidenceDocument();
        })
        .then((document) => {
          return disputeGateway.addFileEvidence(
            disputeId,
            {
              documentId: document.id,
              category: 'GENERAL'
            }
          );
        })
        .then((response) => {
          evidenceId = response.evidence.id;

          assert.isTrue(response.success);

          assert.equal(evidenceId, response.evidence.id);
          assert.equal('GENERAL', response.evidence.category);
        });
    });

    it('raises error when dispute not found', () => {
      return disputeGateway.addFileEvidence('unknown_dispute_id', 'unknown_document_id')
        .catch((err) => {
          assert.equal('notFoundError', err.type);
          assert.equal('dispute with id \'unknown_dispute_id\' not found', err.message);
        });
    });

    it('raises error when dispute not open', () => {
      let disputeId;

      return createSampleDispute()
        .then((dispute) => {
          disputeId = dispute.id;

          return disputeGateway.accept(disputeId);
        }).then(() => {
          return createEvidenceDocument();
        })
        .then((document) => {
          return disputeGateway.addFileEvidence(disputeId, document.id);
        })
        .then((response) => {
          let error = response.errors.for('dispute').on('status')[0];

          assert.isFalse(response.success);
          assert.equal(ValidationErrorCodes.Dispute.CanOnlyAddEvidenceToOpenDispute, error.code);
          assert.equal('Evidence can only be attached to disputes that are in an Open state', error.message);
        });
    });

    it('raises error when category is not supported', () => {
      let disputeId;

      return createSampleDispute()
        .then((dispute) => {
          disputeId = dispute.id;

          return dispute;
        }).then(() => {
          return createEvidenceDocument();
        })
        .then((document) => {
          return disputeGateway.addFileEvidence(
            disputeId,
            {
              documentId: document.id,
              category: 'NOTAREALCATEGORY'
            });
        })
        .then((response) => {
          let error = response.errors.for('dispute').on('evidence')[0];

          assert.isFalse(response.success);
          assert.equal(ValidationErrorCodes.Dispute.CanOnlyCreateEvidenceWithValidCategory, error.code);
        });
    });

    it('returns error when creating file evidence for text-only category', () => {
      let disputeId;

      return createSampleDispute()
        .then((dispute) => {
          disputeId = dispute.id;

          return dispute;
        }).then(() => {
          return createEvidenceDocument();
        })
        .then((document) => {
          return disputeGateway.addFileEvidence(
            disputeId,
            {
              documentId: document.id,
              category: 'DEVICE_ID'
            });
        })
        .then((response) => {
          let error = response.errors.for('dispute').on('evidence')[0];

          assert.isFalse(response.success);
          assert.equal(ValidationErrorCodes.Dispute.EvidenceCategoryTextOnly, error.code);
        });
    });
  });

  describe('self.addTextEvidence', () => {
    it('adds text evidence to a dispute', () => {
      let disputeId;

      return createSampleDispute()
        .then((dispute) => {
          disputeId = dispute.id;

          return disputeGateway.addTextEvidence(disputeId, 'text evidence');
        })
        .then((response) => {
          let evidence = response.evidence;

          assert.isTrue(response.success);
          assert.equal('text evidence', evidence.comment);
          assert.isNotNull(evidence.createdAt);
          assert.isTrue(/^\w{16,}$/.test(evidence.id));
          assert.isNull(evidence.sentToProcessorAt);
          assert.isNull(evidence.url);
        });
    });

    it('accepts a category', () => {
      let disputeId;

      return createSampleDispute()
        .then((dispute) => {
          disputeId = dispute.id;

          return disputeGateway.addTextEvidence(disputeId, {category: 'DEVICE_ID', content: 'M'});
        })
        .then((response) => {
          let evidence = response.evidence;

          assert.isTrue(response.success);
          assert.equal('M', evidence.comment);
          assert.equal('DEVICE_ID', evidence.category);
        });
    });

    it('throws error when dispute not found', () => {
      return disputeGateway.addTextEvidence('unknown_dispute_id', 'text evidence')
        .then(assert.fail)
        .catch((err) => {
          assert.equal(err.type, 'notFoundError');
          assert.equal(err.message, 'dispute with id \'unknown_dispute_id\' not found');
        });
    });

    it('returns error when dispute not open', () => {
      let disputeId;

      return createSampleDispute()
        .then((dispute) => {
          disputeId = dispute.id;

          return disputeGateway.accept(disputeId);
        })
        .then(() => {
          return disputeGateway.addTextEvidence(disputeId, 'text evidence');
        })
        .then((response) => {
          let error = response.errors.for('dispute').on('status')[0];

          assert.isFalse(response.success);
          assert.equal(ValidationErrorCodes.Dispute.CanOnlyAddEvidenceToOpenDispute, error.code);
          assert.equal('Evidence can only be attached to disputes that are in an Open state', error.message);
        });
    });

    it('shows new evidence record in dispute', () => {
      let disputeId, evidenceId;

      return createSampleDispute()
        .then((dispute) => {
          disputeId = dispute.id;

          return disputeGateway.addTextEvidence(disputeId, 'text evidence');
        })
        .then((result) => {
          evidenceId = result.evidence.id;

          return disputeGateway.find(disputeId);
        })
        .then((result) => {
          let evidence = result.dispute.evidence[0];

          assert.isTrue(result.success);
          assert.equal(evidenceId, evidence.id);
          assert.equal('text evidence', evidence.comment);
        });
    });

    it('returns error when creating text evidence for file-only category', () => {
      let disputeId;

      return createSampleDispute()
        .then((dispute) => {
          disputeId = dispute.id;
        })
        .then(() => {
          return disputeGateway.addTextEvidence(
            disputeId,
            {
              content: 'foo',
              category: 'MERCHANT_WEBSITE_OR_APP_ACCESS'
            });
        })
        .then((response) => {
          let error = response.errors.for('dispute').on('evidence')[0];

          assert.isFalse(response.success);
          assert.equal(ValidationErrorCodes.Dispute.EvidenceCategoryDocumentOnly, error.code);
        });
    });

    it('returns error when creating text evidence with invalid date time format', () => {
      let disputeId;

      return createSampleDispute()
        .then((dispute) => {
          disputeId = dispute.id;
        })
        .then(() => {
          return disputeGateway.addTextEvidence(
            disputeId,
            {
              content: 'foo',
              category: 'DOWNLOAD_DATE_TIME'
            });
        })
        .then((response) => {
          let error = response.errors.for('dispute').on('evidence')[0];

          assert.isFalse(response.success);
          assert.equal(ValidationErrorCodes.Dispute.EvidenceContentDateInvalid, error.code);
        });
    });
  });

  describe('self.finalize', () => {
    it('change dispute status to disputed', () => {
      let disputeId;

      return createSampleDispute()
        .then((dispute) => {
          disputeId = dispute.id;

          return disputeGateway.finalize(disputeId);
        })
        .then((result) => {
          assert.isTrue(result.success);

          return disputeGateway.find(disputeId);
        })
        .then((result) => {
          assert.equal(Dispute.Status.Disputed, result.dispute.status);
        });
    });

    it('returns error when dispute not open', () => {
      return disputeGateway.finalize('wells_dispute')
        .then((response) => {
          let error = response.errors.for('dispute').on('status')[0];

          assert.isFalse(response.success);
          assert.equal(ValidationErrorCodes.Dispute.CanOnlyFinalizeOpenDispute, error.code);
          assert.equal('Disputes can only be finalized when they are in an Open state', error.message);
        });
    });

    it('throws error when dispute not found', () => {
      return disputeGateway.finalize('invalid-id')
        .then(() => {
          assert.fail('finalize should have failed');
        })
        .catch((err) => {
          assert.equal(err.type, 'notFoundError');
          assert.equal(err.message, 'dispute with id \'invalid-id\' not found');
        });
    });

    it('returns error with digital goods missing', () => {
      let disputeId;

      return createSampleDispute()
        .then((dispute) => {
          disputeId = dispute.id;
        })
        .then(() => {
          return disputeGateway.addTextEvidence(
            disputeId,
            {
              content: 'foo',
              category: 'DEVICE_ID'
            });
        })
        .then(() => {
          return disputeGateway.finalize(disputeId);
        })
        .then((response) => {
          let errorCodes = response.errors.for('dispute').on('dispute').map(e => e.code);

          assert.isFalse(response.success);
          assert.equal(errorCodes.length, 2);
          assert.include(errorCodes, ValidationErrorCodes.Dispute.DigitalGoodsMissingDownloadDate);
          assert.include(errorCodes, ValidationErrorCodes.Dispute.DigitalGoodsMissingEvidence);
        });
    });

    it('returns error with partial non-disputed transaction information', () => {
      let disputeId;

      return createSampleDispute()
        .then((dispute) => {
          disputeId = dispute.id;
        })
        .then(() => {
          return disputeGateway.addTextEvidence(
            disputeId,
            {
              content: 'foo',
              category: 'PRIOR_NON_DISPUTED_TRANSACTION_ARN'
            });
        })
        .then(() => {
          return disputeGateway.finalize(disputeId);
        })
        .then((response) => {
          let errorCodes = response.errors.for('dispute').on('dispute').map(e => e.code);

          assert.isFalse(response.success);
          assert.isTrue(errorCodes.length > 0);
          assert.include(errorCodes, ValidationErrorCodes.Dispute.NonDisputedPriorTransactionEvidenceMissingDate);
        });
    });
  });

  describe('self.find', () => {
    it('returns a Dispute given a Dispute ID', () => {
      return disputeGateway.find('open_dispute').then((response) => {
        let dispute = response.dispute;

        assert.equal('31.00', dispute.amountDisputed);
        assert.equal('0.00', dispute.amountWon);
        assert.equal('open_dispute', dispute.id);
        assert.equal(Dispute.Status.Open, dispute.status);
        assert.equal('open_disputed_transaction', dispute.transaction.id);
        assert.isDefined(dispute.graphQLId);
      });
    });

    it('errors when dispute not found', () => {
      return disputeGateway.find('invalid-id')
        .then(() => {
          assert.fail('find should have failed');
        })
        .catch((err) => {
          assert.equal(err.type, 'notFoundError');
          assert.equal(err.message, 'dispute with id \'invalid-id\' not found');
        });
    });
  });

  describe('self.removeEvidence', () => {
    it('removes evidence from a dispute', () => {
      var disputeId;

      return createSampleDispute()
        .then((dispute) => {
          disputeId = dispute.id;

          return disputeGateway.addTextEvidence(disputeId, 'text evidence');
        })
        .then((response) => {
          return disputeGateway.removeEvidence(disputeId, response.evidence.id);
        })
        .then((response) => {
          assert.isTrue(response.success);
        });
    });

    it('throws error when dispute or evidence not found', () => {
      return disputeGateway.removeEvidence('unknown_dispute_id', 'unknown_evidence_id')
        .then(() => {
          assert.fail('removeEvidence should have failed');
        })
        .catch((err) => {
          assert.equal(err.type, 'notFoundError');
          assert.equal(err.message, 'evidence with id \'unknown_evidence_id\' for dispute with id \'unknown_dispute_id\' not found');
        });
    });

    it('returns error when dispute not open', () => {
      var disputeId, evidenceId;

      return createSampleDispute()
        .then((dispute) => {
          disputeId = dispute.id;

          return disputeGateway.addTextEvidence(disputeId, 'text evidence');
        })
        .then((response) => {
          evidenceId = response.evidence.id;

          return disputeGateway.accept(disputeId);
        })
        .then(() => {
          return disputeGateway.removeEvidence(disputeId, evidenceId);
        })
        .then((response) => {
          let error = response.errors.for('dispute').on('status')[0];

          assert.isFalse(response.success);
          assert.equal(ValidationErrorCodes.Dispute.CanOnlyRemoveEvidenceFromOpenDispute, error.code);
          assert.equal('Evidence can only be removed from disputes that are in an Open state', error.message);
        });
    });
  });
});
