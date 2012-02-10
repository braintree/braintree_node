require('../../spec_helper')

{_} = require('underscore')
braintree = specHelper.braintree

vows
  .describe('SettlementBatchSummaryGateway')
  .addBatch
    'generate':
      'when there is no data':
        topic: ->
          specHelper.defaultGateway.settlementBatchSummary.generate(settlementDate: '2011-01-01', @callback)
          undefined
        'is successful': (err, response) ->
          assert.isTrue(response.success)
        'returns an empty array': (err, response) ->
          assert.deepEqual(response.settlementBatchSummary.records, [])

      'if date can not be parsed':
        topic: ->
          specHelper.defaultGateway.settlementBatchSummary.generate(settlementDate: 'NOT A DATE', @callback)
          undefined
        'is not successful': (err, response) ->
          assert.isFalse(response.success)
        'has errors on the date': (err, response) ->
          assert.equal(response.errors.for('settlementBatchSummary').on('settlementDate')[0].code, '82302')
          assert.equal(response.errors.for('settlementBatchSummary').on('settlementDate')[0].attribute, 'settlement_date')

      'if given a valid settlement date':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.transaction.credit(
            amount: '5.00'
            creditCard:
              number: '4111111111111111'
              expirationDate: '05/12'
          , (err, response) ->
            specHelper.settleTransaction(response.transaction.id, (err, response) ->
              formattedDate = specHelper.dateToMdy(specHelper.nowInEastern())
              specHelper.defaultGateway.settlementBatchSummary.generate(settlementDate: formattedDate, callback)
            )
          )
          undefined
        'is successful': (err, response) ->
          assert.isTrue(response.success)
        'returns transactions on a given day': (err, response) ->
          records = response.settlementBatchSummary.records
          visaRecords = _.select(records, (record) ->
            record['cardType'] is 'Visa'
          )

          assert.ok(visaRecords[0]['count'] >= 1)
          assert.ok(parseFloat(visaRecords[0]['amountSettled']) >= parseFloat("5.00"))

      'if given a custom field to group by':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.transaction.credit(
            amount: '5.00'
            creditCard:
              number: '4111111111111111'
              expirationDate: '05/12'
            customFields:
              store_me: 1
          , (err, response) ->
            specHelper.settleTransaction(response.transaction.id, (err, response) ->
              formattedDate = specHelper.dateToMdy(specHelper.nowInEastern())
              specHelper.defaultGateway.settlementBatchSummary.generate(
                settlementDate: formattedDate
                groupByCustomField: "store_me"
              , callback)
            )
          )
          undefined
        'is successful': (err, response) ->
          assert.isTrue(response.success)
        'groups by the custom field': (err, response) ->
          records = response.settlementBatchSummary.records
          assert.ok(records[0]['store_me'])

  .export(module)
