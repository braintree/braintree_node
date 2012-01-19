class AdvancedSearch
  constructor: -> @criteria = {}

  addCriteria: (key, value) -> @criteria[key] = value

  toHash: -> @criteria

  @equalityFields: (fields...) ->
    @createFieldAccessors(fields, EqualityNode)

  @createFieldAccessors: (fields, nodeClass) ->
    fieldTemplate = (field) =>
      -> new nodeClass(field, @)

    @::[field] = fieldTemplate(field) for field in fields

class SearchNode
  constructor: (nodeName, parent) ->
    @nodeName = nodeName
    @parent = parent

  @operators: (operators...) ->
    operatorTemplate = (operator) =>
      (value) ->
        criterion = {}
        criterion[operator] = "#{value}"
        @parent.addCriteria(@nodeName, criterion)

    SearchNode::[operator] = operatorTemplate(operator) for operator in operators

class EqualityNode extends SearchNode
  @operators("is", "isNot")

exports.AdvancedSearch = AdvancedSearch
