require("../../spec_helper")
{CustomerSearch} = require('../../../lib/braintree/customer_search')

vows
  .describe("CustomerSearch")
  .addBatch
    "customer search":
      "when no results are found":
        topic: ->
          specHelper.defaultGateway.customer.search((search) ->
            search.email().is(specHelper.randomId() + "@example.com")
          , @callback)
          undefined

        'does not have error': (err, response) ->
          assert.isNull(err)

        'returns no results': (err, response) ->
          assert.equal(response.length(), 0)
      "when the search yields a single result":
        topic: ->
          callback = @callback
          random = specHelper.randomId()
          specHelper.defaultGateway.customer.create(
            firstName: 'Bob',
            lastName: "Smith",
            email: random + '@smith.org'
            , (err, response) ->
              specHelper.defaultGateway.customer.search((search) ->
                search.email().is(random + "@smith.org")
              , (err, response) ->
                response.first(callback)
              )
          )
          undefined

        'returns the first customer': (err, customer) ->
          assert.equal(customer.firstName, 'Bob')
          assert.equal(customer.lastName, 'Smith')

      "when the seach returns multiple values":
        topic: ->
          callback = @callback
          random = specHelper.randomId()
          specHelper.defaultGateway.customer.create({
            firstName: 'Bob',
            lastName: random,
            }, (err, response) ->
            specHelper.defaultGateway.customer.create({
              firstName: 'Ryan',
              lastName: random,
              }, (err, response) ->
                specHelper.defaultGateway.customer.search((search) ->
                  search.lastName().is(random)
                , (err, response) ->
                  customers = []
                  response.each( (err, customer) ->
                    customers.push(customer)
                    if(customers.length == 2)
                      callback(null, {customers: customers, lastName: random})
                    else if customers.length > 2
                      callback("TOO Many Results", null)
                  )
                )
              )
            )
          undefined
        "2 results should be returned": (err, results) ->
          assert.equal(results.customers.length, 2)
          assert.equal(results.customers[0].lastName, results.lastName)
          assert.equal(results.customers[1].lastName, results.lastName)

        "complex search":
          topic: ->
            callback = @callback
            id = specHelper.randomId()
            email = "#{specHelper.randomId()}@example.com"
            firstName = "John_#{specHelper.randomId()}"
            lastName = "Smith_#{specHelper.randomId()}"
            cardToken = "card_#{specHelper.randomId()}"

            customerParams =
              company: "Braintree"
              email: email
              fax: "(123)456-7890"
              firstName: firstName
              id: id
              lastName: lastName
              phone: "(456)123-7890"
              website: "http://www.example.com/"
              creditCard:
                number: "5105105105105100"
                expirationDate: "05/2012"
                cardholderName: "#{firstName} #{lastName}"
                token: cardToken
                billingAddress:
                  firstName: firstName
                  lastName: lastName
                  streetAddress: "123 Fake St"
                  extendedAddress: "Suite 403"
                  locality: "Chicago"
                  region: "IL"
                  postalCode: "60607"
                  countryName: "United States of America"

            specHelper.defaultGateway.customer.create(customerParams, (err, response) ->
              textCriteria =
                addressCountryName: "United States of America"
                addressExtendedAddress: "Suite 403"
                addressFirstName: firstName
                addressLastName: lastName
                addressLocality: "Chicago"
                addressPostalCode: "60607"
                addressStreetAddress: "123 Fake St"
                cardholderName: "#{firstName} #{lastName}"
                company: "Braintree"
                email: email
                fax: "(123)456-7890"
                firstName: firstName
                id: id
                lastName: lastName
                paymentMethodToken: cardToken
                phone: "(456)123-7890"
                website: "http://www.example.com/"

              equalityCriteria =
                creditCardExpirationDate: "05/2012"

              partialCriteria =
                creditCardNumber:
                  startsWith: "5105"
                  endsWith: "100"

              multipleValueCriteria =
                ids: customerParams.id

              today = new Date()
              yesterday = new Date(); yesterday.setDate(today.getDate() - 1)
              tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1)

              rangeCriteria =
                createdAt:
                  min: yesterday
                  max: tomorrow

              specHelper.defaultGateway.customer.search((search) ->
                for criteria, value of textCriteria
                  search[criteria]().is(value)

                for criteria, value of equalityCriteria
                  search[criteria]().is(value)

                for criteria, partial of partialCriteria
                  for operator, value of partial
                    search[criteria]()[operator](value)

                for criteria, value of multipleValueCriteria
                  search[criteria]().is(value)

                for criteria, range of rangeCriteria
                  for operator, value of range
                    search[criteria]()[operator](value)
              , (err, response) ->
                callback(err,
                  customerId: customerParams.id
                  result: response
                )
              )
            )
            undefined
          "on search":
            "result":
              topic: (response) ->
                response
              "is successful": (response) ->
                assert.isTrue(response.result.success)
              "returns one result": (response) ->
                assert.equal(response.result.length(), 1)
            "get first of collection":
              topic: (response) ->
                callback = @callback
                response.result.first((err, result) ->
                  callback(err,
                    customerId: response.customerId
                    result: result
                  )
                )
                undefined
              "gets customer domain object": (err, response) ->
                assert.isObject(response.result)
                assert.equal(response.result.id, response.customerId)
              "does not error": (err, response) ->
                assert.isNull(err)

  .export(module)

