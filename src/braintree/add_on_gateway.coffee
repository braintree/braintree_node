{AddOn} = require('./add_on')
{Gateway} = require('./gateway')

class AddOnGateway extends Gateway
  constructor: (@gateway) ->
    @config = @gateway.config

  all: (callback) ->
    @gateway.http.get("#{@config.baseMerchantPath()}/add_ons", @createResponseHandler("add_on", AddOn, callback))

exports.AddOnGateway = AddOnGateway
