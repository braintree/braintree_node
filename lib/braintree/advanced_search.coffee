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

  @multipleValueOrTextField: (field, options = {}) ->
    @::[field] = @_fieldTemplate(field, MultipleValueOrTextNode, options)

  @_fieldTemplate: (field, nodeClass, options) ->
    -> new nodeClass(field, @, options)

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

    @::[operator] = operatorTemplate(operator) for operator in operators

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

class MultipleValueOrTextNode extends MultipleValueNode
  constructor: (nodeName, parent, options) ->
    super
    @textNode = new TextNode(nodeName, parent)

  _.each(["is", "isNot", "endsWith", "startsWith", "contains"], (methodName) ->
    delegatorTemplate = (methodName) =>
      (value) -> @textNode[methodName](value)

    MultipleValueOrTextNode::[methodName] = delegatorTemplate(methodName))

exports.AdvancedSearch = AdvancedSearch
