require("../../spec_helper")
_ = require("underscore")
{TransactionSearch} = require('../../../lib/braintree/transaction_search')
{Transaction} = require('../../../lib/braintree/transaction')
{CreditCard} = require('../../../lib/braintree/credit_card')
braintree = specHelper.braintree 

describe "TransactionSearch", ->
  describe "search", ->
    it "finds transactions", (done) ->
      @timeout 10000

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
          countryName: "United States of America"
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
          website: "http://www.example.com/"
        orderId: "123"
        options:
          storeInVault: true
          submitForSettlement: true

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        specHelper.settleTransaction response.transaction.id, (err, settleResult) ->
          specHelper.defaultGateway.transaction.find response.transaction.id, (err, transaction) ->
            textCriteria =
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
              customerWebsite: "http://www.example.com/"
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

            keyValueCriteria =
              refund: false

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

            search = (search) ->
              for criteria, value of textCriteria
                search[criteria]().is(value)

              for criteria, partial of partialCriteria
                for operator, value of partial
                  search[criteria]()[operator](value)

              for criteria, value of multipleValueCriteria
                search[criteria]().in(value)

              for criteria, value of keyValueCriteria
                search[criteria]().is(value)

              for criteria, range of rangeCriteria
                for operator, value of range
                  search[criteria]()[operator](value)

            specHelper.defaultGateway.transaction.search search, (err, response) ->
              assert.isTrue(response.success)
              assert.equal(response.length(), 1)

              response.first (err, transaction) ->
                assert.isObject(transaction)
                assert.isNull(err)

                done()

    xit "pages correctly (slow test)", (done) ->
      random = specHelper.randomId()
      transactionParams =
        amount: '13.19'
        orderId: random
        creditCard:
          number: '4111111111111111'
          expirationDate: '01/2015'
      counter = 0

      _.each [1..51], ->
        specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
          counter += 1
          if counter == 51
            specHelper.defaultGateway.transaction.search ((search) -> search.orderId().is(random)), (err, response) ->
              transactions = {}

              responseCounter = 0
              response.each (err, transaction) ->
                console.log(transaction.id)
                if transactions[transaction.id]
                  assert.equal(transaction.id, 0)
                transactions[transaction.id] = true
                responseCounter += 1

                if _.size(transactions) != responseCounter || responseCounter == 51
                  assert.equal(_.size(transactions), responseCounter)
                  done()

    it "returns multiple results", (done) ->
      random = specHelper.randomId()
      transactionParams =
        amount: '10.00'
        orderId: random
        creditCard:
          number: '4111111111111111'
          expirationDate: '01/2015'

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
          specHelper.defaultGateway.transaction.search ((search) -> search.orderId().is(random)), (err, response) ->
            transactions = []

            response.each (err, transaction) ->
              transactions.push(transaction)

              if transactions.length == 2
                assert.equal(transactions.length, 2)
                assert.equal(transactions[0].orderId, random)
                assert.equal(transactions[1].orderId, random)

                done()

    it "can find transactions by disbursement date", (done) ->
      yesterday = new Date("April 9, 2013")
      tomorrow =  new Date("April 11, 2013")

      search = (s) ->
        s.id().is("deposittransaction")
        s.disbursementDate().min(yesterday)
        s.disbursementDate().max(tomorrow)

      specHelper.defaultGateway.transaction.search search, (err, response) ->
        transactions = []

        response.each (err, transaction) ->
          transactions.push(transaction)

          if transactions.length == 1
            assert.equal(transactions.length, 1)
            assert.equal(transactions[0].disbursementDetails.disbursementDate, "2013-04-10")

            done()

    it "filters on valid merchant account ids", (done) ->
      random = specHelper.randomId()
      transactionParams =
        amount: '10.00'
        orderId: random
        creditCard:
          number: '4111111111111111'
          expirationDate: '01/2015'

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        specHelper.defaultGateway.transaction.search (
          (search) -> 
            search.merchantAccountId().is(response.transaction.merchantAccountId)
            search.id().is(response.transaction.id)
        ), (err, response) ->

          assert.equal(1, response.length())
          done()

    it "filters on valid and invalid merchant account ids", (done) ->
      random = specHelper.randomId()
      transactionParams =
        amount: '10.00'
        orderId: random
        creditCard:
          number: '4111111111111111'
          expirationDate: '01/2015'

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        specHelper.defaultGateway.transaction.search (
          (search) -> 
            search.merchantAccountId().in(response.transaction.merchantAccountId, "invalid_merchant_acct_id")
            search.id().is(response.transaction.id)
        ), (err, response) ->

          assert.equal(1, response.length())
          done()

    it "filters out invalid merchant account ids", (done) ->
      random = specHelper.randomId()
      transactionParams =
        amount: '10.00'
        orderId: random
        creditCard:
          number: '4111111111111111'
          expirationDate: '01/2015'

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        specHelper.defaultGateway.transaction.search (
          (search) -> 
            search.merchantAccountId().is("invalid_merchant_acct_id")
            search.id().is(response.transaction.id)
        ), (err, response) ->

          assert.equal(0, response.length())
          done()

    it "raises Down For Maintenance Error for search timeouts", (done) ->
      specHelper.defaultGateway.transaction.search ((search) -> search.amount().is(-10)), (err, response) ->
        transactions = []
        assert.equal(err.type, braintree.errorTypes.downForMaintenanceError)

        done()

