Http = require('./http').Http

Gateway = (config) ->
  {
    config: config,
    http: Http(config)
  }

exports.Gateway = Gateway
