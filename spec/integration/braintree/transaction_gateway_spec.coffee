require('../../spec_helper')

{_} = require('underscore')
braintree = specHelper.braintree
Braintree = require('../../../lib/braintree')
{CreditCardNumbers} = require('../../../lib/braintree/test/credit_card_numbers')
{Nonces} = require('../../../lib/braintree/test/nonces')
{VenmoSdk} = require('../../../lib/braintree/test/venmo_sdk')
{CreditCard} = require('../../../lib/braintree/credit_card')
{ValidationErrorCodes} = require('../../../lib/braintree/validation_error_codes')
{PaymentInstrumentTypes} = require('../../../lib/braintree/payment_instrument_types')
{Transaction} = require('../../../lib/braintree/transaction')
{Dispute} = require('../../../lib/braintree/dispute')
{Environment} = require('../../../lib/braintree/environment')
{Config} = require('../../../lib/braintree/config')
capture = require('capture-stream')

describe "TransactionGateway", ->
  describe "sale", ->
    it "charges a card", (done) ->
      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.equal(response.transaction.type, 'sale')
        assert.equal(response.transaction.amount, '5.00')
        assert.equal(response.transaction.creditCard.maskedNumber, '510510******5100')
        assert.isNull(response.transaction.voiceReferralNumber)

        done()

    it "charges a card using an access token", (done) ->
      oauthGateway = braintree.connect {
        clientId: 'client_id$development$integration_client_id'
        clientSecret: 'client_secret$development$integration_client_secret'
      }

      specHelper.createToken oauthGateway, {merchantPublicId: 'integration_merchant_id', scope: 'read_write'}, (err, response) ->

        gateway = braintree.connect {
          accessToken: response.credentials.accessToken
        }

        transactionParams =
          amount: '5.00'
          creditCard:
            number: '5105105105105100'
            expirationDate: '05/12'

        gateway.transaction.sale transactionParams, (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
          assert.equal(response.transaction.type, 'sale')
          assert.equal(response.transaction.amount, '5.00')
          assert.equal(response.transaction.creditCard.maskedNumber, '510510******5100')
          assert.isNull(response.transaction.voiceReferralNumber)

          done()

    it "can use a customer from the vault", (done) ->
      customerParams =
        firstName: 'Adam'
        lastName: 'Jones'
        creditCard:
          cardholderName: 'Adam Jones'
          number: '5105105105105100'
          expirationDate: '05/2014'

      specHelper.defaultGateway.customer.create customerParams, (err, response) ->
        transactionParams =
          customer_id: response.customer.id
          amount: '100.00'

        specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
          assert.equal(response.transaction.type, 'sale')
          assert.equal(response.transaction.customer.firstName, 'Adam')
          assert.equal(response.transaction.customer.lastName, 'Jones')
          assert.equal(response.transaction.creditCard.cardholderName, 'Adam Jones')
          assert.equal(response.transaction.creditCard.maskedNumber, '510510******5100')
          assert.equal(response.transaction.creditCard.expirationDate, '05/2014')

          done()

    it "can use a credit card from the vault", (done) ->
      customerParams =
        firstName: 'Adam'
        lastName: 'Jones'
        creditCard:
          cardholderName: 'Adam Jones'
          number: '5105105105105100'
          expirationDate: '05/2014'

      specHelper.defaultGateway.customer.create customerParams, (err, response) ->
        transactionParams =
          payment_method_token: response.customer.creditCards[0].token
          amount: '100.00'

        specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
          assert.equal(response.transaction.type, 'sale')
          assert.equal(response.transaction.customer.firstName, 'Adam')
          assert.equal(response.transaction.customer.lastName, 'Jones')
          assert.equal(response.transaction.creditCard.cardholderName, 'Adam Jones')
          assert.equal(response.transaction.creditCard.maskedNumber, '510510******5100')
          assert.equal(response.transaction.creditCard.expirationDate, '05/2014')

          done()

    it "returns payment_instrument_type for credit_card", (done) ->
      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.equal(response.transaction.paymentInstrumentType, PaymentInstrumentTypes.CreditCard)

        done()


    context "with apple pay", ->
      it "returns ApplePayCard for payment_instrument", (done) ->
        specHelper.defaultGateway.customer.create {}, (err, response) ->
          transactionParams =
            paymentMethodNonce: Nonces.ApplePayAmEx
            amount: '100.00'

          specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
            assert.isNull(err)
            assert.isTrue(response.success)
            assert.equal(response.transaction.paymentInstrumentType, PaymentInstrumentTypes.ApplePayCard)
            assert.isNotNull(response.transaction.applePayCard.card_type)
            assert.isNotNull(response.transaction.applePayCard.payment_instrument_name)

            done()

    context "with android pay proxy card", ->
      it "returns AndroidPayCard for payment_instrument", (done) ->
        specHelper.defaultGateway.customer.create {}, (err, response) ->
          transactionParams =
            paymentMethodNonce: Nonces.AndroidPayDiscover
            amount: '100.00'

          specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
            assert.isNull(err)
            assert.isTrue(response.success)
            assert.equal(response.transaction.paymentInstrumentType, PaymentInstrumentTypes.AndroidPayCard)
            assert.isString(response.transaction.androidPayCard.googleTransactionId)
            assert.equal(response.transaction.androidPayCard.cardType, specHelper.braintree.CreditCard.CardType.Discover)
            assert.equal(response.transaction.androidPayCard.last4, "1117")

            done()

    context "with android pay network token", ->
      it "returns AndroidPayCard for payment_instrument", (done) ->
        specHelper.defaultGateway.customer.create {}, (err, response) ->
          transactionParams =
            paymentMethodNonce: Nonces.AndroidPayMasterCard
            amount: '100.00'

          specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
            assert.isNull(err)
            assert.isTrue(response.success)
            assert.equal(response.transaction.paymentInstrumentType, PaymentInstrumentTypes.AndroidPayCard)
            assert.isString(response.transaction.androidPayCard.googleTransactionId)
            assert.equal(response.transaction.androidPayCard.cardType, specHelper.braintree.CreditCard.CardType.MasterCard)
            assert.equal(response.transaction.androidPayCard.last4, "4444")

            done()

    context "with amex express checkout card", ->
      it "returns AmexExpressCheckoutCard for payment_instrument", (done) ->
        specHelper.defaultGateway.customer.create {}, (err, response) ->
          transactionParams =
            paymentMethodNonce: Nonces.AmexExpressCheckout
            merchantAccountId: specHelper.fakeAmexDirectMerchantAccountId
            amount: '100.00'

          specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
            assert.isNull(err)
            assert.isTrue(response.success)
            assert.equal(response.transaction.paymentInstrumentType, PaymentInstrumentTypes.AmexExpressCheckoutCard)
            assert.equal(response.transaction.amexExpressCheckoutCard.cardType, specHelper.braintree.CreditCard.CardType.AmEx)
            assert.match(response.transaction.amexExpressCheckoutCard.cardMemberNumber, /^\d{4}$/)

            done()

    context "with venmo account", ->
      it "returns VenmoAccount for payment_instrument", (done) ->
        specHelper.defaultGateway.customer.create {}, (err, response) ->
          transactionParams =
            paymentMethodNonce: Nonces.VenmoAccount
            merchantAccountId: specHelper.fakeVenmoAccountMerchantAccountId
            amount: '100.00'

          specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
            assert.isNull(err)
            assert.isTrue(response.success)
            assert.equal(response.transaction.paymentInstrumentType, PaymentInstrumentTypes.VenmoAccount)
            assert.equal(response.transaction.venmoAccount.username, "venmojoe")
            assert.equal(response.transaction.venmoAccount.venmoUserId, "Venmo-Joe-1")

            done()

    context "Coinbase", ->
      it "returns CoinbaseAccount for payment_instrument", (done) ->
        specHelper.defaultGateway.customer.create {}, (err, response) ->
          transactionParams =
            paymentMethodNonce: Nonces.Coinbase
            amount: '100.00'

          specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
            assert.isNull(err)
            assert.isTrue(response.success)
            assert.equal(response.transaction.paymentInstrumentType, PaymentInstrumentTypes.CoinbaseAccount)
            assert.isNotNull(response.transaction.coinbaseAccount.user_email)

            done()

    context "with a paypal acount", ->
      it "returns PayPalAccount for payment_instrument", (done) ->
        specHelper.defaultGateway.customer.create {}, (err, response) ->
          transactionParams =
            paymentMethodNonce: Nonces.PayPalOneTimePayment
            amount: '100.00'

          specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
            assert.isNull(err)
            assert.isTrue(response.success)
            assert.equal(response.transaction.paymentInstrumentType, PaymentInstrumentTypes.PayPalAccount)

            done()

      context "in-line capture", ->
        it "includes processorSettlementResponse_code and processorSettlementResponseText for settlement declined transactions", (done) ->
          transactionParams =
            paymentMethodNonce: Nonces.PayPalOneTimePayment
            amount: '10.00'
            options:
              submitForSettlement: true

          specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
            assert.isNull(err)
            assert.isTrue(response.success)
            transactionId = response.transaction.id

            specHelper.defaultGateway.testing.settlementDecline transactionId, (err, transaction) ->
              specHelper.defaultGateway.transaction.find transactionId, (err, transaction) ->
                assert.equal(transaction.processorSettlementResponseCode, "4001")
                assert.equal(transaction.processorSettlementResponseText, "Settlement Declined")
                done()


        it "includes processorSettlementResponseCode and processorSettlementResponseText for settlement pending transactions", (done) ->
          transactionParams =
            paymentMethodNonce: Nonces.PayPalOneTimePayment
            amount: '10.00'
            options:
              submitForSettlement: true

          specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
            assert.isNull(err)
            assert.isTrue(response.success)
            transactionId = response.transaction.id

            specHelper.defaultGateway.testing.settlementPending transactionId, (err, response) ->
              specHelper.defaultGateway.transaction.find transactionId, (err, transaction) ->
                assert.equal(transaction.processorSettlementResponseCode, "4002")
                assert.equal(transaction.processorSettlementResponseText, "Settlement Pending")
                done()

      context "as a vaulted payment method", ->
        it "successfully creates a transaction", (done) ->
          specHelper.defaultGateway.customer.create {}, (err, response) ->
            customerId = response.customer.id
            nonceParams =
              paypalAccount:
                consentCode: 'PAYPAL_CONSENT_CODE'
                token: "PAYPAL_ACCOUNT_#{specHelper.randomId()}"

            specHelper.generateNonceForNewPaymentMethod nonceParams, customerId, (nonce) ->
              paymentMethodParams =
                paymentMethodNonce: nonce
                customerId: customerId

              specHelper.defaultGateway.paymentMethod.create paymentMethodParams, (err, response) ->
                paymentMethodToken = response.paymentMethod.token

                transactionParams =
                  paymentMethodToken: paymentMethodToken
                  amount: '100.00'

                specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
                  assert.isNull(err)
                  assert.isTrue(response.success)
                  assert.equal(response.transaction.type, 'sale')
                  assert.isString(response.transaction.paypalAccount.payerEmail)
                  assert.isString(response.transaction.paypalAccount.authorizationId)
                  assert.isString(response.transaction.paypalAccount.imageUrl)
                  assert.isString(response.transaction.paypalAccount.debugId)

                  done()

      context "as a payment method nonce authorized for future payments", ->
        it "successfully creates a transaction but doesn't vault a paypal account", (done) ->
          paymentMethodToken = "PAYPAL_ACCOUNT_#{specHelper.randomId()}"

          myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))
          specHelper.defaultGateway.clientToken.generate({}, (err, result) ->
            clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken))
            authorizationFingerprint = clientToken.authorizationFingerprint
            params =
              authorizationFingerprint: authorizationFingerprint
              paypalAccount:
                consentCode: 'PAYPAL_CONSENT_CODE'
                token: paymentMethodToken

            myHttp.post("/client_api/v1/payment_methods/paypal_accounts.json", params, (statusCode, body) ->
              nonce = JSON.parse(body).paypalAccounts[0].nonce

              specHelper.defaultGateway.customer.create {}, (err, response) ->
                transactionParams =
                  paymentMethodNonce: nonce
                  amount: '100.00'

                specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
                  assert.isNull(err)
                  assert.isTrue(response.success)
                  assert.equal(response.transaction.type, 'sale')
                  assert.isNull(response.transaction.paypalAccount.token)
                  assert.isString(response.transaction.paypalAccount.payerEmail)
                  assert.isString(response.transaction.paypalAccount.authorizationId)
                  assert.isString(response.transaction.paypalAccount.debugId)

                  specHelper.defaultGateway.paypalAccount.find paymentMethodToken, (err, paypalAccount) ->
                    assert.equal(err.type, braintree.errorTypes.notFoundError)

                    done()
            )
          )

        it "vaults when explicitly asked", (done) ->
          paymentMethodToken = "PAYPAL_ACCOUNT_#{specHelper.randomId()}"

          myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))
          specHelper.defaultGateway.clientToken.generate({}, (err, result) ->
            clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken))
            authorizationFingerprint = clientToken.authorizationFingerprint
            params =
              authorizationFingerprint: authorizationFingerprint
              paypalAccount:
                consentCode: 'PAYPAL_CONSENT_CODE'
                token: paymentMethodToken

            myHttp.post("/client_api/v1/payment_methods/paypal_accounts.json", params, (statusCode, body) ->
              nonce = JSON.parse(body).paypalAccounts[0].nonce

              specHelper.defaultGateway.customer.create {}, (err, response) ->
                transactionParams =
                  paymentMethodNonce: nonce
                  amount: '100.00'
                  options:
                    storeInVault: true

                specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
                  assert.isNull(err)
                  assert.isTrue(response.success)
                  assert.equal(response.transaction.type, 'sale')
                  assert.equal(response.transaction.paypalAccount.token, paymentMethodToken)
                  assert.isString(response.transaction.paypalAccount.payerEmail)
                  assert.isString(response.transaction.paypalAccount.authorizationId)
                  assert.isString(response.transaction.paypalAccount.debugId)

                  specHelper.defaultGateway.paypalAccount.find paymentMethodToken, (err, paypalAccount) ->
                    assert.isNull(err)

                    done()
            )
          )

      context "as a payment method nonce authorized for one-time use", ->
        it "successfully creates a transaction", (done) ->
          nonce = Nonces.PayPalOneTimePayment

          specHelper.defaultGateway.customer.create {}, (err, response) ->
            transactionParams =
              paymentMethodNonce: nonce
              amount: '100.00'

            specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
              assert.isNull(err)
              assert.isTrue(response.success)
              assert.equal(response.transaction.type, 'sale')
              assert.isNull(response.transaction.paypalAccount.token)
              assert.isString(response.transaction.paypalAccount.payerEmail)
              assert.isString(response.transaction.paypalAccount.authorizationId)
              assert.isString(response.transaction.paypalAccount.debugId)

              done()

        it "successfully creates a transaction with a payee email", (done) ->
          nonce = Nonces.PayPalOneTimePayment

          specHelper.defaultGateway.customer.create {}, (err, response) ->
            transactionParams =
              paymentMethodNonce: nonce
              amount: '100.00'
              paypalAccount:
                payeeEmail: 'payee@example.com'

            specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
              assert.isNull(err)
              assert.isTrue(response.success)
              assert.equal(response.transaction.type, 'sale')
              assert.isNull(response.transaction.paypalAccount.token)
              assert.isString(response.transaction.paypalAccount.payerEmail)
              assert.isString(response.transaction.paypalAccount.authorizationId)
              assert.isString(response.transaction.paypalAccount.debugId)
              assert.equal(response.transaction.paypalAccount.payeeEmail, 'payee@example.com')

              done()

        it "successfully creates a transaction with a payee email in the options params", (done) ->
          nonce = Nonces.PayPalOneTimePayment

          specHelper.defaultGateway.customer.create {}, (err, response) ->
            transactionParams =
              paymentMethodNonce: nonce
              amount: '100.00'
              paypalAccount: {}
              options:
                payeeEmail: 'payee@example.com'

            specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
              assert.isNull(err)
              assert.isTrue(response.success)
              assert.equal(response.transaction.type, 'sale')
              assert.isNull(response.transaction.paypalAccount.token)
              assert.isString(response.transaction.paypalAccount.payerEmail)
              assert.isString(response.transaction.paypalAccount.authorizationId)
              assert.isString(response.transaction.paypalAccount.debugId)
              assert.equal(response.transaction.paypalAccount.payeeEmail, 'payee@example.com')

              done()

        it "successfully creates a transaction with a payee email in transaction.options.paypal", (done) ->
          nonce = Nonces.PayPalOneTimePayment

          specHelper.defaultGateway.customer.create {}, (err, response) ->
            transactionParams =
              paymentMethodNonce: nonce
              amount: '100.00'
              paypalAccount: {}
              options:
                paypal:
                  payeeEmail: 'payee@example.com'

            specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
              assert.isNull(err)
              assert.isTrue(response.success)
              assert.equal(response.transaction.type, 'sale')
              assert.isNull(response.transaction.paypalAccount.token)
              assert.isString(response.transaction.paypalAccount.payerEmail)
              assert.isString(response.transaction.paypalAccount.authorizationId)
              assert.isString(response.transaction.paypalAccount.debugId)
              assert.equal(response.transaction.paypalAccount.payeeEmail, 'payee@example.com')

              done()

        it "successfully creates a transaction with a PayPal custom field", (done) ->
          nonce = Nonces.PayPalOneTimePayment

          specHelper.defaultGateway.customer.create {}, (err, response) ->
            transactionParams =
              paymentMethodNonce: nonce
              amount: '100.00'
              paypalAccount: {}
              options:
                paypal:
                  customField: 'custom field junk'

            specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
              assert.isNull(err)
              assert.isTrue(response.success)
              assert.equal(response.transaction.type, 'sale')
              assert.isNull(response.transaction.paypalAccount.token)
              assert.isString(response.transaction.paypalAccount.payerEmail)
              assert.isString(response.transaction.paypalAccount.authorizationId)
              assert.isString(response.transaction.paypalAccount.debugId)
              assert.equal(response.transaction.paypalAccount.customField, 'custom field junk')

              done()

        it "successfully creates a transaction with PayPal supplementary data", (done) ->
          nonce = Nonces.PayPalOneTimePayment

          specHelper.defaultGateway.customer.create {}, (err, response) ->
            transactionParams =
              paymentMethodNonce: nonce
              amount: '100.00'
              paypalAccount: {}
              options:
                paypal:
                  supplementaryData:
                    key1: 'value1'
                    key2: 'value2'

            # note - supplementary data is not returned in response
            specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
              assert.isNull(err)
              assert.isTrue(response.success)

              done()

        it "successfully creates a transaction with a PayPal description", (done) ->
          nonce = Nonces.PayPalOneTimePayment

          specHelper.defaultGateway.customer.create {}, (err, response) ->
            transactionParams =
              paymentMethodNonce: nonce
              amount: '100.00'
              paypalAccount: {}
              options:
                paypal:
                  description: 'product description'

            specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
              assert.isNull(err)
              assert.isTrue(response.success)
              assert.equal(response.transaction.paypalAccount.description, 'product description')

              done()

        it "does not vault even when explicitly asked", (done) ->
          nonce = Nonces.PayPalOneTimePayment

          specHelper.defaultGateway.customer.create {}, (err, response) ->
            transactionParams =
              paymentMethodNonce: nonce
              amount: '100.00'
              options:
                storeInVault: true

            specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
              assert.isNull(err)
              assert.isTrue(response.success)
              assert.equal(response.transaction.type, 'sale')
              assert.isNull(response.transaction.paypalAccount.token)
              assert.isString(response.transaction.paypalAccount.payerEmail)
              assert.isString(response.transaction.paypalAccount.authorizationId)
              assert.isString(response.transaction.paypalAccount.debugId)

              done()

    it "allows submitting for settlement", (done) ->
      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'
        options:
          submitForSettlement: true

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.equal(response.transaction.status, 'submitted_for_settlement')

        done()

    it "allows storing in the vault", (done) ->
      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'
        options:
          storeInVault: true

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.match(response.transaction.customer.id, /^\d+$/)
        assert.match(response.transaction.creditCard.token, /^\w+$/)

        done()

    it "can create transactions with custom fields", (done) ->
      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'
        customFields:
          storeMe: 'custom value'

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.equal(response.transaction.customFields.storeMe, 'custom value')

        done()

    it "allows specifying transactions as 'recurring'", (done) ->
      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'
        recurring: true

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.equal(response.transaction.recurring, true)

        done()

    it "sets card type indicators on the transaction", (done) ->
      transactionParams =
        amount: '5.00'
        creditCard:
          number: CreditCardNumbers.CardTypeIndicators.Unknown
          expirationDate: '05/12'

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        assert.equal(response.transaction.creditCard.prepaid, CreditCard.Prepaid.Unknown)
        assert.equal(response.transaction.creditCard.durbinRegulated, CreditCard.DurbinRegulated.Unknown)
        assert.equal(response.transaction.creditCard.commercial, CreditCard.Commercial.Unknown)
        assert.equal(response.transaction.creditCard.healthcare, CreditCard.Healthcare.Unknown)
        assert.equal(response.transaction.creditCard.debit, CreditCard.Debit.Unknown)
        assert.equal(response.transaction.creditCard.payroll, CreditCard.Payroll.Unknown)

        done()

    it "handles processor declines", (done) ->
      transactionParams =
        amount: '2000.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        assert.isFalse(response.success)
        assert.equal(response.transaction.amount, '2000.00')
        assert.equal(response.transaction.status, 'processor_declined')
        assert.equal(response.transaction.additionalProcessorResponse, '2000 : Do Not Honor')

        done()

    it "handles risk data returned by the gateway", (done) ->
      transactionParams =
        amount: '10.0'
        creditCard:
          number: "4111111111111111"
          expirationDate: '05/16'

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        assert.isTrue(response.success)
        assert.equal(response.transaction.riskData.decision, "Not Evaluated")
        assert.equal(response.transaction.riskData.id, null)
        done()

    it "handles fraud rejection", (done) ->
      transactionParams =
        amount: '10.0'
        creditCard:
          number: CreditCardNumbers.CardTypeIndicators.Fraud
          expirationDate: '05/16'

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        assert.isFalse(response.success)
        assert.equal(response.transaction.status, Transaction.Status.GatewayRejected)
        assert.equal(response.transaction.gatewayRejectionReason, Transaction.GatewayRejectionReason.Fraud)
        done()

    it "allows fraud params", (done) ->
      transactionParams =
        amount: '10.0'
        deviceSessionId: "123456789"
        fraudMerchantId: "0000000031"
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/16'

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        done()

    it "handles validation errors", (done) ->
      transactionParams =
        creditCard:
          number: '5105105105105100'

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        assert.isFalse(response.success)
        assert.equal(response.message, 'Amount is required.\nExpiration date is required.')
        assert.equal(
          response.errors.for('transaction').on('amount')[0].code,
          '81502'
        )
        assert.equal(
          response.errors.for('transaction').on('amount')[0].attribute,
          'amount'
        )
        assert.equal(
          response.errors.for('transaction').for('creditCard').on('expirationDate')[0].code,
          '81709'
        )
        errorCodes = (error.code for error in response.errors.deepErrors())
        assert.equal(errorCodes.length, 2)
        assert.include(errorCodes, '81502')
        assert.include(errorCodes, '81709')

        done()

    it "handles descriptors", (done) ->
      transactionParams =
        amount: '10.0'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/16'
        descriptor:
          name: 'abc*def'
          phone: '1234567890'
          url: 'ebay.com'

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        assert.isTrue(response.success)
        assert.equal(response.transaction.descriptor.name, 'abc*def')
        assert.equal(response.transaction.descriptor.phone, '1234567890')
        assert.equal(response.transaction.descriptor.url, 'ebay.com')

        done()

    it "handles descriptor validations", (done) ->
      transactionParams =
        amount: '10.0'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/16'
        descriptor:
          name: 'abc'
          phone: '1234567'
          url: '12345678901234'

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        assert.isFalse(response.success)
        assert.equal(
          response.errors.for('transaction').for('descriptor').on('name')[0].code,
          ValidationErrorCodes.Descriptor.NameFormatIsInvalid
        )
        assert.equal(
          response.errors.for('transaction').for('descriptor').on('phone')[0].code,
          ValidationErrorCodes.Descriptor.PhoneFormatIsInvalid
        )
        assert.equal(
          response.errors.for('transaction').for('descriptor').on('url')[0].code,
          ValidationErrorCodes.Descriptor.UrlFormatIsInvalid
        )
        done()

    it "handles lodging industry data", (done) ->
      transactionParams =
        amount: '10.0'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/16'
        industry:
          industryType: Transaction.IndustryData.Lodging
          data:
            folioNumber: 'aaa'
            checkInDate: '2014-07-07'
            checkOutDate: '2014-08-08'
            roomRate: '239.00'

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        assert.isTrue(response.success)

        done()

    it "handles lodging industry data validations", (done) ->
      transactionParams =
        amount: '10.0'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/16'
        industry:
          industryType: Transaction.IndustryData.Lodging
          data:
            folioNumber: 'aaa'
            checkInDate: '2014-07-07'
            checkOutDate: '2014-06-06'
            roomRate: '239.00'

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        assert.isFalse(response.success)
        assert.equal(
          response.errors.for('transaction').for('industry').on('checkOutDate')[0].code,
          ValidationErrorCodes.Transaction.IndustryData.Lodging.CheckOutDateMustFollowCheckInDate
        )

        done()

    it "handles travel cruise industry data", (done) ->
      transactionParams =
        amount: '10.0'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/16'
        industry:
          industryType: Transaction.IndustryData.TravelAndCruise
          data:
            travelPackage: 'flight'
            departureDate: '2014-07-07'
            lodgingCheckInDate: '2014-07-07'
            lodgingCheckOutDate: '2014-08-08'
            lodgingName: 'Disney'

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        assert.isTrue(response.success)

        done()

    it "handles lodging industry data validations", (done) ->
      transactionParams =
        amount: '10.0'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/16'
        industry:
          industryType: Transaction.IndustryData.TravelAndCruise
          data:
            travelPackage: 'onfoot'
            departureDate: '2014-07-07'
            lodgingCheckInDate: '2014-07-07'
            lodgingCheckOutDate: '2014-08-08'
            lodgingName: 'Disney'

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        assert.isFalse(response.success)
        assert.equal(
          response.errors.for('transaction').for('industry').on('travelPackage')[0].code,
          ValidationErrorCodes.Transaction.IndustryData.TravelCruise.TravelPackageIsInvalid
        )

        done()

    context "with a service fee", ->
      it "persists the service fee", (done) ->
        transactionParams =
          merchantAccountId: specHelper.nonDefaultSubMerchantAccountId
          amount: '5.00'
          creditCard:
            number: '5105105105105100'
            expirationDate: '05/12'
          serviceFeeAmount: '1.00'

        specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
          assert.equal(response.transaction.serviceFeeAmount, '1.00')

          done()

      it "handles validation errors on service fees", (done) ->
        transactionParams =
          merchantAccountId: specHelper.nonDefaultSubMerchantAccountId
          amount: '1.00'
          creditCard:
            number: '5105105105105100'
            expirationDate: '05/12'
          serviceFeeAmount: '5.00'

        specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
          assert.isNull(err)
          assert.isFalse(response.success)
          assert.equal(
            response.errors.for('transaction').on('serviceFeeAmount')[0].code,
            ValidationErrorCodes.Transaction.ServiceFeeAmountIsTooLarge
          )

          done()

      it "sub merchant accounts must provide a service fee", (done) ->
        transactionParams =
          merchantAccountId: specHelper.nonDefaultSubMerchantAccountId
          amount: '1.00'
          creditCard:
            number: '5105105105105100'
            expirationDate: '05/12'

        specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
          assert.isNull(err)
          assert.isFalse(response.success)
          assert.equal(
            response.errors.for('transaction').on('merchantAccountId')[0].code,
            ValidationErrorCodes.Transaction.SubMerchantAccountRequiresServiceFeeAmount
          )

          done()

    context "with escrow status", ->
      it "can specify transactions to be held for escrow", (done) ->
        transactionParams =
          merchantAccountId: specHelper.nonDefaultSubMerchantAccountId,
          amount: '10.00'
          serviceFeeAmount: '1.00'
          creditCard:
            number: "4111111111111111"
            expirationDate: '05/12'
          options:
            holdInEscrow: true
        specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
          assert.equal(
            response.transaction.escrowStatus,
            Transaction.EscrowStatus.HoldPending
          )
          done()

      it "can not be held for escrow if not a submerchant", (done) ->
        transactionParams =
          merchantAccountId: specHelper.defaultMerchantAccountId,
          amount: '10.00'
          serviceFeeAmount: '1.00'
          creditCard:
            number: "4111111111111111"
            expirationDate: '05/12'
          options:
            holdInEscrow: true
        specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
          assert.isNull(err)
          assert.isFalse(response.success)
          assert.equal(
            response.errors.for('transaction').on('base')[0].code,
            ValidationErrorCodes.Transaction.CannotHoldInEscrow
          )
          done()

    context "releaseFromEscrow", ->
      it "can release an escrowed transaction", (done) ->
        specHelper.createEscrowedTransaction (transaction) ->
          specHelper.defaultGateway.transaction.releaseFromEscrow transaction.id, (err, response) ->
            assert.isNull(err)
            assert.isTrue(response.success)
            assert.equal(response.transaction.escrowStatus, Transaction.EscrowStatus.ReleasePending)
            done()

      it "cannot submit a non-escrowed transaction for release", (done) ->
        transactionParams =
          merchantAccountId: specHelper.nonDefaultSubMerchantAccountId,
          amount: '10.00'
          serviceFeeAmount: '1.00'
          creditCard:
            number: "4111111111111111"
            expirationDate: '05/12'
          options:
            holdInEscrow: true
        specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
          specHelper.defaultGateway.transaction.releaseFromEscrow response.transaction.id, (err, response) ->
            assert.isNull(err)
            assert.isFalse(response.success)
            assert.equal(
              response.errors.for('transaction').on('base')[0].code,
              ValidationErrorCodes.Transaction.CannotReleaseFromEscrow
            )
            done()

    context "cancelRelease", ->
      it "can cancel release for a transaction that has been submitted for release", (done) ->
        specHelper.createEscrowedTransaction (transaction) ->
          specHelper.defaultGateway.transaction.releaseFromEscrow transaction.id, (err, response) ->
            specHelper.defaultGateway.transaction.cancelRelease transaction.id, (err, response) ->
              assert.isNull(err)
              assert.isTrue(response.success)
              assert.equal(
                response.transaction.escrowStatus,
                Transaction.EscrowStatus.Held
              )
              done()

      it "cannot cancel release a transaction that has not been submitted for release", (done) ->
        specHelper.createEscrowedTransaction (transaction) ->
          specHelper.defaultGateway.transaction.cancelRelease transaction.id, (err, response) ->
            assert.isNull(err)
            assert.isFalse(response.success)
            assert.equal(
              response.errors.for('transaction').on('base')[0].code,
              ValidationErrorCodes.Transaction.CannotCancelRelease
            )
            done()

    context "holdInEscrow", ->
      it "can hold authorized or submitted for settlement transactions for escrow", (done) ->
        transactionParams =
          merchantAccountId: specHelper.nonDefaultSubMerchantAccountId,
          amount: '10.00'
          serviceFeeAmount: '1.00'
          creditCard:
            number: "4111111111111111"
            expirationDate: '05/12'
        specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
          specHelper.defaultGateway.transaction.holdInEscrow response.transaction.id, (err, response) ->
            assert.isNull(err)
            assert.isTrue(response.success)
            assert.equal(
              response.transaction.escrowStatus,
              Transaction.EscrowStatus.HoldPending
            )
            done()

      it "cannot hold settled transactions for escrow", (done) ->
        transactionParams =
          merchantAccountId: specHelper.nonDefaultSubMerchantAccountId,
          amount: '10.00'
          serviceFeeAmount: '1.00'
          creditCard:
            number: "4111111111111111"
            expirationDate: '05/12'
          options:
            submitForSettlement: true
        specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
          specHelper.defaultGateway.testing.settle response.transaction.id, (err, response) ->
            specHelper.defaultGateway.transaction.holdInEscrow response.transaction.id, (err, response) ->
              assert.isFalse(response.success)
              assert.equal(
                response.errors.for('transaction').on('base')[0].code,
                ValidationErrorCodes.Transaction.CannotHoldInEscrow
              )
              done()

    it "can use venmo sdk payment method codes", (done) ->
      transactionParams =
        amount: '1.00'
        venmoSdkPaymentMethodCode: VenmoSdk.VisaPaymentMethodCode

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.equal(response.transaction.creditCard.bin, "411111")

        done()

    it "can use venmo sdk session", (done) ->
      transactionParams =
        amount: '1.00'
        creditCard:
          number: "4111111111111111"
          expirationDate: '05/12'
        options:
          venmoSdkSession: VenmoSdk.Session

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.isTrue(response.transaction.creditCard.venmoSdk)

        done()

    it "can use vaulted credit card nonce", (done) ->
      customerParams =
        firstName: 'Adam'
        lastName: 'Jones'

      specHelper.defaultGateway.customer.create customerParams, (err, response) ->
        customerId = response.customer.id
        paymentMethodParams =
          creditCard:
            number: "4111111111111111"
            expirationMonth: "12"
            expirationYear: "2099"
        specHelper.generateNonceForNewPaymentMethod(paymentMethodParams, customerId, (nonce) ->
          transactionParams =
            amount: '1.00'
            paymentMethodNonce: nonce

          specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
            assert.isNull(err)
            assert.isTrue(response.success)

            done()
        )

    it "can use vaulted PayPal account nonce", (done) ->
      customerParams =
        firstName: 'Adam'
        lastName: 'Jones'

      specHelper.defaultGateway.customer.create customerParams, (err, response) ->
        customerId = response.customer.id
        paymentMethodParams =
          paypalAccount:
            consent_code: "PAYPAL_CONSENT_CODE"
        specHelper.generateNonceForNewPaymentMethod(paymentMethodParams, customerId, (nonce) ->
          transactionParams =
            amount: '1.00'
            paymentMethodNonce: nonce

          specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
            assert.isNull(err)
            assert.isTrue(response.success)

            done()
        )

    it "can use params nonce", (done) ->
      paymentMethodParams =
        creditCard:
          number: "4111111111111111"
          expirationMonth: "12"
          expirationYear: "2099"
      specHelper.generateNonceForNewPaymentMethod(paymentMethodParams, null, (nonce) ->
        transactionParams =
          amount: '1.00'
          paymentMethodNonce: nonce

        specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)

          done()
      )

    it "works with an unknown payment instrument", (done) ->
      transactionParams =
        amount: '1.00'
        paymentMethodNonce: Nonces.AbstractTransactable

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)

        done()

    context "amex rewards", (done) ->
      it "succeeds", (done) ->
        transactionParams =
          merchantAccountId: specHelper.fakeAmexDirectMerchantAccountId
          amount: "10.00"
          creditCard:
            number: CreditCardNumbers.AmexPayWithPoints.Success
            expirationDate: "12/2020"
          options:
            submitForSettlement: true
            amexRewards:
              requestId: "ABC123"
              points: "1000"
              currencyAmount: "10.00"
              currencyIsoCode: "USD"

        specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
          assert.isTrue(response.success)
          assert.equal(response.transaction.status, Transaction.Status.SubmittedForSettlement)

          done()

      it "succeeds even if the card is ineligible", (done) ->
        transactionParams =
          merchantAccountId: specHelper.fakeAmexDirectMerchantAccountId
          amount: "10.00"
          creditCard:
            number: CreditCardNumbers.AmexPayWithPoints.IneligibleCard
            expirationDate: "12/2020"
          options:
            submitForSettlement: true
            amexRewards:
              requestId: "ABC123"
              points: "1000"
              currencyAmount: "10.00"
              currencyIsoCode: "USD"

        specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
          assert.isTrue(response.success)
          assert.equal(response.transaction.status, Transaction.Status.SubmittedForSettlement)

          done()

      it "succeeds even if the card's balance is insufficient", (done) ->
        transactionParams =
          merchantAccountId: specHelper.fakeAmexDirectMerchantAccountId
          amount: "10.00"
          creditCard:
            number: CreditCardNumbers.AmexPayWithPoints.InsufficientPoints
            expirationDate: "12/2020"
          options:
            submitForSettlement: true
            amexRewards:
              requestId: "ABC123"
              points: "1000"
              currencyAmount: "10.00"
              currencyIsoCode: "USD"

        specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
          assert.isTrue(response.success)
          assert.equal(response.transaction.status, Transaction.Status.SubmittedForSettlement)

          done()

  describe "credit", ->
    it "creates a credit", (done) ->
      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'

      specHelper.defaultGateway.transaction.credit transactionParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.equal(response.transaction.type, 'credit')
        assert.equal(response.transaction.amount, '5.00')
        assert.equal(response.transaction.creditCard.maskedNumber, '510510******5100')

        done()

    it "handles validation errors", (done) ->
      transactionParams =
        creditCard:
          number: '5105105105105100'

      specHelper.defaultGateway.transaction.credit transactionParams, (err, response) ->
        assert.isFalse(response.success)
        assert.equal(response.message, 'Amount is required.\nExpiration date is required.')
        assert.equal(
          response.errors.for('transaction').on('amount')[0].code,
          '81502'
        )
        assert.equal(
          response.errors.for('transaction').on('amount')[0].attribute,
          'amount'
        )
        assert.equal(
          response.errors.for('transaction').for('creditCard').on('expirationDate')[0].code,
          '81709'
        )
        errorCodes = (error.code for error in response.errors.deepErrors())
        assert.equal(errorCodes.length, 2)
        assert.include(errorCodes, '81502')
        assert.include(errorCodes, '81709')

        done()

    context "three d secure", (done) ->
      it "creates a transaction with threeDSecureToken", (done) ->
        threeDVerificationParams =
          number: '4111111111111111'
          expirationMonth: '05'
          expirationYear: '2009'
        specHelper.create3DSVerification specHelper.threeDSecureMerchantAccountId, threeDVerificationParams, (threeDSecureToken) ->
          transactionParams =
            merchantAccountId: specHelper.threeDSecureMerchantAccountId
            amount: '5.00'
            creditCard:
              number: '4111111111111111'
              expirationDate: '05/2009'
            threeDSecureToken: threeDSecureToken

          specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
            assert.isNull(err)
            assert.isTrue(response.success)

            done()

      it "returns an error if sent null threeDSecureToken", (done) ->
        transactionParams =
          merchantAccountId: specHelper.threeDSecureMerchantAccountId
          amount: '5.00'
          creditCard:
            number: '4111111111111111'
            expirationDate: '05/2009'
          threeDSecureToken: null

        specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
          assert.isFalse(response.success)
          assert.equal(
            response.errors.for('transaction').on('threeDSecureToken')[0].code,
            ValidationErrorCodes.Transaction.ThreeDSecureTokenIsInvalid
          )

          done()

      it "returns an error if 3ds lookup data doesn't match txn data", (done) ->
        threeDVerificationParams =
          number: '4111111111111111'
          expirationMonth: '05'
          expirationYear: '2009'
        specHelper.create3DSVerification specHelper.threeDSecureMerchantAccountId, threeDVerificationParams, (threeDSecureToken) ->
          transactionParams =
            merchantAccountId: specHelper.threeDSecureMerchantAccountId
            amount: '5.00'
            creditCard:
              number: '5105105105105100'
              expirationDate: '05/2009'
            threeDSecureToken: threeDSecureToken

          specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
            assert.isFalse(response.success)
            assert.equal(
              response.errors.for('transaction').on('threeDSecureToken')[0].code,
              ValidationErrorCodes.Transaction.ThreeDSecureTransactionDataDoesntMatchVerify
            )

            done()

      it "gateway rejects if 3ds is specified as required but not supplied", (done) ->
        nonceParams =
          creditCard:
            number: '4111111111111111'
            expirationMonth: '05'
            expirationYear: '2009'

        specHelper.generateNonceForNewPaymentMethod nonceParams, null, (nonce) ->
          transactionParams =
            merchantAccountId: specHelper.threeDSecureMerchantAccountId
            amount: '5.00'
            paymentMethodNonce: nonce
            options:
              threeDSecure:
                required: true

          specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
            assert.isFalse(response.success)
            assert.equal(response.transaction.status, Transaction.Status.GatewayRejected)
            assert.equal(response.transaction.gatewayRejectionReason, Transaction.GatewayRejectionReason.ThreeDSecure)

            done()

  describe "find", ->
    it "finds a transaction", (done) ->
      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        specHelper.defaultGateway.transaction.find response.transaction.id, (err, transaction) ->
          assert.equal(transaction.amount, '5.00')

          done()

    it "exposes disbursementDetails", (done) ->
      transactionId = "deposittransaction"

      specHelper.defaultGateway.transaction.find transactionId, (err, transaction) ->
        assert.equal(transaction.isDisbursed(), true)

        disbursementDetails = transaction.disbursementDetails
        assert.equal(disbursementDetails.settlementAmount, '100.00')
        assert.equal(disbursementDetails.settlementCurrencyIsoCode, 'USD')
        assert.equal(disbursementDetails.settlementCurrencyExchangeRate, '1')
        assert.equal(disbursementDetails.disbursementDate, '2013-04-10')
        assert.equal(disbursementDetails.success, true)
        assert.equal(disbursementDetails.fundsHeld, false)

        done()

    it "exposes disputes", (done) ->
      transactionId = "disputedtransaction"

      specHelper.defaultGateway.transaction.find transactionId, (err, transaction) ->

        dispute = transaction.disputes[0]
        assert.equal(dispute.amount, '250.00')
        assert.equal(dispute.currencyIsoCode, 'USD')
        assert.equal(dispute.status, Dispute.Status.Won)
        assert.equal(dispute.receivedDate, '2014-03-01')
        assert.equal(dispute.replyByDate, '2014-03-21')
        assert.equal(dispute.reason, Dispute.Reason.Fraud)
        assert.equal(dispute.transactionDetails.id, transactionId)
        assert.equal(dispute.transactionDetails.amount, '1000.00')
        assert.equal(dispute.kind, Dispute.Kind.Chargeback)
        assert.equal(dispute.dateOpened, '2014-03-01')
        assert.equal(dispute.dateWon, '2014-03-07')

        done()

    it "exposes retrievals", (done) ->
      transactionId = "retrievaltransaction"

      specHelper.defaultGateway.transaction.find transactionId, (err, transaction) ->

        dispute = transaction.disputes[0]
        assert.equal(dispute.amount, '1000.00')
        assert.equal(dispute.currencyIsoCode, 'USD')
        assert.equal(dispute.status, Dispute.Status.Open)
        assert.equal(dispute.reason, Dispute.Reason.Retrieval)
        assert.equal(dispute.transactionDetails.id, transactionId)
        assert.equal(dispute.transactionDetails.amount, '1000.00')

        done()

    it "returns a not found error if given a bad id", (done) ->
      specHelper.defaultGateway.transaction.find 'nonexistent_transaction', (err, response) ->
        assert.equal(err.type, braintree.errorTypes.notFoundError)

        done()

    it "handles whitespace ids", (done) ->
      specHelper.defaultGateway.transaction.find ' ', (err, response) ->
        assert.equal(err.type, braintree.errorTypes.notFoundError)

        done()

    it "returns all the required paypal fields", (done) ->
      specHelper.defaultGateway.transaction.find "settledtransaction", (err, transaction) ->
        assert.isString(transaction.paypalAccount.debugId)
        assert.isString(transaction.paypalAccount.payerEmail)
        assert.isString(transaction.paypalAccount.authorizationId)
        assert.isString(transaction.paypalAccount.payerId)
        assert.isString(transaction.paypalAccount.payerFirstName)
        assert.isString(transaction.paypalAccount.payerLastName)
        assert.isString(transaction.paypalAccount.sellerProtectionStatus)
        assert.isString(transaction.paypalAccount.captureId)
        assert.isString(transaction.paypalAccount.refundId)
        assert.isString(transaction.paypalAccount.transactionFeeAmount)
        assert.isString(transaction.paypalAccount.transactionFeeCurrencyIsoCode)
        done()

    context "threeDSecureInfo", ->
      it "returns three_d_secure_info if it's present", (done) ->
        specHelper.defaultGateway.transaction.find "threedsecuredtransaction", (err, transaction) ->
          info = transaction.threeDSecureInfo
          assert.isTrue(info.liabilityShifted)
          assert.isTrue(info.liabilityShiftPossible)
          assert.equal(info.enrolled, "Y")
          assert.equal(info.status, "authenticate_successful")
          done()

      it "returns null if it's empty", (done) ->
        specHelper.defaultGateway.transaction.find "settledtransaction", (err, transaction) ->
          assert.isNull(transaction.threeDSecureInfo)
          done()

  describe "refund", ->
    it "refunds a transaction", (done) ->
      specHelper.createTransactionToRefund (transaction) ->
        specHelper.defaultGateway.transaction.refund transaction.id, (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
          assert.equal(response.transaction.type, 'credit')
          assert.match(response.transaction.refund_id, /^\w+$/)

          done()

    it "refunds a paypal transaction", (done) ->
      specHelper.createPayPalTransactionToRefund (transaction) ->
        specHelper.defaultGateway.transaction.refund transaction.id, (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
          assert.equal(response.transaction.type, 'credit')
          assert.match(response.transaction.refund_id, /^\w+$/)

          done()

    it "allows refunding partial amounts", (done) ->
      specHelper.createTransactionToRefund (transaction) ->
        specHelper.defaultGateway.transaction.refund transaction.id, '1.00', (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
          assert.equal(response.transaction.type, 'credit')
          assert.match(response.transaction.refund_id, /^\w+$/)
          assert.equal(response.transaction.amount, '1.00')

          done()

    it "handles validation errors", (done) ->
      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'
        options:
          submitForSettlement: true

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        specHelper.defaultGateway.transaction.refund response.transaction.id, '5.00', (err, response) ->
          assert.isNull(err)
          assert.isFalse(response.success)
          assert.equal(response.errors.for('transaction').on('base')[0].code, '91506')

          done()

  describe "submitForSettlement", ->
    it "submits a transaction for settlement", (done) ->
      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        specHelper.defaultGateway.transaction.submitForSettlement response.transaction.id, (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
          assert.equal(response.transaction.status, 'submitted_for_settlement')
          assert.equal(response.transaction.amount, '5.00')

          done()

    it "submits a paypal transaction for settlement", (done) ->
      specHelper.defaultGateway.customer.create {}, (err, response) ->
        paymentMethodParams =
          customerId: response.customer.id
          paymentMethodNonce: Nonces.PayPalFuturePayment

        specHelper.defaultGateway.paymentMethod.create paymentMethodParams, (err, response) ->
          transactionParams =
            amount: '5.00'
            paymentMethodToken: response.paymentMethod.token

          specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
            specHelper.defaultGateway.transaction.submitForSettlement response.transaction.id, (err, response) ->
              assert.isNull(err)
              assert.isTrue(response.success)
              assert.equal(response.transaction.status, 'settling')
              assert.equal(response.transaction.amount, '5.00')

              done()

    it "allows submitting for a partial amount", (done) ->
      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        specHelper.defaultGateway.transaction.submitForSettlement response.transaction.id, '3.00', (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
          assert.equal(response.transaction.status, 'submitted_for_settlement')
          assert.equal(response.transaction.amount, '3.00')

          done()

    it "allows submitting with an order id", (done) ->
      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        specHelper.defaultGateway.transaction.submitForSettlement response.transaction.id, '3.00', {orderId: "ABC123"}, (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
          assert.equal(response.transaction.status, 'submitted_for_settlement')
          assert.equal(response.transaction.orderId, 'ABC123')

          done()

    it "allows submitting with an order id without specifying an amount", (done) ->
      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        specHelper.defaultGateway.transaction.submitForSettlement response.transaction.id, null, {orderId: "ABC123"}, (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
          assert.equal(response.transaction.status, 'submitted_for_settlement')
          assert.equal(response.transaction.orderId, 'ABC123')
          assert.equal(response.transaction.amount, '5.00')

          done()

    it "allows submitting with a descriptor", (done) ->
      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'

      submitForSettlementParams =
        descriptor:
          name: 'abc*def'
          phone: '1234567890'
          url: 'ebay.com'

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        specHelper.defaultGateway.transaction.submitForSettlement response.transaction.id, null, submitForSettlementParams, (err, response) ->
          assert.isTrue(response.success)
          assert.equal(response.transaction.descriptor.name, 'abc*def')
          assert.equal(response.transaction.descriptor.phone, '1234567890')
          assert.equal(response.transaction.descriptor.url, 'ebay.com')

          done()

    it "handles validation errors", (done) ->
      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'
        options:
          submitForSettlement: true

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        specHelper.defaultGateway.transaction.submitForSettlement response.transaction.id, (err, response) ->
          assert.isNull(err)
          assert.isFalse(response.success)
          assert.equal(response.errors.for('transaction').on('base')[0].code, '91507')

          done()

    it "logs deprecation warning when options object contains invalid keys", (done) ->
      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'

      stderr = capture(process.stderr)
      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        specHelper.defaultGateway.transaction.submitForSettlement response.transaction.id, '5.00', {"invalidKey": "1234"}, (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
          assert.equal(response.transaction.status, 'submitted_for_settlement')
          assert.equal(response.transaction.amount, '5.00')
          assert.include(stderr(true), 'deprecated')

          done()

    it "logs deprecation warning when called with too many arguments", (done) ->
      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'

      stderr = capture(process.stderr)
      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        specHelper.defaultGateway.transaction.submitForSettlement response.transaction.id, '5.00', {"orderId": "1234"}, "invalidArg", (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
          assert.equal(response.transaction.status, 'submitted_for_settlement')
          assert.equal(response.transaction.amount, '5.00')
          assert.include(stderr(true), 'deprecated')

          done()

    context "amex rewards", (done) ->
      it "succeeds", (done) ->
        transactionParams =
          merchantAccountId: specHelper.fakeAmexDirectMerchantAccountId
          amount: "10.00"
          creditCard:
            number: CreditCardNumbers.AmexPayWithPoints.Success
            expirationDate: "12/2020"
          options:
            amexRewards:
              requestId: "ABC123"
              points: "1000"
              currencyAmount: "10.00"
              currencyIsoCode: "USD"

        specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
          assert.isTrue(response.success)
          assert.equal(response.transaction.status, Transaction.Status.Authorized)

          specHelper.defaultGateway.transaction.submitForSettlement response.transaction.id, (err, response) ->
            assert.isTrue(response.success)

            done()

      it "succeeds even if the card is ineligible", (done) ->
        transactionParams =
          merchantAccountId: specHelper.fakeAmexDirectMerchantAccountId
          amount: "10.00"
          creditCard:
            number: CreditCardNumbers.AmexPayWithPoints.IneligibleCard
            expirationDate: "12/2020"
          options:
            amexRewards:
              requestId: "ABC123"
              points: "1000"
              currencyAmount: "10.00"
              currencyIsoCode: "USD"

        specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
          assert.isTrue(response.success)
          assert.equal(response.transaction.status, Transaction.Status.Authorized)

          specHelper.defaultGateway.transaction.submitForSettlement response.transaction.id, (err, response) ->
            assert.isTrue(response.success)

            done()

      it "succeeds even if the card's balance is insufficient", (done) ->
        transactionParams =
          merchantAccountId: specHelper.fakeAmexDirectMerchantAccountId
          amount: "10.00"
          creditCard:
            number: CreditCardNumbers.AmexPayWithPoints.InsufficientPoints
            expirationDate: "12/2020"
          options:
            amexRewards:
              requestId: "ABC123"
              points: "1000"
              currencyAmount: "10.00"
              currencyIsoCode: "USD"

        specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
          assert.isTrue(response.success)
          assert.equal(response.transaction.status, Transaction.Status.Authorized)

          specHelper.defaultGateway.transaction.submitForSettlement response.transaction.id, (err, response) ->
            assert.isTrue(response.success)

            done()

  describe "void", ->
    it "voids a transaction", (done) ->
      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        specHelper.defaultGateway.transaction.void response.transaction.id, (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
          assert.equal(response.transaction.status, 'voided')

          done()

    it "voids a paypal transaction", (done) ->
      specHelper.defaultGateway.customer.create {}, (err, response) ->
        paymentMethodParams =
          customerId: response.customer.id
          paymentMethodNonce: Nonces.PayPalFuturePayment

        specHelper.defaultGateway.paymentMethod.create paymentMethodParams, (err, response) ->
          transactionParams =
            amount: '5.00'
            paymentMethodToken: response.paymentMethod.token

          specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
            specHelper.defaultGateway.transaction.void response.transaction.id, (err, response) ->
              assert.isNull(err)
              assert.isTrue(response.success)
              assert.equal(response.transaction.status, 'voided')

              done()

    it "handles validation errors", (done) ->
      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        specHelper.defaultGateway.transaction.void response.transaction.id, (err, response) ->
          specHelper.defaultGateway.transaction.void response.transaction.id, (err, response) ->
            assert.isNull(err)
            assert.isFalse(response.success)
            assert.equal(response.errors.for('transaction').on('base')[0].code, '91504')

            done()

  describe "cloneTransaction", ->
    it "clones a transaction", (done) ->
      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        cloneParams =
          amount: '123.45'
          channel: 'MyShoppingCartProvider'
          options:
            submitForSettlement: 'false'

        specHelper.defaultGateway.transaction.cloneTransaction response.transaction.id, cloneParams, (err, response) ->
          assert.isTrue(response.success)
          transaction = response.transaction
          assert.equal(transaction.amount, '123.45')
          assert.equal(transaction.channel, 'MyShoppingCartProvider')
          assert.equal(transaction.creditCard.maskedNumber, '510510******5100')
          assert.equal(transaction.creditCard.expirationDate, '05/2012')

          done()

    it "handles validation errors", (done) ->
      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'

      specHelper.defaultGateway.transaction.credit transactionParams, (err, response) ->
        specHelper.defaultGateway.transaction.cloneTransaction response.transaction.id, amount: '123.45', (err, response) ->
          assert.isFalse(response.success)
          assert.equal(
            response.errors.for('transaction').on('base')[0].code,
            '91543'
          )

          done()

    it "can submit for settlement", (done) ->
      transactionParams =
        amount: '5.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        cloneParams =
          amount: '123.45'
          channel: 'MyShoppingCartProvider'
          options:
            submitForSettlement: 'true'

        specHelper.defaultGateway.transaction.cloneTransaction response.transaction.id, cloneParams, (err, response) ->
          assert.isTrue(response.success)
          assert.equal(response.transaction.status, 'submitted_for_settlement')
          done()

  describe "submitForPartialSettlement", ->
    it "creates partial settlement transactions for an authorized transaction", (done) ->
      transactionParams =
        amount: '10.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        authorizedTransaction = response.transaction

        specHelper.defaultGateway.transaction.submitForPartialSettlement authorizedTransaction.id, '6.00', (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
          assert.equal(response.transaction.status, 'submitted_for_settlement')
          assert.equal(response.transaction.amount, '6.00')

          specHelper.defaultGateway.transaction.submitForPartialSettlement authorizedTransaction.id, '4.00', (err, response) ->
            assert.isNull(err)
            assert.isTrue(response.success)
            assert.equal(response.transaction.status, 'submitted_for_settlement')
            assert.equal(response.transaction.amount, '4.00')

            specHelper.defaultGateway.transaction.find authorizedTransaction.id, (err, transaction) ->
              assert.isTrue(response.success)
              assert.equal(2, transaction.partialSettlementTransactionIds.length)
              done()

    it "cannot create a partial settlement transaction on a partial settlement transaction", (done) ->
      transactionParams =
        amount: '10.00'
        creditCard:
          number: '5105105105105100'
          expirationDate: '05/12'

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        authorizedTransaction = response.transaction

        specHelper.defaultGateway.transaction.submitForPartialSettlement authorizedTransaction.id, '6.00', (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
          assert.equal(response.transaction.status, 'submitted_for_settlement')
          assert.equal(response.transaction.amount, '6.00')

          specHelper.defaultGateway.transaction.submitForPartialSettlement response.transaction.id, '4.00', (err, response) ->
            assert.isFalse(response.success)
            errorCode = response.errors.for('transaction').on('base')[0].code
            assert.equal(errorCode, ValidationErrorCodes.Transaction.CannotSubmitForPartialSettlement)
            done()

    context "shared payment methods", ->
      address = null
      creditCard = null
      customer = null
      grantingGateway = null

      before (done) ->
        partnerMerchantGateway = braintree.connect {
          merchantId: "integration_merchant_public_id",
          publicKey: "oauth_app_partner_user_public_key",
          privateKey: "oauth_app_partner_user_private_key",
          environment: Environment.Development
        }

        customerParams =
          firstName: "Joe",
          lastName: "Brown",
          company: "ExampleCo",
          email: "joe@example.com",
          phone: "312.555.1234",
          fax: "614.555.5678",
          website: "www.example.com"

        partnerMerchantGateway.customer.create customerParams, (err, response) ->
          customer = response.customer

          creditCardParams =
            customerId: customer.id,
            cardholderName: "Adam Davis",
            number: "4111111111111111",
            expirationDate: "05/2009"

          addressParams =
            customerId: customer.id,
            firstName: "Firsty",
            lastName: "Lasty",

          partnerMerchantGateway.address.create addressParams, (err, response) ->
            address = response.address

            partnerMerchantGateway.creditCard.create creditCardParams, (err, response) ->
              creditCard = response.creditCard

              oauthGateway = braintree.connect {
                clientId: "client_id$development$integration_client_id",
                clientSecret: "client_secret$development$integration_client_secret",
                environment: Environment.Development
              }

              accessTokenParams =
                merchantPublicId: "integration_merchant_id",
                scope: "grant_payment_method,shared_vault_transactions"

              specHelper.createToken oauthGateway, accessTokenParams, (err, response) ->
                grantingGateway = braintree.connect {
                  accessToken: response.credentials.accessToken,
                  environment: Environment.Development
                }
                done()

      it "returns oauth app details on transactions created via nonce granting", (done) ->
        grantingGateway.paymentMethod.grant creditCard.token, false, (err, response) ->

          transactionParams =
            paymentMethodNonce: response.paymentMethodNonce.nonce,
            amount: Braintree.Test.TransactionAmounts.Authorize

          specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
            assert.isTrue response.success
            assert.equal response.transaction.facilitatorDetails.oauthApplicationClientId, "client_id$development$integration_client_id"
            assert.equal response.transaction.facilitatorDetails.oauthApplicationName, "PseudoShop"
            done()

      it "allows transactions to be created with a shared payment method, customer, billing and shipping addresses", (done) ->
        transactionParams =
          shared_payment_method_token: creditCard.token,
          shared_customer_id: customer.id,
          shared_shipping_address_id: address.id,
          shared_billing_address_id: address.id,
          amount: Braintree.Test.TransactionAmounts.Authorize

        grantingGateway.transaction.sale transactionParams, (err, response) ->
          assert.isTrue response.success
          assert.equal response.transaction.shipping.firstName, address.firstName
          assert.equal response.transaction.billing.firstName, address.firstName
          done()
