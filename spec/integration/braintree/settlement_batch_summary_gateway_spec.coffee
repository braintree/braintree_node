require('../../spec_helper')
{TestTransaction} = require('../../../lib/braintree/test_transaction')

braintree = specHelper.braintree

describe "SettlementBatchSummaryGateway", ->
  describe "generate", ->
    it "creates a batch with no records", (done) ->
      specHelper.defaultGateway.settlementBatchSummary.generate settlementDate: '2011-01-01', (err, response) ->
        assert.isTrue(response.success)
        assert.deepEqual(response.settlementBatchSummary.records, [])

        done()

    it "returns an error if the date cannot be parsed", (done) ->
      specHelper.defaultGateway.settlementBatchSummary.generate settlementDate: 'NOT A DATE', (err, response) ->
        assert.isFalse(response.success)
        assert.equal(response.errors.for('settlementBatchSummary').on('settlementDate')[0].code, '82302')
        assert.equal(response.errors.for('settlementBatchSummary').on('settlementDate')[0].attribute, 'settlement_date')

        done()

    it "creates a settlement batch with the appropriate records", (done) ->
      transactionParams =
        amount: '5.00'
        creditCard:
          number: '4111111111111111'
          expirationDate: '05/12'

      specHelper.defaultGateway.transaction.credit transactionParams, (err, transactionResponse) ->
        testTransaction = new TestTransaction()
        testTransaction.settle specHelper.defaultGateway, transactionResponse.transaction.id, (err, settleResponse) ->
          formattedDate = specHelper.dateToMdy(specHelper.nowInEastern())
          specHelper.defaultGateway.settlementBatchSummary.generate settlementDate: formattedDate, (err, settleBatchResponse) ->
            assert.isTrue(settleBatchResponse.success)

            visaRecords = (record for record in settleBatchResponse.settlementBatchSummary.records when record.cardType is "Visa")
            assert.ok(visaRecords[0]['count'] >= 1)
            assert.ok(parseFloat(visaRecords[0]['amountSettled']) >= parseFloat("5.00"))

            done()

    it "groups by custom field", (done) ->
      transactionParams =
        amount: '5.00'
        creditCard:
          number: '4111111111111111'
          expirationDate: '05/12'
        customFields:
          store_me: 1

      specHelper.defaultGateway.transaction.credit transactionParams, (err, transactionResponse) ->
        testTransaction = new TestTransaction()
        testTransaction.settle specHelper.defaultGateway, transactionResponse.transaction.id, (err, settleResponse) ->
          formattedDate = specHelper.dateToMdy(specHelper.nowInEastern())
          settlementBatchParams =
            settlementDate: formattedDate
            groupByCustomField: "store_me"

          specHelper.defaultGateway.settlementBatchSummary.generate settlementBatchParams, (err, settleBatchResponse) ->
            assert.isTrue(settleBatchResponse.success)
            records = settleBatchResponse.settlementBatchSummary.records
            assert.ok(records[0]['store_me'])

            done()
