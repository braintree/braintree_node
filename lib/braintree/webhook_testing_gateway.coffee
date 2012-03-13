{Buffer} = require('buffer')
{Digest} = require('./digest')
{Gateway} = require('./gateway')
dateFormat = require('dateformat')

class WebhookTestingGateway extends Gateway
  constructor: (@gateway) ->

  sampleNotification: (kind, id) ->
    payload = new Buffer(@sampleXml(kind, id)).toString("base64")
    signature = "#{@gateway.config.publicKey}|#{Digest.hexdigest(@gateway.config.privateKey, payload)}"
    {
      signature: signature,
      payload: payload
    }

  sampleXml: (kind, id) ->
    """
    <notification>
        <timestamp type="datetime">#{dateFormat(new Date(), dateFormat.masks.isoUtcDateTime, true)}</timestamp>
        <kind>#{kind}</kind>
        <subject>#{@subscriptionSampleXml(id)}</subject>
    </notification>
    """

  subscriptionSampleXml: (id) ->
    """
    <subscription>
        <id>#{id}</id>
        <transactions type="array"></transactions>
        <add_ons type="array"></add_ons>
        <discounts type="array"></discounts>
    </subscription>
    """

exports.WebhookTestingGateway = WebhookTestingGateway
