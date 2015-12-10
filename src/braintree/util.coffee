semver = require('semver')

class Util
  @convertObjectKeysToUnderscores: (obj) ->
    newObj = {}
    for key, value of obj
      newKey = Util.toUnderscore(key)
      if value instanceof Array
        newObj[newKey] = (
          (if typeof(item) is 'object' then Util.convertObjectKeysToUnderscores(item) else item) for item in value
        )
      else if typeof(value) is 'object'
        if value instanceof Date || value is null
          newObj[newKey] = value
        else
          newObj[newKey] = Util.convertObjectKeysToUnderscores(value)
      else
        newObj[newKey] = value
    newObj

  @convertNodeToObject: (obj) ->
    if typeof(obj) is 'object' and obj['@']
      if obj['@'].type is 'array'
        newArray = []
        for key, value of obj when key isnt '@'
          if value instanceof Array
            for item in value
              newArray.push(@convertNodeToObject(item))
          else
            newArray.push(@convertNodeToObject(value))
        newArray
      else if obj['@'].type is 'collection'
        newObj = {}
        for key, value of obj when key isnt '@'
          newObj[@toCamelCase(key)] = @convertNodeToObject(value)
        newObj
      else if obj['@'].nil is 'true'
        null
      else if obj['@'].type is 'integer'
        parseInt(obj['#'])
      else if obj['@'].type is 'boolean'
        obj['#'] is 'true'
      else
        obj['#']
    else if obj instanceof Array
      @convertNodeToObject(item) for item in obj
    else if typeof(obj) is 'object' and @objectIsEmpty(obj)
      ''
    else if typeof(obj) is 'object'
      newObj = {}
      for key, value of obj
        newObj[@toCamelCase(key)] = @convertNodeToObject(value)
      newObj
    else
      obj

  @objectIsEmpty: (obj) ->
    return false for key, value of obj
    return true

  @arrayIsEmpty: (array) ->
    return false unless array instanceof Array
    return false if array.length > 0
    return true

  @toCamelCase: (string) ->
    string.replace(/([\-\_][a-z0-9])/g, (match) -> match.toUpperCase().replace('-','').replace('_',''))

  @toUnderscore: (string) ->
    string.replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()

  @flatten: (array) ->
    while @_containsArray(array)
      array = array.reduce (first, rest) =>
        first = if first instanceof Array then first else [first]
        rest  = if rest instanceof Array then @flatten(rest) else rest
        first.concat rest
    array

  @merge: (obj1, obj2) ->
    for key, value of obj2
      obj1[key] = value
    obj1

  @without: (array1, array2) ->
    newArray = []
    for value in array1
      newArray.push(value) unless @_containsValue(array2, value)
    newArray

  @supportsStreams2: ->
    semver.satisfies(process.version, '>=0.10')

  @flattenKeys: (obj, prefix=null) ->
    keys = []
    for key, value of obj
      if typeof value is 'object'
        keys.push(Util.flattenKeys value, key)
      else
        if prefix
          keys.push(prefix + "[" + key + "]")
        else
          keys.push(key)

    @flatten(keys)

  @verifyKeys: (validKeys, obj, deprecate) ->
    invalidKeys = @without(@flattenKeys(obj), validKeys)
    deprecate("invalid keys: " + invalidKeys.join(", ") + ". In future releases we'll throw exceptions on keys we do not recognize. It is recommended to fix this now to avoid payment processing interruptions.") if invalidKeys.length > 0

  @_containsValue: (array, element) ->
    array.indexOf(element) isnt -1

  @_containsArray: (array) ->
    for element in array
      return true if element instanceof Array

exports.Util = Util
