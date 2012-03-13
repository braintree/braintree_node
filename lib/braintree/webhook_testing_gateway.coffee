{Buffer} = require('buffer')
{Gateway} = require('./gateway')

class WebhookTestingGateway extends Gateway
  constructor: (@gateway) ->

  sampleNotification: (kind, id) ->
    sampleXml = @sampleXml(kind, id)
    {
      signature: "sig",
      payload: new Buffer(sampleXml).toString("base64")
    }

  sampleXml: (kind, id) ->
    """
    <notification>
        <timestamp type="datetime"></timestamp>
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
