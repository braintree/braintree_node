'use strict';

let Buffer = require('buffer').Buffer;
let Digest = require('./digest').Digest;
let Gateway = require('./gateway').Gateway;
let WebhookNotification = require('./webhook_notification').WebhookNotification;
let dateFormat = require('dateformat');
let wrapPrototype = require('@braintree/wrap-promise').wrapPrototype;

class WebhookTestingGateway extends Gateway {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.config = this.gateway.config;
  }

  sampleNotification(kind, id, sourceMerchantId) {
    const xml = this.sampleXml(kind, id, sourceMerchantId);
    const payload = Buffer.from(xml).toString('base64') + '\n';
    const signature = this.sampleSignature(payload);

    return {
      bt_signature: signature, // eslint-disable-line camelcase
      bt_payload: payload // eslint-disable-line camelcase
    };
  }

  sampleSignature(payload) {
    return `${this.gateway.config.publicKey}|${Digest.Sha1hexdigest(this.gateway.config.privateKey, payload)}`;
  }

  sampleXml(kind, id, sourceMerchantId) {
    let sourceMerchantIdXml = '';

    if (sourceMerchantId) {
      sourceMerchantIdXml = `<source-merchant-id>${sourceMerchantId}</source-merchant-id>`;
    }

    return `<notification>
    <timestamp type="datetime">${dateFormat(new Date(), dateFormat.masks.isoUtcDateTime, true)}</timestamp>
    <kind>${kind}</kind>
    ${sourceMerchantIdXml}
    <subject>${this.subjectXmlFor(kind, id)}</subject>
</notification>`;
  }

  subjectXmlFor(kind, id) { // eslint-disable-line complexity
    switch (kind) {
      case WebhookNotification.Kind.AccountUpdaterDailyReport: return this.subjectXmlForAccountUpdaterDailyReport();
      case WebhookNotification.Kind.Check: return this.subjectXmlForCheck();
      case WebhookNotification.Kind.ConnectedMerchantPayPalStatusChanged: return this.subjectXmlForConnectedMerchantPayPalStatusChanged(id);
      case WebhookNotification.Kind.ConnectedMerchantStatusTransitioned: return this.subjectXmlForConnectedMerchantStatusTransitioned(id);
      case WebhookNotification.Kind.TransactionDisbursed: return this.subjectXmlForTransactionDisbursed(id);
      case WebhookNotification.Kind.TransactionSettled: return this.subjectXmlForTransactionSettled(id);
      case WebhookNotification.Kind.TransactionSettlementDeclined: return this.subjectXmlForTransactionSettlementDeclined(id);
      case WebhookNotification.Kind.DisbursementException: return this.subjectXmlForDisbursementException(id);
      case WebhookNotification.Kind.Disbursement: return this.subjectXmlForDisbursement(id);
      case WebhookNotification.Kind.DisputeOpened: return this.subjectXmlForDisputeOpened(id);
      case WebhookNotification.Kind.DisputeLost: return this.subjectXmlForDisputeLost(id);
      case WebhookNotification.Kind.DisputeWon: return this.subjectXmlForDisputeWon(id);
      case WebhookNotification.Kind.DisputeAccepted: return this.subjectXmlForDisputeAccepted(id);
      case WebhookNotification.Kind.DisputeDisputed: return this.subjectXmlForDisputeDisputed(id);
      case WebhookNotification.Kind.DisputeExpired: return this.subjectXmlForDisputeExpired(id);
      case WebhookNotification.Kind.GrantorUpdatedGrantedPaymentMethod: return this.subjectXmlForGrantedPaymentInstrumentUpdate();
      case WebhookNotification.Kind.LocalPaymentCompleted: return this.subjectXmlForLocalPaymentCompleted(id);
      case WebhookNotification.Kind.LocalPaymentReversed: return this.subjectXmlForLocalPaymentReversed(id);
      case WebhookNotification.Kind.PaymentMethodRevokedByCustomer: return this.subjectXmlForPaymentMethodRevokedByCustomer(id);
      case WebhookNotification.Kind.RecipientUpdatedGrantedPaymentMethod: return this.subjectXmlForGrantedPaymentInstrumentUpdate();
      case WebhookNotification.Kind.SubMerchantAccountApproved: return this.subjectXmlForSubMerchantAccountApproved(id);
      case WebhookNotification.Kind.SubMerchantAccountDeclined: return this.subjectXmlForSubMerchantAccountDeclined(id);
      case WebhookNotification.Kind.PartnerMerchantConnected: return this.subjectXmlForPartnerMerchantConnected();
      case WebhookNotification.Kind.PartnerMerchantDisconnected: return this.subjectXmlForPartnerMerchantDisconnected();
      case WebhookNotification.Kind.PartnerMerchantDeclined: return this.subjectXmlForPartnerMerchantDeclined();
      case WebhookNotification.Kind.OAuthAccessRevoked: return this.subjectXmlForOAuthAccessRevocation(id);
      case WebhookNotification.Kind.SubscriptionChargedSuccessfully: return this.subjectXmlForSubscriptionChargedSuccessfully(id);
      case WebhookNotification.Kind.SubscriptionChargedUnsuccessfully: return this.subjectXmlForSubscriptionChargedUnsuccessfully(id);
      case WebhookNotification.Kind.GrantedPaymentMethodRevoked: return this.subjectXmlForGrantedPaymentMethodRevoked(id);
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
  <amount-disputed>250.0</amount-disputed>
  <amount-won>245.00</amount-won>
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
  <amount-disputed>250.0</amount-disputed>
  <amount-won>245.00</amount-won>
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
  <amount-disputed>250.0</amount-disputed>
  <amount-won>245.00</amount-won>
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

  subjectXmlForDisputeAccepted(id) {
    return `<dispute>
  <amount>250.00</amount>
  <amount-disputed>250.0</amount-disputed>
  <amount-won>245.00</amount-won>
  <currency-iso-code>USD</currency-iso-code>
  <received-date type="date">2014-03-01</received-date>
  <reply-by-date type="date">2014-03-21</reply-by-date>
  <kind>chargeback</kind>
  <status>accepted</status>
  <reason>fraud</reason>
  <id>${id}</id>
  <transaction>
    <id>${id}</id>
    <amount>250.00</amount>
  </transaction>
  <date-opened type="date">2014-03-28</date-opened>
</dispute>`;
  }

  subjectXmlForDisputeDisputed(id) {
    return `<dispute>
  <amount>250.00</amount>
  <amount-disputed>250.0</amount-disputed>
  <amount-won>245.00</amount-won>
  <currency-iso-code>USD</currency-iso-code>
  <received-date type="date">2014-03-01</received-date>
  <reply-by-date type="date">2014-03-21</reply-by-date>
  <kind>chargeback</kind>
  <status>disputed</status>
  <reason>fraud</reason>
  <id>${id}</id>
  <transaction>
    <id>${id}</id>
    <amount>250.00</amount>
  </transaction>
  <date-opened type="date">2014-03-28</date-opened>
</dispute>`;
  }

  subjectXmlForDisputeExpired(id) {
    return `<dispute>
  <amount>250.00</amount>
  <amount-disputed>250.0</amount-disputed>
  <amount-won>245.00</amount-won>
  <currency-iso-code>USD</currency-iso-code>
  <received-date type="date">2014-03-01</received-date>
  <reply-by-date type="date">2014-03-21</reply-by-date>
  <kind>chargeback</kind>
  <status>expired</status>
  <reason>fraud</reason>
  <id>${id}</id>
  <transaction>
    <id>${id}</id>
    <amount>250.00</amount>
  </transaction>
  <date-opened type="date">2014-03-28</date-opened>
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

  subjectXmlForGrantedPaymentInstrumentUpdate() {
    return `<granted-payment-instrument-update>
    <grant-owner-merchant-id>vczo7jqrpwrsi2px</grant-owner-merchant-id>
    <grant-recipient-merchant-id>cf0i8wgarszuy6hc</grant-recipient-merchant-id>
    <payment-method-nonce>
      <nonce>ee257d98-de40-47e8-96b3-a6954ea7a9a4</nonce>
      <consumed type="boolean">false</consumed>
      <locked type="boolean">false</locked>
    </payment-method-nonce>
    <token>abc123z</token>
    <updated-fields type="array">
      <item>expiration-month</item>
      <item>expiration-year</item>
    </updated-fields>
  </granted-payment-instrument-update>`;
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
        <id>${id}</id>
        <status>submitted_for_settlement</status>
        <amount>49.99</amount>
      </transaction>
    </transactions>
    <add_ons type="array"></add_ons>
    <discounts type="array"></discounts>
</subscription>`;
  }

  subjectXmlForSubscriptionChargedUnsuccessfully(id) {
    return `<subscription>
    <id>${id}</id>
    <transactions type="array">
      <transaction>
        <id>${id}</id>
        <status>failed</status>
        <amount>49.99</amount>
      </transaction>
    </transactions>
    <add_ons type="array"></add_ons>
    <discounts type="array"></discounts>
</subscription>`;
  }

  subjectXmlForGrantedPaymentMethodRevoked(id) {
    return `<venmo-account>
    <default type="boolean">true</default>
    <image-url>https://assets.braintreegateway.com/payment_method_logo/venmo.png?environment=test</image-url>
    <token>${id}</token>
    <source-description>Venmo Account: venmojoe</source-description>
    <username>venmojoe</username>
    <venmo-user-id>456</venmo-user-id>
    <subscriptions type="array"/>
    <customer-id>venmo_customer_id</customer-id>
    <global-id>cGF5bWVudG1ldGhvZF92ZW5tb2FjY291bnQ</global-id>
</venmo-account>`;
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

  subjectXmlForConnectedMerchantStatusTransitioned(id) {
    return `<connected-merchant-status-transitioned>
        <merchant-public-id>${id}</merchant-public-id>
        <status>new_status</status>
        <oauth-application-client-id>oauth_application_client_id</oauth-application-client-id>
      </connected-merchant-status-transitioned>`;
  }

  subjectXmlForConnectedMerchantPayPalStatusChanged(id) {
    return `<connected-merchant-paypal-status-changed>
        <merchant-public-id>${id}</merchant-public-id>
        <action>link</action>
        <oauth-application-client-id>oauth_application_client_id</oauth-application-client-id>
      </connected-merchant-paypal-status-changed>`;
  }

  subjectXmlForPartnerMerchantDeclined() {
    return `<partner-merchant>
  <partner-merchant-id>abc123</partner-merchant-id>
</partner-merchant>`;
  }

  subjectXmlForOAuthAccessRevocation(id) {
    return `<oauth-application-revocation>
      <merchant-id>${id}</merchant-id>
      <oauth-application-client-id>oauth_application_client_id</oauth-application-client-id>
    </oauth-application-revocation>`;
  }

  subjectXmlForPaymentMethodRevokedByCustomer(id) {
    return `<paypal-account>
      <billing-agreement-id>a-billing-agreement-id</billing-agreement-id>
      <created-at type="datetime">2019-01-01T12:00:00Z</created-at>
      <customer-id>a-customer-id</customer-id>
      <default type="boolean">true</default>
      <email>name@email.com</email>
      <global-id>cGF5bWVudG1ldGhvZF9jaDZieXNz</global-id>
      <image-url>https://assets.braintreegateway.com/payment_method_logo/paypal.png?environment=test</image-url>
      <subscriptions type="array"/>
      <token>${id}</token>
      <updated-at type="datetime">2019-01-02T12:00:00Z</updated-at>
      <is-channel-initiated nil="true"/>
      <payer-id>a-payer-id</payer-id>
      <payer-info nil="true"/>
      <limited-use-order-id nil="true"/>
      <revoked-at type="datetime">2019-01-02T12:00:00Z</revoked-at>
    </paypal-account>`;
  }

  subjectXmlForLocalPaymentCompleted() {
    return `<local-payment>
      <payment-id>a-payment-id</payment-id>
      <payer-id>a-payer-id</payer-id>
      <payment-method-nonce>ee257d98-de40-47e8-96b3-a6954ea7a9a4</payment-method-nonce>
      <transaction>
        <id>1</id>
        <status>authorizing</status>
        <amount>10.00</amount>
        <order-id>order1234</order-id>
      </transaction>
    </local-payment>`;
  }

  subjectXmlForLocalPaymentReversed() {
    return `<local-payment-reversed>
      <payment-id>a-payment-id</payment-id>
    </local-payment-reversed>`;
  }
}

module.exports = {WebhookTestingGateway: wrapPrototype(WebhookTestingGateway)};
