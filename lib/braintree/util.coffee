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
        if value instanceof Date
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
      else if obj['@'].nil is 'true'
        null
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

  @toCamelCase: (string) ->

    string.replace(/([\-\_][a-z0-9])/g, (match) -> match.toUpperCase().replace('-','').replace('_',''))

  @toUnderscore: (string) ->
    string.replace(/([A-Z])/g, (match) -> "_" + match.toLowerCase())

exports.Util = Util
