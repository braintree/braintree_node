'use strict';

let Dispute = require('../../../lib/braintree/dispute').Dispute;
let CreditCardNumbers = require('../../../lib/braintree/test_values/credit_card_numbers').CreditCardNumbers;

describe('DisputeSearch', () => {
  describe('callback', () => {
    it('returns no results', (done) => {
      specHelper.defaultGateway.dispute.search((search) => {
        return search.id().is('non_existent_dispute');
      }, (err, response) => {
        assert.isNull(err);
        assert.equal(0, response.length);

        done();
      });
    });

    it('returns a single dispute by ID', (done) => {
      specHelper.defaultGateway.dispute.search(function (search) {
        return search.id().is('open_dispute');
      }, function (err, response) {
        assert.isNull(err);
        assert.equal(1, response.length);

        done();
      });
    });

    it('returns disputes by multiple reasons', (done) => {
      specHelper.defaultGateway.dispute.search(function (search) {
        return search.reason().in([
          Dispute.Reason.ProductUnsatisfactory,
          Dispute.Reason.Retrieval
        ]);
      }, function (err, response) {
        assert.isNull(err);
        assert(response.length >= 2);

        done();
      });
    });

    it('returns disputes by customer_id', (done) => {
      specHelper.defaultGateway.customer.create({
        firstName: 'Action',
        lastName: 'Jackson'
      }, (err, result) => {
        specHelper.defaultGateway.transaction.sale({
          amount: '10.00',
          creditCard: {
            expirationDate: '12/2020',
            number: CreditCardNumbers.Dispute.Chargeback
          },
          customerId: result.customer.id,
          options: {submitForSettlement: true}
        }, (err, result) =>
          specHelper.defaultGateway.dispute.search(function (search) {
            return search.customerId().is(result.transaction.customer.id);
          }, (err, response) => {
            assert.isNull(err);
            assert.equal(1, response.length);

            done();
          })
        );
      });
    });

    it('returns disputes by received date range', (done) => {
      specHelper.defaultGateway.dispute.search(function (search) {
        return search.receivedDate().between(
          '03/03/2014', '03/05/2014'
        );
      }, function (err, response) {
        assert.isNull(err);
        assert(response.length >= 1);

        done();
      });
    });

    it('returns disputes by disbursement date range', (done) => {
      specHelper.defaultGateway.dispute.search(function (search) {
        return search.disbursementDate().between(
          '03/03/2014', '03/05/2014'
        );
      }, function (err, response) {
        assert.isNull(err);
        assert(response.length >= 1);

        done();
      });
    });

    it('returns disputes by effective date range', (done) => {
      specHelper.defaultGateway.dispute.search(function (search) {
        return search.effectiveDate().between(
          '03/03/2014', '03/05/2014'
        );
      }, function (err, response) {
        assert.isNull(err);
        assert(response.length >= 1);

        done();
      });
    });
  });

  describe('streams', () => {
    let disputes;

    beforeEach(() => {
      disputes = [];
    });

    it('returns no results', (done) => {
      let stream = specHelper.defaultGateway.dispute.search((search) => {
        return search.id().is('non_existent_dispute');
      });

      stream.on('data', dispute => disputes.push(dispute));

      stream.on('end', () => {
        assert.equal(0, disputes.length);

        done();
      });
    });

    it('returns a single dispute by ID', (done) => {
      let stream = specHelper.defaultGateway.dispute.search((search) => {
        return search.id().is('open_dispute');
      });

      stream.on('data', dispute => disputes.push(dispute));

      stream.on('end', () => {
        assert.equal(1, disputes.length);

        done();
      });
    });

    it('returns disputes by multiple reasons', (done) => {
      let stream = specHelper.defaultGateway.dispute.search(function (search) {
        return search.reason().in([
          Dispute.Reason.ProductUnsatisfactory,
          Dispute.Reason.Retrieval
        ]);
      });

      stream.on('data', dispute => disputes.push(dispute));

      stream.on('end', () => {
        assert(disputes.length >= 2);

        done();
      });
    });

    it('returns disputes by chargebackProtectionLevel', (done) => {
          let stream = specHelper.defaultGateway.dispute.search(function (search) {
            return search.chargebackProtectionLevel().in([
              Dispute.ChargebackProtectionLevel.Effortless
            ]);
          });

          stream.on('data', dispute => disputes.push(dispute));

          stream.on('end', () => {
            assert.equal(disputes.length, 1);
            assert.equal(disputes[0].caseNumber, "CASE-CHARGEBACK-PROTECTED");
            assert.equal(disputes[0].reason, Dispute.Reason.Fraud);
            assert.equal(disputes[0].chargebackProtectionLevel, Dispute.ChargebackProtectionLevel.Effortless);

            done();
          });
        });

    it('returns disputes by customer_id', (done) => {
      specHelper.defaultGateway.customer.create({
        firstName: 'Action',
        lastName: 'Jackson'
      }, (err, result) => {
        specHelper.defaultGateway.transaction.sale({
          amount: '10.00',
          creditCard: {
            expirationDate: '12/2020',
            number: CreditCardNumbers.Dispute.Chargeback
          },
          customerId: result.customer.id,
          options: {submitForSettlement: true}
        }, (err, result) => {
          let stream = specHelper.defaultGateway.dispute.search(function (search) {
            return search.customerId().is(result.transaction.customer.id);
          });

          stream.on('data', dispute => disputes.push(dispute));

          stream.on('end', () => {
            assert.isNull(err);
            assert.equal(1, disputes.length);

            done();
          });
        });
      });
    });

    it('returns disputes by received date range', (done) => {
      let stream = specHelper.defaultGateway.dispute.search(function (search) {
        return search.receivedDate().between(
          '03/03/2014', '03/05/2014'
        );
      });

      stream.on('data', dispute => disputes.push(dispute));

      stream.on('end', () => {
        assert(disputes.length >= 1);

        done();
      });
    });

    it('returns disputes by disbursement date range', (done) => {
      let stream = specHelper.defaultGateway.dispute.search(function (search) {
        return search.disbursementDate().between(
          '03/03/2014', '03/05/2014'
        );
      });

      stream.on('data', dispute => disputes.push(dispute));

      stream.on('end', () => {
        assert(disputes.length >= 1);

        done();
      });
    });

    it('returns disputes by effective date range', (done) => {
      let stream = specHelper.defaultGateway.dispute.search(function (search) {
        return search.effectiveDate().between(
          '03/03/2014', '03/05/2014'
        );
      });

      stream.on('data', dispute => disputes.push(dispute));

      stream.on('end', () => {
        assert(disputes.length >= 1);

        done();
      });
    });
  });
});
