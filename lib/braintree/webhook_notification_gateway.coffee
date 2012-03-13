xml2js = require('xml2js')
{Digest} = require('./digest')
{Gateway} = require('./gateway')
{WebhookNotification} = require('./webhook_notification')
{Util} = require('./util')

class WebhookNotificationGateway extends Gateway
  constructor: (@gateway) ->
    @parser = new xml2js.Parser
      explicitRoot: true

  parse: (signature, payload, callback) ->
    xmlPayload = new Buffer(payload, "base64").toString("utf8")
    @parser.parseString xmlPayload, (err, result) =>
      attributes = Util.convertNodeToObject(result)
      handler = @createResponseHandler "notification", WebhookNotification, (err, result) ->
        callback(null, result.notification)
      handler(null, attributes)

  verify: (challenge) ->
    digest = Digest.hexdigest(@gateway.config.privateKey, challenge)
    "#{@gateway.config.publicKey}|#{digest}"

exports.WebhookNotificationGateway = WebhookNotificationGateway
