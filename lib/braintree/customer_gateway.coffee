{Gateway} = require('./gateway')
{Customer} = require('./customer')
{CustomerSearch} = require('./customer_search')
util = require('util')
_ = require('underscore')

exceptions = require('./exceptions')

class CustomerGateway extends Gateway
  constructor: (@gateway) ->

  create: (attributes, callback) ->
    @gateway.http.post('/customers', {customer: attributes}, @responseHandler(callback))

  delete: (customerId, callback) ->
    @gateway.http.delete("/customers/#{customerId}", callback)

  find: (customerId, callback) ->
    if(customerId.trim() == '')
      callback(exceptions.NotFoundError(), null)
    else
      @gateway.http.get "/customers/#{customerId}", (err, response) ->
        if err
          callback(err, null)
        else
          callback(null, new Customer(response.customer))

  update: (customerId, attributes, callback) ->
    @gateway.http.put("/customers/#{customerId}", {customer: attributes}, @responseHandler(callback))

  search: (fn, callback) ->
    search = new CustomerSearch()
    fn(search)
    @gateway.http.post("/customers/advanced_search_ids", {search: search.toHash()}, @searchResponseHandler(@pagingFunctionGenerator(search), callback))

  responseHandler: (callback) ->
    @createResponseHandler("customer", Customer, callback)

  pagingFunctionGenerator: (search) ->
    (ids, callback) =>
      searchCriteria = search.toHash()
      searchCriteria["ids"] = ids
      @gateway.http.post("/customers/advanced_search",
        { search : searchCriteria },
        (err, response) ->
          if err
            callback(err, null)
          else
            if _.isArray(response.customers.customer)
              for customer in response.customers.customer
                callback(null, new Customer(customer))
            else
              callback(null, new Customer(response.customers.customer)))


exports.CustomerGateway = CustomerGateway
