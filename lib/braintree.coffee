sys = require "sys"
{Config} = require("./braintree/config")
{Environment} = require("./braintree/environment")
{Gateway} = require("./braintree/gateway")
errorTypes = require("./braintree/error_types")

connect = (config) ->
  new Gateway(new Config(config))

exports.connect = connect
exports.version = '0.2.0'
exports.Environment = Environment
exports.errorTypes = errorTypes
