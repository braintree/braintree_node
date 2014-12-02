{Gateway} = require('./gateway')
{Plan} = require('./plan')

class PlanGateway extends Gateway
  constructor: (@gateway) ->

  all: (callback) ->
    @gateway.http.get("/plans", @createResponseHandler("plan", Plan, callback))

exports.PlanGateway = PlanGateway
