xml2js = require('xml2js')
_ = require('underscore')
{Digest} = require('./digest')
{Gateway} = require('./gateway')
{InvalidSignatureError} = require('./exceptions')
{InvalidChallengeError} = require('./exceptions')
{Util} = require('./util')
{WebhookNotification} = require('./webhook_notification')

class WebhookNotificationGateway extends Gateway
  constructor: (@gateway) ->
    @config = @gateway.config
    @parser = new xml2js.Parser
      explicitRoot: true
      explicitArray: false
      attrkey: '@'
      charkey: '#'

  parse: (signature, payload, callback) ->
    if payload.match(/[^A-Za-z0-9+=\/\n]/)
      callback(InvalidSignatureError("payload contains illegal characters"), null)
      return
    err = @validateSignature(signature, payload)
    return callback(err, null) if err

    xmlPayload = new Buffer(payload, "base64").toString("utf8")
    @parser.parseString xmlPayload, (err, result) =>
      attributes = Util.convertNodeToObject(result)
      handler = @createResponseHandler "notification", WebhookNotification, (err, result) ->
        callback(null, result.notification)
      handler(null, attributes)

  validateSignature: (signatureString, payload) ->
    signaturePairs = (pair.split("|") for pair in signatureString.split("&") when pair.indexOf("|") isnt -1)
    signature = @matchingSignature(signaturePairs)
    unless signature
      return InvalidSignatureError("no matching public key")

    self = @
    matches = _.some([payload, payload + '\n'], (payload) ->
      Digest.secureCompare(signature, Digest.Sha1hexdigest(self.gateway.config.privateKey, payload))
    )
    unless matches
      return InvalidSignatureError("signature does not match payload - one has been modified")
    null

  verify: (challenge, callback) ->
    unless challenge.match(/^[a-f0-9]{20,32}$/)
      if callback?
        callback(InvalidChallengeError("challenge contains non-hex characters"), null)
        return
      else
        throw new InvalidChallengeError("challenge contains non-hex characters")
    digest = Digest.Sha1hexdigest(@gateway.config.privateKey, challenge)
    "#{@gateway.config.publicKey}|#{digest}"

  matchingSignature: (signaturePairs) ->
    for [publicKey, signature] in signaturePairs
      if @gateway.config.publicKey == publicKey
        return signature
    return null

exports.WebhookNotificationGateway = WebhookNotificationGateway
