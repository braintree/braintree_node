'use strict';

let Config = require('../../../lib/braintree/config').Config;
let Dispute = require('../../../lib/braintree/dispute').Dispute;

describe('DisputeSearch', () => {
  describe('callback', () => {
    it('returns no results', (done) => {
      let search = (search) => {
        return search.id().is('non_existent_dispute');
      };

      specHelper.defaultGateway.dispute.search(search, (err, response) => {
        assert.isNull(err);
        assert.equal(0, response.length)

        done();
      });
    });

    it('returns a single dispute by ID', (done) => {
      specHelper.defaultGateway.dispute.search(function (search) {
        return search.id().is('open_dispute');
      }, function (err, response) {
        assert.isNull(err);
        assert.equal(1, response.length)

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
        assert.equal(2, response.length)

        done();
      });
    });

    it('returns disputes by date range', (done) => {
      specHelper.defaultGateway.dispute.search(function (search) {
        return search.receivedDate().between(
          '03/03/2014', '03/05/2014'
        );
      }, function (err, response) {
        assert.isNull(err);
        assert.equal(1, response.length)

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

      stream.on('data', disptute => disputes.push(dispute));

      stream.on('end', () => {
        assert.equal(0, disputes.length)

        done();
      })
    });

    it('returns a single dispute by ID', (done) => {
      let stream = specHelper.defaultGateway.dispute.search((search) => {
        return search.id().is('open_dispute');
      });

      stream.on('data', dispute => disputes.push(dispute));

      stream.on('end', () => {
        assert.equal(1, disputes.length)

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
        assert.equal(2, disputes.length)

        done();
      });
    });

    it('returns disputes by date range', (done) => {
      let stream = specHelper.defaultGateway.dispute.search(function (search) {
        return search.receivedDate().between(
          '03/03/2014', '03/05/2014'
        );
      });

      stream.on('data', dispute => disputes.push(dispute));

      stream.on('end', () => {
        assert.equal(1, disputes.length)

        done();
      });
    });
  });
});
