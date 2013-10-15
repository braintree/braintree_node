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
      when WebhookNotification.Kind.TransactionDisbursed then @subjectXmlForTransactionDisbursed(id)
      when WebhookNotification.Kind.SubMerchantAccountApproved then @subjectXmlForSubMerchantAccountApproved(id)
      when WebhookNotification.Kind.SubMerchantAccountDeclined then @subjectXmlForSubMerchantAccountDeclined(id)
      when WebhookNotification.Kind.PartnerMerchantConnected then @subjectXmlForPartnerMerchantConnected()
      when WebhookNotification.Kind.PartnerMerchantDisconnected then @subjectXmlForPartnerMerchantDisconnected()
      when WebhookNotification.Kind.PartnerMerchantDeclined then @subjectXmlForPartnerMerchantDeclined()
      else @subjectXmlForSubscription(id)

  subjectXmlForTransactionDisbursed: (id) ->
    """
    <transaction>
      <id>#{id}</id>
      <amount>100</amount>
      <disbursement-details>
        <disbursement-date type="datetime">2013-07-09T18:23:29Z</disbursement-date>
      </disbursement-details>
    </transaction>
    """

  subjectXmlForSubMerchantAccountApproved: (id) ->
    """
    <merchant_account>
      <id>#{id}</id>
    </merchant_account>
    """

  errorSampleXml: (error) ->
    """
    <error>
      <code>82621</code>
      <message>Credit score is too low</message>
      <attribute type=\"symbol\">base</attribute>
    </error>
    """

  subjectXmlForSubMerchantAccountDeclined: (id) ->
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

  subjectXmlForPartnerMerchantConnected: () ->
    """
        <partner_merchant>
          <merchant_public_id>public_id</merchant_public_id>
          <public_key>public_key</public_key>
          <private_key>private_key</private_key>
          <partner_merchant_id>abc123</partner_merchant_id>
          <client_side_encryption_key>cse_key</partner_merchant_id>
        </partner_merchant>
    """

  subjectXmlForPartnerMerchantDisconnected: () ->
    """
        <partner_merchant>
          <partner_merchant_id>abc123</partner_merchant_id>
        </partner_merchant>
    """

  subjectXmlForPartnerMerchantDeclined: () ->
    """
        <partner_merchant>
          <partner_merchant_id>abc123</partner_merchant_id>
        </partner_merchant>
    """

exports.WebhookTestingGateway = WebhookTestingGateway
