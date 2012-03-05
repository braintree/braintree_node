require("../../spec_helper.coffee")
{CustomerSearch} = require('../../../lib/braintree/customer_search')
_ = require('underscore')

vows
  .describe("CustomerSearch")
  .addBatch
    "when the seach returns multiple values":
      topic: ->
        callback = @callback
        specHelper.defaultGateway.customer.search(
          (search) ->
            search.createdAt().max(new Date())
          ,(err, response) ->
            customers = []
            response.each( (err, customer) ->
              customers.push(customer)
              if(customers.length == response.length())
                callback(null, {customers: customers, expectedLength: response.length()})
            )
        )
        undefined
      "should return results from all pages": (err, results) ->
        assert.isNull(err)
        assert.equal(results.customers.length, results.expectedLength)
        assert.equal(_.uniq(_.map(results.customers, (customer) -> customer.id)).length, results.expectedLength)
        assert(results.customers.length > 50)

.export(module)
