{Buffer} = require('buffer')
{Digest} = require('./digest')
{Gateway} = require('./gateway')
{WebhookNotification} = require('./webhook_notification')
dateFormat = require('dateformat')

class WebhookTestingGateway extends Gateway
  constructor: (@gateway) ->

  sampleNotification: (kind, id) ->
    payload = new Buffer(@sampleXml(kind, id)).toString("base64")
    signature = "#{@gateway.config.publicKey}|#{Digest.Sha1hexdigest(@gateway.config.privateKey, payload)}"
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
      when WebhookNotification.Kind.DisbursementException then @subjectXmlForDisbursementException(id)
      when WebhookNotification.Kind.Disbursement then @subjectXmlForDisbursement(id)
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

  subjectXmlForDisbursementException: (id) ->
    """
    <disbursement>
      <id>#{id}</id>
      <transaction-ids type="array">
        <item>afv56j</item>
        <item>kj8hjk</item>
      </transaction-ids>
      <success type="boolean">false</success>
      <retry type="boolean">false</retry>
      <merchant-account>
        <id>merchant_account_token</id>
        <currency-iso-code>USD</currency-iso-code>
        <sub-merchant-account type="boolean">false</sub-merchant-account>
        <status>active</status>
      </merchant-account>
      <amount>100.00</amount>
      <disbursement-date type="date">2014-02-10</disbursement-date>
      <exception-message>bank_rejected</exception-message>
      <follow-up-action>update_funding_information</follow-up-action>
    </disbursement>
    """

  subjectXmlForDisbursement: (id) ->
    """
    <disbursement>
      <id>#{id}</id>
      <transaction-ids type="array">
        <item>afv56j</item>
        <item>kj8hjk</item>
      </transaction-ids>
      <success type="boolean">true</success>
      <retry type="boolean">false</retry>
      <merchant-account>
        <id>merchant_account_token</id>
        <currency-iso-code>USD</currency-iso-code>
        <sub-merchant-account type="boolean">false</sub-merchant-account>
        <status>active</status>
      </merchant-account>
      <amount>100.00</amount>
      <disbursement-date type="date">2014-02-10</disbursement-date>
      <exception-message nil="true"/>
      <follow-up-action nil="true"/>
    </disbursement>
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
        <partner-merchant>
          <merchant-public-id>public_id</merchant-public-id>
          <public-key>public_key</public-key>
          <private-key>private_key</private-key>
          <partner-merchant-id>abc123</partner-merchant-id>
          <client-side-encryption-key>cse_key</client-side-encryption-key>
        </partner-merchant>
    """

  subjectXmlForPartnerMerchantDisconnected: () ->
    """
        <partner-merchant>
          <partner-merchant-id>abc123</partner-merchant-id>
        </partner-merchant>
    """

  subjectXmlForPartnerMerchantDeclined: () ->
    """
        <partner-merchant>
          <partner-merchant-id>abc123</partner-merchant-id>
        </partner-merchant>
    """

exports.WebhookTestingGateway = WebhookTestingGateway
