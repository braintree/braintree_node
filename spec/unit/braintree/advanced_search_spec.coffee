require("../../spec_helper")
{AdvancedSearch} = require('../../../lib/braintree/advanced_search')

class TestSearch extends AdvancedSearch
  @equalityFields "equality"
  @partialMatchFields "partialMatch"
  @textFields "text"
  @keyValueFields "key"
  @multipleValueField "multiple"
  @multipleValueField "multipleWithAllows", { "allows" : ["Hello", "World"] }
  @multipleValueOrTextField "multipleValueOrText"
  @rangeFields "range"

newSearch = -> new TestSearch()
value = "mail@example.com"

describe "AdvancedSearch", ->
  describe "equality field", ->
    it "supports is", ->
      search = newSearch()
      search.equality().is(value)
      assert.deepEqual(search.toHash(), { equality : { is : value }})

    it "supports isNot", ->
      search = newSearch()
      search.equality().isNot(value)
      assert.deepEqual(search.toHash(), { equality : { isNot : value }})

  describe "partial match field", ->
    it "inherits operators", ->
      search = newSearch()
      assert.isFunction(search.partialMatch().is)
      assert.isFunction(search.partialMatch().isNot)

    it "supports endsWith", ->
      search = newSearch()
      search.partialMatch().endsWith("example.com")
      assert.deepEqual(search.toHash(), { partialMatch : { endsWith: "example.com" }})

    it "supports startsWith", ->
      search = newSearch()
      search.partialMatch().startsWith("mail")
      assert.deepEqual(search.toHash(), { partialMatch : { startsWith: "mail" }})

  describe "text field", ->
    it "inherits operators", ->
      search = newSearch()
      assert.isFunction(search.text().is)
      assert.isFunction(search.text().isNot)
      assert.isFunction(search.text().endsWith)
      assert.isFunction(search.text().startsWith)

    it "supports contains", ->
      search = newSearch()
      search.text().contains("ample")
      assert.deepEqual(search.toHash(), { text : { contains: "ample" }})

  describe "key value field", ->
    it "supports is", ->
      search = newSearch()
      search.key().is(100)
      assert.deepEqual(search.toHash(), { key : 100 })

  describe "multiple value field", ->
    it "supports in", ->
      search = newSearch()
      search.multiple().in([1, 2, 3])
      assert.deepEqual(search.toHash(), { multiple: [1, 2, 3] })

    it "supports in with an allowed value", ->
      search = newSearch()
      assert.doesNotThrow((-> search.multipleWithAllows().in(["Hello"])), Error)

    it "supports in with an unallowed value", ->
      search = newSearch()
      assert.throws((-> search.multipleWithAllows().in(["Hello", "Bah"])), Error)

    it "supports is", ->
      search = newSearch()
      search.multiple().is(value)
      assert.deepEqual(search.toHash(), { multiple: [value] })

  describe "multiple value or text field", ->
    it "inherits operators", ->
      search = newSearch()
      assert.isFunction(search.multipleValueOrText().is)
      assert.isFunction(search.multipleValueOrText().isNot)
      assert.isFunction(search.multipleValueOrText().endsWith)
      assert.isFunction(search.multipleValueOrText().startsWith)
      assert.isFunction(search.multipleValueOrText().contains)
      assert.isFunction(search.multipleValueOrText().in)

    it "delegates is to TextNode", ->
      search = newSearch()
      search.multipleValueOrText().is(value)
      assert.deepEqual(search.toHash(), { multipleValueOrText: { is : value }})

  describe "range field", ->
    it "supports is", ->
      search = newSearch()
      search.range().is(value)
      assert.deepEqual(search.toHash(), { range : { is : value }})

    it "supports min", ->
      search = newSearch()
      search.range().min(50)
      assert.deepEqual(search.toHash(), { range : { min : 50 }})

    it "supports max", ->
      search = newSearch()
      search.range().max(100)
      assert.deepEqual(search.toHash(), { range : { max : 100 }})

    it "supports between", ->
      search = newSearch()
      search.range().between(50, 100)
      assert.deepEqual(search.toHash(), { range : { min : 50, max : 100 }})
