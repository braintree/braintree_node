class CustomerSearch
  constructor: -> @criteria = {}
  addCriteria: (key, value) -> @criteria[key] = value
  toHash: -> @criteria

  field: (nodeName)
    new EqualityNode(nodeName, CustomerSearch)

class SearchNode
  constructor: (nodeName, parentName) ->
    @nodeName = nodeName
    @parentName = parentName

  operators: (operatorNames...) ->
    for operator in operatorNames
      @[operator] = (value) =>
        @parentName.addCriteria(@nodeName, { operator : value.toString() }

class EqualityNode extends SearchNode
  operators("is", "isNot")

exports.CustomerSearch = CustomerSearch
