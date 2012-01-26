require("../../spec_helper")
{CustomerSearch} = require('../../../lib/braintree/customer_search')

vows
  .describe("CustomerSearch")
  .addBatch
    "search":
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
  .export(module)

