Util = {
  convertObjectKeysToUnderscores: (obj) ->
    newObj = {}
    for key, value of obj
      if typeof(value) is 'object'
        newObj[Util.toUnderscore(key)] = Util.convertObjectKeysToUnderscores(value)
      else
        newObj[Util.toUnderscore(key)] = value
    newObj

  toCamelCase: (string) ->
    string.replace(/(\-[a-z0-9])/g, (match) -> match.toUpperCase().replace('-',''))

  toUnderscore: (string) ->
    string.replace(/([A-Z])/g, (match) -> "_" + match.toLowerCase())
}

exports.Util = Util
