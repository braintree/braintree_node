{Util} = require('./util')

class AdvancedSearch
  @equalityFields: (fields...) ->
    @_createFieldAccessors(fields, EqualityNode)

  @partialMatchFields: (fields...) ->
    @_createFieldAccessors(fields, PartialMatchNode)

  @textFields: (fields...) ->
    @_createFieldAccessors(fields, TextNode)

  @keyValueFields: (fields...) ->
    @_createFieldAccessors(fields, KeyValueNode)

  @multipleValueField: (field, options = {}) ->
    @_createFieldAccessors([field], MultipleValueNode, options)

  @multipleValueOrTextField: (field, options = {}) ->
    @_createFieldAccessors([field], MultipleValueOrTextNode, options)

  @rangeFields: (fields...) ->
    @_createFieldAccessors(fields, RangeNode)

  @_createFieldAccessors: (fields, nodeClass, options) ->
    @::[field] = @_fieldTemplate(field, nodeClass, options) for field in fields

  @_fieldTemplate: (field, nodeClass, options) ->
    -> new nodeClass(field, @, options)

  constructor: -> @criteria = {}

  addCriteria: (key, value) ->
    if @criteria[key] is Object(@criteria[key])
      Util.merge(@criteria[key], value)
    else
      @criteria[key] = value

  toHash: -> @criteria

class SearchNode
  @operators: (operators...) ->
    operatorTemplate = (operator) =>
      (value) ->
        criterion = {}
        criterion[operator] = "#{value}"
        @parent.addCriteria(@nodeName, criterion)

    @::[operator] = operatorTemplate(operator) for operator in operators

  constructor: (nodeName, parent) ->
    @nodeName = nodeName
    @parent = parent

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
    values = Util.flatten(values)

    if @allowedValues?()
      allowedValues = @allowedValues()
      badValues = Util.without(values, allowedValues)
      throw new Error("Invalid argument(s) for #{@nodeName}") unless Util.arrayIsEmpty(badValues)

    @parent.addCriteria(@nodeName, values)

  is: (value) -> @in(value)

class MultipleValueOrTextNode extends MultipleValueNode
  @delegators: (delegatedMethods...) ->
    delegatorTemplate = (methodName) =>
      (value) -> @textNode[methodName](value)

    @::[methodName] = delegatorTemplate(methodName) for methodName in delegatedMethods

  @delegators("contains", "endsWith", "is", "isNot", "startsWith")

  constructor: (nodeName, parent, options) ->
    super
    @textNode = new TextNode(nodeName, parent)

class RangeNode extends SearchNode
  @operators("is")

  between: (min, max) ->
    @min(min)
    @max(max)

  max: (value) ->
    @parent.addCriteria(@nodeName, { max : value})

  min: (value) ->
    @parent.addCriteria(@nodeName, { min : value})

exports.AdvancedSearch = AdvancedSearch
