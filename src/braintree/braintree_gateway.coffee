{Http} = require('./http')
{AddressGateway} = require("./address_gateway")
{CreditCardGateway} = require("./credit_card_gateway")
{CreditCardVerificationGateway} = require("./credit_card_verification_gateway")
{CustomerGateway} = require("./customer_gateway")
{SettlementBatchSummaryGateway} = require("./settlement_batch_summary_gateway")
{SubscriptionGateway} = require("./subscription_gateway")
{TransactionGateway} = require("./transaction_gateway")
{TransparentRedirectGateway} = require("./transparent_redirect_gateway")
{WebhookNotificationGateway} = require("./webhook_notification_gateway")
{WebhookTestingGateway} = require("./webhook_testing_gateway")

class BraintreeGateway
  constructor: (@config) ->
    @http = new Http(@config)
    @address = new AddressGateway(this)
    @creditCard = new CreditCardGateway(this)
    @creditCardVerification = new CreditCardVerificationGateway(this)
    @customer = new CustomerGateway(this)
    @settlementBatchSummary = new SettlementBatchSummaryGateway(this)
    @subscription = new SubscriptionGateway(this)
    @transaction = new TransactionGateway(this)
    @transparentRedirect = new TransparentRedirectGateway(this)
    @webhookNotification = new WebhookNotificationGateway(this)
    @webhookTesting = new WebhookTestingGateway(this)

exports.BraintreeGateway = BraintreeGateway
