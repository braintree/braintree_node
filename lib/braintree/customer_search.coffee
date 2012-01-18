class CustomerSearch
  constructor: -> @criteria = {}
  addCriteria: (key, value) -> @criteria[key] = value

  email: ->
    is: (value) => @addCriteria("email", { "is" : value})

  toHash: -> @criteria

exports.CustomerSearch = CustomerSearch
