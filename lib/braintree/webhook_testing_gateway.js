'use strict';

let Buffer = require('buffer').Buffer;
let Digest = require('./digest').Digest;
let Gateway = require('./gateway').Gateway;
let WebhookNotification = require('./webhook_notification').WebhookNotification;
let dateFormat = require('dateformat');

class WebhookTestingGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  sampleNotification(kind, id) {
    let payload = new Buffer(this.sampleXml(kind, id)).toString('base64') + '\n';
    let signature = `${this.gateway.config.publicKey}|${Digest.Sha1hexdigest(this.gateway.config.privateKey, payload)}`;

    return {
      bt_signature: signature, // eslint-disable-line camelcase
      bt_payload: payload // eslint-disable-line camelcase
    };
  }

  sampleXml(kind, id) {
    return `<notification>
    <timestamp type="datetime">${dateFormat(new Date(), dateFormat.masks.isoUtcDateTime, true)}</timestamp>
    <kind>${kind}</kind>
    <subject>${this.subjectXmlFor(kind, id)}</subject>
</notification>`;
  }

  subjectXmlFor(kind, id) {
    switch (kind) {
      case WebhookNotification.Kind.AccountUpdaterDailyReport: return this.subjectXmlForAccountUpdaterDailyReport();
      case WebhookNotification.Kind.Check: return this.subjectXmlForCheck();
      case WebhookNotification.Kind.TransactionDisbursed: return this.subjectXmlForTransactionDisbursed(id);
      case WebhookNotification.Kind.TransactionSettled: return this.subjectXmlForTransactionSettled(id);
      case WebhookNotification.Kind.TransactionSettlementDeclined: return this.subjectXmlForTransactionSettlementDeclined(id);
      case WebhookNotification.Kind.DisbursementException: return this.subjectXmlForDisbursementException(id);
      case WebhookNotification.Kind.Disbursement: return this.subjectXmlForDisbursement(id);
      case WebhookNotification.Kind.DisputeOpened: return this.subjectXmlForDisputeOpened(id);
      case WebhookNotification.Kind.DisputeLost: return this.subjectXmlForDisputeLost(id);
      case WebhookNotification.Kind.DisputeWon: return this.subjectXmlForDisputeWon(id);
      case WebhookNotification.Kind.SubMerchantAccountApproved: return this.subjectXmlForSubMerchantAccountApproved(id);
      case WebhookNotification.Kind.SubMerchantAccountDeclined: return this.subjectXmlForSubMerchantAccountDeclined(id);
      case WebhookNotification.Kind.PartnerMerchantConnected: return this.subjectXmlForPartnerMerchantConnected();
      case WebhookNotification.Kind.PartnerMerchantDisconnected: return this.subjectXmlForPartnerMerchantDisconnected();
      case WebhookNotification.Kind.PartnerMerchantDeclined: return this.subjectXmlForPartnerMerchantDeclined();
      case WebhookNotification.Kind.SubscriptionChargedSuccessfully: return this.subjectXmlForSubscriptionChargedSuccessfully(id);
      default: return this.subjectXmlForSubscription(id);
    }
  }

  subjectXmlForAccountUpdaterDailyReport() {
    return `<account-updater-daily-report>
  <report-date type="date">2016-01-14</report-date>
  <report-url>link-to-csv-report</report-url>
</account-updater-daily-report>`;
  }

  subjectXmlForCheck() {
    return '<check type="boolean">true</check>';
  }

  subjectXmlForTransactionDisbursed(id) {
    return `<transaction>
  <id>${id}</id>
  <amount>100</amount>
  <disbursement-details>
    <disbursement-date type="datetime">2013-07-09T18:23:29Z</disbursement-date>
  </disbursement-details>
</transaction>`;
  }

  subjectXmlForTransactionSettled(id) {
    return `<transaction>
  <id>${id}</id>
  <status>settled</status>
  <type>sale</type>
  <currency-iso-code>USD</currency-iso-code>
  <amount>100</amount>
  <merchant-account-id>ogaotkivejpfayqfeaimuktty</merchant-account-id>
  <payment-instrument-type>us_bank_account</payment-instrument-type>
  <us-bank-account>
    <routing-number>123456789</routing-number>
    <last-4>1234</last-4>
    <account-type>checking</account-type>
    <account-holder-name>Dan Schulman</account-holder-name>
  </us-bank-account>
</transaction>`;
  }

  subjectXmlForTransactionSettlementDeclined(id) {
    return `<transaction>
  <id>${id}</id>
  <status>settlement_declined</status>
  <type>sale</type>
  <currency-iso-code>USD</currency-iso-code>
  <amount>100</amount>
  <merchant-account-id>ogaotkivejpfayqfeaimuktty</merchant-account-id>
  <payment-instrument-type>us_bank_account</payment-instrument-type>
  <us-bank-account>
    <routing-number>123456789</routing-number>
    <last-4>1234</last-4>
    <account-type>checking</account-type>
    <account-holder-name>Dan Schulman</account-holder-name>
  </us-bank-account>
</transaction>`;
  }

  subjectXmlForDisputeOpened(id) {
    return `<dispute>
  <amount>250.00</amount>
  <currency-iso-code>USD</currency-iso-code>
  <received-date type="date">2014-03-01</received-date>
  <reply-by-date type="date">2014-03-21</reply-by-date>
  <kind>chargeback</kind>
  <status>open</status>
  <reason>fraud</reason>
  <id>${id}</id>
  <transaction>
    <id>${id}</id>
    <amount>250.00</amount>
  </transaction>
  <date-opened type="date">2014-03-28</date-opened>
</dispute>`;
  }

  subjectXmlForDisputeLost(id) {
    return `<dispute>
  <amount>250.00</amount>
  <currency-iso-code>USD</currency-iso-code>
  <received-date type="date">2014-03-01</received-date>
  <reply-by-date type="date">2014-03-21</reply-by-date>
  <kind>chargeback</kind>
  <status>lost</status>
  <reason>fraud</reason>
  <id>${id}</id>
  <transaction>
    <id>${id}</id>
    <amount>250.00</amount>
  </transaction>
  <date-opened type="date">2014-03-28</date-opened>
</dispute>`;
  }

  subjectXmlForDisputeWon(id) {
    return `<dispute>
  <amount>250.00</amount>
  <currency-iso-code>USD</currency-iso-code>
  <received-date type="date">2014-03-01</received-date>
  <reply-by-date type="date">2014-03-21</reply-by-date>
  <kind>chargeback</kind>
  <status>won</status>
  <reason>fraud</reason>
  <id>${id}</id>
  <transaction>
    <id>${id}</id>
    <amount>250.00</amount>
  </transaction>
  <date-opened type="date">2014-03-28</date-opened>
  <date-won type="date">2014-09-01</date-won>
</dispute>`;
  }

  subjectXmlForDisbursementException(id) {
    return `<disbursement>
  <id>${id}</id>
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
</disbursement>`;
  }

  subjectXmlForDisbursement(id) {
    return `<disbursement>
  <id>${id}</id>
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
</disbursement>`;
  }

  subjectXmlForSubMerchantAccountApproved(id) {
    return `<merchant_account>
  <id>${id}</id>
</merchant_account>`;
  }

  errorSampleXml() {
    return `<error>
  <code>82621</code>
  <message>Credit score is too low</message>
  <attribute type=\"symbol\">base</attribute>
</error>`;
  }

  subjectXmlForSubMerchantAccountDeclined(id) {
    return `<api-error-response>
  <message>Credit score is too low</message>
  <errors>
    <merchant-account>
      <errors type="array">
        ${this.errorSampleXml()}
      </errors>
    </merchant-account>
  </errors>
  ${this.merchantAccountSampleXml(id)}
</api-error-response>`;
  }

  merchantAccountSampleXml(id) {
    return `<merchant_account>
  <id>${id}</id>
  <master_merchant_account>
    <id>master_ma_for_${id}</id>
    <status>suspended</status>
  </master_merchant_account>
  <status>suspended</status>
</merchant_account>`;
  }

  subjectXmlForSubscription(id) {
    return `<subscription>
    <id>${id}</id>
    <transactions type="array"></transactions>
    <add_ons type="array"></add_ons>
    <discounts type="array"></discounts>
</subscription>`;
  }

  subjectXmlForSubscriptionChargedSuccessfully(id) {
    return `<subscription>
    <id>${id}</id>
    <transactions type="array">
      <transaction>
        <status>submitted_for_settlement</status>
        <amount>49.99</amount>
      </transaction>
    </transactions>
    <add_ons type="array"></add_ons>
    <discounts type="array"></discounts>
</subscription>`;
  }

  subjectXmlForPartnerMerchantConnected() {
    return `<partner-merchant>
  <merchant-public-id>public_id</merchant-public-id>
  <public-key>public_key</public-key>
  <private-key>private_key</private-key>
  <partner-merchant-id>abc123</partner-merchant-id>
  <client-side-encryption-key>cse_key</client-side-encryption-key>
</partner-merchant>`;
  }

  subjectXmlForPartnerMerchantDisconnected() {
    return `<partner-merchant>
  <partner-merchant-id>abc123</partner-merchant-id>
</partner-merchant>`;
  }

  subjectXmlForPartnerMerchantDeclined() {
    return `<partner-merchant>
  <partner-merchant-id>abc123</partner-merchant-id>
</partner-merchant>`;
  }
}

module.exports = {WebhookTestingGateway: WebhookTestingGateway};
