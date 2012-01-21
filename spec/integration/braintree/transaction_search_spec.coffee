require("../../spec_helper")
{TransactionSearch} = require('../../../lib/braintree/transaction_search')

vows
  .describe("TransactionSearch")
  .addBatch
    "text fields":
      "is":
        topic: ->
          callback = @callback
          specHelper.defaultGateway.transaction.sale(
            billing:
              company: "Braintree"
            amount: "5.00"
            creditCard:
              number: "5105105105105100"
              expirationDate: "05/12"
            options:
              submitForSettlement: true
          , (err, response) ->
            transactionId = response.transaction.id
            specHelper.defaultGateway.transaction.search((search) ->
              search.id().is(transactionId)
            , (err, response) ->
              response.first(callback)
            )
          )
          undefined # using callback, therefore explicitly returning undefined
        "gets a result": (err, transaction) ->
          assert.isObject(transaction)
          assert.equal(transaction.billing.company, "Braintree")
        "does not error": (err, transaction) ->
          assert.isNull(err)

  .export(module)
