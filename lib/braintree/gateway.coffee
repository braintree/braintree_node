{Http} = require('./http')

Gateway = (config) ->
  {
    config: config,
    http: Http(config)
  }

exports.Gateway = Gateway
