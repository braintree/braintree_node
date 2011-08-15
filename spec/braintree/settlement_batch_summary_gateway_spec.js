require('../spec_helper');

var braintree = specHelper.braintree;

vows.describe('SettlementBatchSummaryGateway').addBatch({
  'generate': {
    'when there is no data': {
      topic: function () {
        specHelper.defaultGateway.settlementBatchSummary.generate('2011-01-01', this.callback);
      },

      'is successful': function (err, response) {
        assert.isTrue(response.success);
      },

      'returns an empty array': function (err, response) {
        assert.deepEqual([], response.settlementBatchSummary.records);
      }
    }
  }
}).export(module);
