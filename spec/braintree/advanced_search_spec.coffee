require("../spec_helper.coffee")
{AdvancedSearch} = require('../../lib/braintree/advanced_search.coffee')

class TestSearch extends AdvancedSearch
  @equalityFields "equality"
  @partialMatchFields "partialMatch"
  @textFields "text"
  @keyValueFields "key"
  @multipleValueField "multiple"
  @multipleValueField "multipleWithAllows", { "allows" : ["Hello", "World"] }
  @multipleValueOrTextField "multipleValueOrText"

newSearch = -> new TestSearch()
value = "mail@example.com"

vows
  .describe("AdvancedSearch")
  .addBatch
    'equality field':
      'is': ->
        search = newSearch()
        search.equality().is(value)
        assert.deepEqual(search.toHash(), { equality : { is : value }})
      'isNot': ->
        search = newSearch()
        search.equality().isNot(value)
        assert.deepEqual(search.toHash(), { equality : { isNot : value }})

    'partial match field':
      'inherited operators': ->
        search = newSearch()
        assert.isFunction(search.partialMatch().is)
        assert.isFunction(search.partialMatch().isNot)
      'endsWith': ->
        search = newSearch()
        search.partialMatch().endsWith("example.com")
        assert.deepEqual(search.toHash(), { partialMatch : { endsWith: "example.com" }})
      'startsWith': ->
        search = newSearch()
        search.partialMatch().startsWith("mail")
        assert.deepEqual(search.toHash(), { partialMatch : { startsWith: "mail" }})

    'text field':
      'inherited operators': ->
        search = newSearch()
        assert.isFunction(search.text().is)
        assert.isFunction(search.text().isNot)
        assert.isFunction(search.text().endsWith)
        assert.isFunction(search.text().startsWith)
      'contains': ->
        search = newSearch()
        search.text().contains("ample")
        assert.deepEqual(search.toHash(), { text : { contains: "ample" }})

    'key value field':
      'is': ->
        search = newSearch()
        search.key().is(100)
        assert.deepEqual(search.toHash(), { key : 100 })

    'multiple value field':
      'in': ->
        search = newSearch()
        search.multiple().in([1, 2, 3])
        assert.deepEqual(search.toHash(), { multiple: [1, 2, 3] })
      'in with an allowed value': ->
        search = newSearch()
        assert.doesNotThrow((=> search.multipleWithAllows().in(["Hello"])), Error)
      'in with an unallowed value': ->
        search = newSearch()
        assert.throws((=> search.multipleWithAllows().in(["Hello", "Bah"])), Error)
      'is': ->
        search = newSearch()
        search.multiple().is(value)
        assert.deepEqual(search.toHash(), { multiple: [value] })

    'multiple value of text field':
      'inherited operators': ->
        search = newSearch()
        assert.isFunction(search.multipleValueOrText().is)
        assert.isFunction(search.multipleValueOrText().isNot)
        assert.isFunction(search.multipleValueOrText().endsWith)
        assert.isFunction(search.multipleValueOrText().startsWith)
        assert.isFunction(search.multipleValueOrText().contains)
        assert.isFunction(search.multipleValueOrText().in)

  .export(module)

