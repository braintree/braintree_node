{Http} = require('./http')

class Gateway
  constructor: (@config) ->
    @http = new Http(@config)

exports.Gateway = Gateway
