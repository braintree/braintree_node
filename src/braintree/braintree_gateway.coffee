{Http} = require('./http')
{AddressGateway} = require("./address_gateway")
{ClientToken} = require("./client_token")
{CreditCardGateway} = require("./credit_card_gateway")
{CreditCardVerificationGateway} = require("./credit_card_verification_gateway")
{CustomerGateway} = require("./customer_gateway")
{MerchantAccountGateway} = require("./merchant_account_gateway")
{SettlementBatchSummaryGateway} = require("./settlement_batch_summary_gateway")
{SubscriptionGateway} = require("./subscription_gateway")
{TransactionGateway} = require("./transaction_gateway")
{TransferGateway} = require("./transfer_gateway")
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
    @merchantAccount = new MerchantAccountGateway(this)
    @settlementBatchSummary = new SettlementBatchSummaryGateway(this)
    @subscription = new SubscriptionGateway(this)
    @transaction = new TransactionGateway(this)
    @transfer = new TransferGateway(this)
    @transparentRedirect = new TransparentRedirectGateway(this)
    @webhookNotification = new WebhookNotificationGateway(this)
    @webhookTesting = new WebhookTestingGateway(this)

  generateClientToken: (options) ->
    ClientToken.generate(
      @config.merchantId,
      @config.publicKey,
      @config.privateKey,
      "#{@config.baseMerchantUrl()}/client_api",
      @config.environment.authUrl,
      options
    )

exports.BraintreeGateway = BraintreeGateway
