{Discount} = require('./discount')
{Gateway} = require('./gateway')

class DiscountGateway extends Gateway
  constructor: (@gateway) ->
    @config = @gateway.config

  all: (callback) ->
    @gateway.http.get("#{@config.baseMerchantPath()}/discounts", @createResponseHandler("discount", Discount, callback))

exports.DiscountGateway = DiscountGateway
