{Buffer} = require('buffer')
{Digest} = require('./digest')
{Gateway} = require('./gateway')
{WebhookNotification} = require('./webhook_notification')
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
        <subject>#{@subjectXmlFor(kind, id)}</subject>
    </notification>
    """

  subjectXmlFor: (kind, id) ->
    switch kind
      when WebhookNotification.Kind.MerchantAccountApproved then @subjectXmlForMerchantAccountApproved(id)
      when WebhookNotification.Kind.MerchantAccountDeclined then @subjectXmlForMerchantAccountDeclined(id)
      else @subjectXmlForSubscription(id)

  subjectXmlForMerchantAccountApproved: (id) ->
    """
    <merchant_account>
      <id>#{id}</id>
    </merchant_account>
    """

  errorSampleXml: (error) ->
    """
    <error>
      <code>82609</code>
      <message>Credit score is too low</message>
      <attribute type=\"symbol\">base</attribute>
    </error>
    """

  subjectXmlForMerchantAccountDeclined: (id) ->
    """
    <api-error-response>
      <message>Credit score is too low</message>
      <errors>
        <merchant-account>
          <errors type="array">
            #{@errorSampleXml()}
          </errors>
        </merchant-account>
      </errors>
      #{@merchantAccountSampleXml(id)}
    </api-error-response>
    """

  merchantAccountSampleXml: (id) ->
    """
    <merchant_account>
      <id>#{id}</id>
      <master_merchant_account>
        <id>master_ma_for_#{id}</id>
        <status>suspended</status>
      </master_merchant_account>
      <status>suspended</status>
    </merchant_account>
    """

  subjectXmlForSubscription: (id) ->
    """
    <subscription>
        <id>#{id}</id>
        <transactions type="array"></transactions>
        <add_ons type="array"></add_ons>
        <discounts type="array"></discounts>
    </subscription>
    """

exports.WebhookTestingGateway = WebhookTestingGateway
