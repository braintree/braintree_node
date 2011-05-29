Util = {
  convertObjectKeysToUnderscores: (obj) ->
    newObj = {}
    for key, value of obj
      if value instanceof Array
        newObj[Util.toUnderscore(key)] = (
          (if typeof(item) is 'object' then Util.convertObjectKeysToUnderscores(item) else item) for item in value
        )
      else if typeof(value) is 'object'
        newObj[Util.toUnderscore(key)] = Util.convertObjectKeysToUnderscores(value)
      else
        newObj[Util.toUnderscore(key)] = value
    newObj

  toCamelCase: (string) ->
    string.replace(/([\-\_][a-z0-9])/g, (match) -> match.toUpperCase().replace('-','').replace('_',''))

  toUnderscore: (string) ->
    string.replace(/([A-Z])/g, (match) -> "_" + match.toLowerCase())
}

exports.Util = Util
