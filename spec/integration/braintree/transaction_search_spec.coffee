require("../../spec_helper")
{TransactionSearch} = require('../../../lib/braintree/transaction_search')
{Transaction} = require('../../../lib/braintree/transaction')
{CreditCard} = require('../../../lib/braintree/credit_card')

vows
  .describe("TransactionSearch")
  .addBatch
    "text fields":
      topic: ->
        firstName = "Tom_#{specHelper.randomId()}"
        cardToken = "card_#{specHelper.randomId()}"
        customerId = "customer_#{specHelper.randomId()}"

        transactionParams =
          billing:
            company: "Braintree"
            countryName: "US"
            extendedAddress: "Apt B"
            firstName: firstName
            lastName: "Guy"
            locality: "Chicago"
            postalCode: "60646"
            region: "IL"
            streetAddress: "123 Fake St"
          shipping:
            company: "Braintree"
            countryName: "US"
            extendedAddress: "Apt B"
            firstName: firstName
            lastName: "Guy"
            locality: "Chicago"
            postalCode: "60646"
            region: "IL"
            streetAddress: "123 Fake St"
          amount: "5.00"
          creditCard:
            number: "5105105105105100"
            expirationDate: "05/2012"
            cardholderName: "Tom Guy"
            token: cardToken
          customer:
            id: customerId
            company: "Braintree"
            email: "tom@example.com"
            fax: "(123)456-7890"
            firstName: firstName
            lastName: "Guy"
            phone: "(456)123-7890"
            website: "http://www.example.com"
          orderId: "123"
          options:
            storeInVault: true
            submitForSettlement: true
        callback = @callback
        specHelper.defaultGateway.transaction.sale(transactionParams, (err, response) ->
          specHelper.settleTransaction(response.transaction.id, (err, settleResult) ->
            specHelper.defaultGateway.transaction.find(response.transaction.id, (err, transaction) ->
              searchCriteria =
                billingCompany: "Braintree"
                billingCountryName: "United States of America"
                billingExtendedAddress: "Apt B"
                billingFirstName: firstName
                billingLastName: "Guy"
                billingLocality: "Chicago"
                billingPostalCode: "60646"
                billingRegion: "IL"
                billingStreetAddress: "123 Fake St"
                creditCardCardholderName: "Tom Guy"
                currency: "USD"
                customerCompany: "Braintree"
                customerEmail: "tom@example.com"
                customerFax: "(123)456-7890"
                customerFirstName: firstName
                customerId: customerId
                customerLastName: "Guy"
                customerPhone: "(456)123-7890"
                customerWebsite: "http://www.example.com"
                id: transaction.id
                orderId: "123"
                paymentMethodToken: cardToken
                processorAuthorizationCode: transaction.processorAuthorizationCode
                settlementBatchId: transaction.settlementBatchId
                shippingCompany: "Braintree"
                shippingCountryName: "United States of America"
                shippingExtendedAddress: "Apt B"
                shippingFirstName: firstName
                shippingLastName: "Guy"
                shippingLocality: "Chicago"
                shippingPostalCode: "60646"
                shippingRegion: "IL"
                shippingStreetAddress: "123 Fake St"
                creditCardExpirationDate: "05/2012"
                refund: false

              partialCriteria =
                creditCardNumber:
                  startsWith: "5105"
                  endsWith: "100"

              multipleValueCriteria =
                createdUsing: Transaction.CreatedUsing.FullInformation
                creditCardCardType: CreditCard.CardType.MasterCard
                creditCardCustomerLocation: CreditCard.CustomerLocation.US
                merchantAccountId: 'sandbox_credit_card'
                status: Transaction.Status.Settled
                source: Transaction.Source.Api
                type: Transaction.Type.Sale

              today = new Date()
              yesterday = new Date(); yesterday.setDate(today.getDate() - 1)
              tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1)

              rangeCriteria =
                amount:
                  min: 4.99
                  max: 5.01
                createdAt:
                  min: yesterday
                  max: tomorrow
                authorizedAt:
                  min: yesterday
                  max: tomorrow
                settledAt:
                  min: yesterday
                  max: tomorrow
                submittedForSettlementAt:
                  min: yesterday
                  max: tomorrow

              specHelper.defaultGateway.transaction.search((search) ->
                for criteria, value of searchCriteria
                  search[criteria]().is(value)
                for criteria, partial of partialCriteria
                  for operator, value of partial
                    search[criteria]()[operator](value)
                for criteria, value of multipleValueCriteria
                  search[criteria]().in(value)
                for criteria, range of rangeCriteria
                  for operator, value of range
                    search[criteria]()[operator](value)

              , (err, response) ->
                callback(err,
                  transactionId: searchCriteria.id
                  result: response
                )
              )
            )
          )
        )
        undefined # using callback, therefore explicitly returning undefined
      "on search":
        "result":
          topic: (response) ->
            response
          "is successful": (response) ->
            assert.isTrue(response.result.success)
          "returns one result": (err, response) ->
            assert.equal(response.result.length(), 1)
        "get first of collection":
          topic: (response) ->
            callback = @callback
            response.result.first((err, result) ->
              callback(err,
                transactionId: response.transactionId
                result: result
              )
            )
            undefined
          "gets transaction domain object": (err, response) ->
            assert.isObject(response.result)
            assert.equal(response.result.id, response.transactionId)
          "does not error": (err, response) ->
            assert.isNull(err)

  .export(module)
