_ = require('underscore')._

class AdvancedSearch
  constructor: -> @criteria = {}

  addCriteria: (key, value) -> @criteria[key] = value

  toHash: -> @criteria

  @equalityFields: (fields...) ->
    @_createFieldAccessors(fields, EqualityNode)

  @partialMatchFields: (fields...) ->
    @_createFieldAccessors(fields, PartialMatchNode)

  @textFields: (fields...) ->
    @_createFieldAccessors(fields, TextNode)

  @keyValueFields: (fields...) ->
    @_createFieldAccessors(fields, KeyValueNode)

  @multipleValueField: (field, options = {}) ->
    @::[field] = @_fieldTemplate(field, MultipleValueNode, options)

  @_fieldTemplate: (field, nodeClass, options) ->
    if options
      -> new nodeClass(field, @, options)
    else
      -> new nodeClass(field, @)

  @_createFieldAccessors: (fields, nodeClass) ->
    @::[field] = @_fieldTemplate(field, nodeClass) for field in fields

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

class PartialMatchNode extends EqualityNode
  @operators("endsWith", "startsWith")

class TextNode extends PartialMatchNode
  @operators("contains")

class KeyValueNode extends SearchNode
  is: (value) -> @parent.addCriteria(@nodeName, value)

class MultipleValueNode extends SearchNode
  constructor: (nodeName, parent, options) ->
    super(nodeName, parent)
    @options = options

  allowedValues: -> @options['allows']

  in: (values...) ->
    values = _.flatten(values)

    if @allowedValues?()
      allowedValues = @allowedValues()
      badValues = _.without(values, allowedValues...)
      throw new Error("Invalid argument(s) for #{@nodeName}") unless _.isEmpty(badValues)

    @parent.addCriteria(@nodeName, values)

  is: (value) ->
    @in(value)

exports.AdvancedSearch = AdvancedSearch
