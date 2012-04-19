xml2js = require('xml2js')
{Digest} = require('./digest')
{Gateway} = require('./gateway')
{InvalidSignatureError} = require('./exceptions')
{Util} = require('./util')
{WebhookNotification} = require('./webhook_notification')

class WebhookNotificationGateway extends Gateway
  constructor: (@gateway) ->
    @parser = new xml2js.Parser
      explicitRoot: true

  parse: (signature, payload, callback) ->
    unless @validateSignature(signature, payload)
      callback(InvalidSignatureError(), null)
      return

    xmlPayload = new Buffer(payload, "base64").toString("utf8")
    @parser.parseString xmlPayload, (err, result) =>
      attributes = Util.convertNodeToObject(result)
      handler = @createResponseHandler "notification", WebhookNotification, (err, result) ->
        callback(null, result.notification)
      handler(null, attributes)

  validateSignature: (signature, payload) ->
    signaturePairs = (pair.split("|") for pair in signature.split("&") when pair.indexOf("|") isnt -1)
    Digest.secureCompare(@matchingSignature(signaturePairs), Digest.hexdigest(@gateway.config.privateKey, payload))

  verify: (challenge) ->
    digest = Digest.hexdigest(@gateway.config.privateKey, challenge)
    "#{@gateway.config.publicKey}|#{digest}"

  matchingSignature: (signaturePairs) ->
    for [publicKey, signature] in signaturePairs
      if @gateway.config.publicKey == publicKey
        return signature
    return null

exports.WebhookNotificationGateway = WebhookNotificationGateway
