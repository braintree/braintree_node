{Gateway} = require('./gateway')
{Plan} = require('./plan')

class PlanGateway extends Gateway
  constructor: (@gateway) ->
    @config = @gateway.config

  all: (callback) ->
    @gateway.http.get("#{@config.baseMerchantPath}/plans", @createResponseHandler("plan", Plan, callback))

exports.PlanGateway = PlanGateway
