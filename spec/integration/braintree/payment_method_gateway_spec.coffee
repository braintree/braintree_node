require('../../spec_helper')
_ = require('underscore')._
braintree = specHelper.braintree
util = require('util')
{Config} = require('../../../lib/braintree/config')
{Nonces} = require('../../../lib/braintree/test/nonces')

describe "PaymentMethodGateway", ->
  describe "create", ->
    customerId = null

    context 'with a credit card payment method nonce', ->
      it 'creates a credit card from the nonce', (done) ->
        specHelper.defaultGateway.customer.create {firstName: 'John', lastName: 'Smith'}, (err, response) ->
          customerId = response.customer.id

          specHelper.defaultGateway.clientToken.generate {}, (err, result) ->
            clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken))
            authorizationFingerprint = clientToken.authorizationFingerprint

            params =
              authorizationFingerprint: authorizationFingerprint
              creditCard:
                number: '4111111111111111'
                expirationDate: '01/2020'

            myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))
            myHttp.post "/client_api/v1/payment_methods/credit_cards.json", params, (statusCode, body) ->
              nonce = JSON.parse(body).creditCards[0].nonce

              creditCardParams =
                customerId: customerId
                paymentMethodNonce: nonce

              specHelper.defaultGateway.paymentMethod.create creditCardParams, (err, response) ->
                assert.isNull(err)
                assert.isTrue(response.success)
                assert.equal(response.paymentMethod.maskedNumber, '411111******1111')

                done()

      it 'respects verify_card and verification_merchant_account_id when included outside of the nonce', (done) ->
        specHelper.defaultGateway.customer.create {}, (err, response) ->
          customerId = response.customer.id

          specHelper.defaultGateway.clientToken.generate {}, (err, result) ->
            clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken))
            authorizationFingerprint = clientToken.authorizationFingerprint

            params =
              authorizationFingerprint: authorizationFingerprint
              creditCard:
                number: '4000111111111115'
                expirationMonth: '11'
                expirationYear: '2099'

            myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))
            myHttp.post "/client_api/v1/payment_methods/credit_cards.json", params, (statusCode, body) ->
              nonce = JSON.parse(body).creditCards[0].nonce

              creditCardParams =
                paymentMethodNonce: nonce
                customerId: customerId
                options:
                  verifyCard: "true"
                  verificationMerchantAccountId: specHelper.nonDefaultMerchantAccountId

              specHelper.defaultGateway.paymentMethod.create creditCardParams, (err, response) ->
                assert.isNull(err)
                assert.isFalse(response.success)

                assert.equal(response.verification.status, 'processor_declined')
                assert.equal(response.verification.processorResponseCode, '2000')
                assert.equal(response.verification.processorResponseText, 'Do Not Honor')
                assert.equal(response.verification.merchantAccountId, specHelper.nonDefaultMerchantAccountId)

                done()

      it 'respects failOnDuplicatePaymentMethod when included outside of the nonce', (done) ->
        specHelper.defaultGateway.customer.create {}, (err, response) ->
          customerId = response.customer.id

          creditCardParams =
            customerId: customerId
            number: '4111111111111111'
            expirationDate: '05/2012'

          specHelper.defaultGateway.creditCard.create creditCardParams, (err, response) ->
            assert.isNull(err)
            assert.isTrue(response.success)

          specHelper.defaultGateway.clientToken.generate {}, (err, result) ->
            clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken))
            authorizationFingerprint = clientToken.authorizationFingerprint

            params =
              authorizationFingerprint: authorizationFingerprint
              creditCard:
                number: '4111111111111111'
                expirationDate: '05/2012'

            myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))
            myHttp.post "/client_api/v1/payment_methods/credit_cards.json", params, (statusCode, body) ->
              nonce = JSON.parse(body).creditCards[0].nonce

              creditCardParams =
                customerId: customerId
                paymentMethodNonce: nonce
                options:
                  failOnDuplicatePaymentMethod: 'true'

              specHelper.defaultGateway.paymentMethod.create creditCardParams, (err, response) ->
                assert.isNull(err)
                assert.isFalse(response.success)
                assert.equal(response.errors.deepErrors()[0].code, '81724')

                done()

      it 'allows passing the billing address outside of the nonce', (done) ->
        specHelper.defaultGateway.customer.create {}, (err, response) ->
          customerId = response.customer.id

          specHelper.defaultGateway.clientToken.generate {}, (err, result) ->
            clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken))
            authorizationFingerprint = clientToken.authorizationFingerprint

            params =
              authorizationFingerprint: authorizationFingerprint
              creditCard:
                number: '4111111111111111'
                expirationMonth: '12'
                expirationYear: '2020'
                options:
                  validate: 'false'

            myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))
            myHttp.post "/client_api/v1/payment_methods/credit_cards.json", params, (statusCode, body) ->
              nonce = JSON.parse(body).creditCards[0].nonce

              creditCardParams =
                paymentMethodNonce: nonce
                customerId: customerId
                billingAddress:
                  streetAddress: "123 Abc Way"

              specHelper.defaultGateway.paymentMethod.create creditCardParams, (err, response) ->
                assert.isNull(err)
                assert.isTrue(response.success)

                assert.isTrue(response.paymentMethod.constructor.name == "CreditCard")
                token = response.paymentMethod.token
                specHelper.defaultGateway.paymentMethod.find token, (err, creditCard) ->
                  assert.isNull(err)
                  assert.isTrue(creditCard != null)
                  assert.equal(creditCard.billingAddress.streetAddress, "123 Abc Way")

                  done()

      it 'overrides the billing address in the nonce', (done) ->
        specHelper.defaultGateway.customer.create {}, (err, response) ->
          customerId = response.customer.id

          specHelper.defaultGateway.clientToken.generate {}, (err, result) ->
            clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken))
            authorizationFingerprint = clientToken.authorizationFingerprint

            params =
              authorizationFingerprint: authorizationFingerprint
              creditCard:
                number: '4111111111111111'
                expirationMonth: '12'
                expirationYear: '2020'
                options:
                  validate: 'false'
                billingAddress:
                  streetAddress: "456 Xyz Way"

            myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))
            myHttp.post "/client_api/v1/payment_methods/credit_cards.json", params, (statusCode, body) ->
              nonce = JSON.parse(body).creditCards[0].nonce

              creditCardParams =
                paymentMethodNonce: nonce
                customerId: customerId
                billingAddress:
                  streetAddress: "123 Abc Way"

              specHelper.defaultGateway.paymentMethod.create creditCardParams, (err, response) ->
                assert.isNull(err)
                assert.isTrue(response.success)

                assert.isTrue(response.paymentMethod.constructor.name == "CreditCard")
                token = response.paymentMethod.token
                specHelper.defaultGateway.paymentMethod.find token, (err, creditCard) ->
                  assert.isNull(err)
                  assert.isTrue(creditCard != null)
                  assert.equal(creditCard.billingAddress.streetAddress, "123 Abc Way")

                  done()

      it 'does not override the billing address for a vaulted credit card', (done) ->
        specHelper.defaultGateway.customer.create {}, (err, response) ->
          customerId = response.customer.id

          specHelper.defaultGateway.clientToken.generate {customerId: customerId}, (err, result) ->
            clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken))
            authorizationFingerprint = clientToken.authorizationFingerprint

            params =
              authorizationFingerprint: authorizationFingerprint
              creditCard:
                number: '4111111111111111'
                expirationMonth: '12'
                expirationYear: '2020'
                billingAddress:
                  streetAddress: "456 Xyz Way"

            myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))
            myHttp.post "/client_api/v1/payment_methods/credit_cards.json", params, (statusCode, body) ->
              assert.equal(statusCode, "201")
              nonce = JSON.parse(body).creditCards[0].nonce

              creditCardParams =
                paymentMethodNonce: nonce
                customerId: customerId
                billingAddress:
                  streetAddress: "123 Abc Way"

              specHelper.defaultGateway.paymentMethod.create creditCardParams, (err, response) ->
                assert.isNull(err)
                assert.isTrue(response.success)

                assert.isTrue(response.paymentMethod.constructor.name == "CreditCard")
                token = response.paymentMethod.token
                specHelper.defaultGateway.paymentMethod.find token, (err, creditCard) ->
                  assert.isNull(err)
                  assert.isTrue(creditCard != null)
                  assert.equal(creditCard.billingAddress.streetAddress, "456 Xyz Way")

                  done()

      it 'allows passing a billing address id outside of the nonce', (done) ->
        specHelper.defaultGateway.customer.create {}, (err, response) ->
          customerId = response.customer.id

          specHelper.defaultGateway.clientToken.generate {}, (err, result) ->
            clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken))
            authorizationFingerprint = clientToken.authorizationFingerprint

            params =
              authorizationFingerprint: authorizationFingerprint
              creditCard:
                number: '4111111111111111'
                expirationMonth: '12'
                expirationYear: '2020'
                options:
                  validate: 'false'

            myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))
            myHttp.post "/client_api/v1/payment_methods/credit_cards.json", params, (statusCode, body) ->
              nonce = JSON.parse(body).creditCards[0].nonce

              addressParams =
                customerId: customerId
                firstName: "Bobby"
                lastName: "Tables"

              specHelper.defaultGateway.address.create addressParams, (err, response) ->
                assert.isNull(err)
                assert.isTrue(response.success)

                creditCardParams =
                  paymentMethodNonce: nonce
                  customerId: customerId
                  billingAddressId: response.address.id

                specHelper.defaultGateway.paymentMethod.create creditCardParams, (err, response) ->
                  assert.isNull(err)
                  assert.isTrue(response.success)

                  assert.isTrue(response.paymentMethod.constructor.name == "CreditCard")
                  token = response.paymentMethod.token
                  specHelper.defaultGateway.paymentMethod.find token, (err, creditCard) ->
                    assert.isNull(err)
                    assert.isTrue(creditCard != null)
                    assert.equal(creditCard.billingAddress.firstName, "Bobby")
                    assert.equal(creditCard.billingAddress.lastName, "Tables")

                    done()

    context 'with a paypal account payment method nonce', ->
      before (done) ->
        specHelper.defaultGateway.customer.create {firstName: 'John', lastName: 'Smith'}, (err, response) ->
          customerId = response.customer.id
          done()

      it 'does not return an error if credit card options are present for a paypal nonce', (done) ->
        specHelper.defaultGateway.customer.create {}, (err, response) ->
          customerId = response.customer.id

          specHelper.defaultGateway.clientToken.generate {}, (err, result) ->
            clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken))
            authorizationFingerprint = clientToken.authorizationFingerprint

            params =
              authorizationFingerprint: authorizationFingerprint
              paypalAccount:
                consentCode: 'consent-code'

            myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))
            myHttp.post "/client_api/v1/payment_methods/paypal_accounts.json", params, (statusCode, body) ->
              nonce = JSON.parse(body).paypalAccounts[0].nonce

              paypalAccountParams =
                paymentMethodNonce: nonce
                customerId: customerId
                options:
                  verifyCard: "true"
                  failOnDuplicatePaymentMethod: "true"
                  verificationMerchantAccountId: "notARealMerchantAccountId"

              specHelper.defaultGateway.paymentMethod.create paypalAccountParams, (err, response) ->
                assert.isNull(err)
                assert.isTrue(response.success)

                assert.equal(response.paymentMethod.constructor.name, "PayPalAccount")
                assert.isTrue(response.paymentMethod.imageUrl != null)
                token = response.paymentMethod.token
                specHelper.defaultGateway.paymentMethod.find token, (err, paypalAccount) ->
                  assert.isNull(err)
                  assert.isTrue(paypalAccount != null)

                  done()

      it 'ignores passed billing address params', (done) ->
        specHelper.defaultGateway.customer.create {}, (err, response) ->
          customerId = response.customer.id

          specHelper.defaultGateway.clientToken.generate {}, (err, result) ->
            clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken))
            authorizationFingerprint = clientToken.authorizationFingerprint

            params =
              authorizationFingerprint: authorizationFingerprint
              paypalAccount:
                consentCode: 'PAYPAL_CONSENT_CODE'

            myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))
            myHttp.post "/client_api/v1/payment_methods/paypal_accounts.json", params, (statusCode, body) ->
              nonce = JSON.parse(body).paypalAccounts[0].nonce

              paypalAccountParams =
                paymentMethodNonce: nonce
                customerId: customerId
                billingAddress:
                  streetAddress: "123 Abc Way"

              specHelper.defaultGateway.paymentMethod.create paypalAccountParams, (err, response) ->
                assert.isNull(err)
                assert.isTrue(response.success)

                assert.equal(response.paymentMethod.constructor.name, "PayPalAccount")
                assert.isTrue(response.paymentMethod.imageUrl != null)
                token = response.paymentMethod.token
                specHelper.defaultGateway.paymentMethod.find token, (err, paypalAccount) ->
                  assert.isNull(err)
                  assert.isTrue(paypalAccount != null)

                  done()

      it 'ignores passed billing address id', (done) ->
        specHelper.defaultGateway.customer.create {}, (err, response) ->
          customerId = response.customer.id

          specHelper.defaultGateway.clientToken.generate {}, (err, result) ->
            clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken))
            authorizationFingerprint = clientToken.authorizationFingerprint

            params =
              authorizationFingerprint: authorizationFingerprint
              paypalAccount:
                consentCode: 'PAYPAL_CONSENT_CODE'

            myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))
            myHttp.post "/client_api/v1/payment_methods/paypal_accounts.json", params, (statusCode, body) ->
              nonce = JSON.parse(body).paypalAccounts[0].nonce

              paypalAccountParams =
                paymentMethodNonce: nonce
                customerId: customerId
                billingAddressId: "address_id"

              specHelper.defaultGateway.paymentMethod.create paypalAccountParams, (err, response) ->
                assert.isNull(err)
                assert.isTrue(response.success)

                assert.equal(response.paymentMethod.constructor.name, "PayPalAccount")
                assert.isTrue(response.paymentMethod.imageUrl != null)
                token = response.paymentMethod.token
                specHelper.defaultGateway.paymentMethod.find token, (err, paypalAccount) ->
                  assert.isNull(err)
                  assert.isTrue(paypalAccount != null)

                  done()

    it "creates a paypal account from a payment method nonce", (done) ->
      specHelper.defaultGateway.customer.create {}, (err, response) ->
        customerId = response.customer.id
        specHelper.defaultGateway.clientToken.generate {}, (err, result) ->
          clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken))
          authorizationFingerprint = clientToken.authorizationFingerprint

          params =
            authorizationFingerprint: authorizationFingerprint
            paypalAccount:
              consentCode: 'PAYPAL_CONSENT_CODE'

          myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))
          myHttp.post "/client_api/v1/payment_methods/paypal_accounts.json", params, (statusCode, body) ->
            nonce = JSON.parse(body).paypalAccounts[0].nonce
            paypalAccountParams =
              customerId: customerId
              paymentMethodNonce: nonce

            specHelper.defaultGateway.paymentMethod.create paypalAccountParams, (err, response) ->
              assert.isNull(err)
              assert.isTrue(response.success)
              assert.isString(response.paymentMethod.email)
              assert.isString(response.paymentMethod.imageUrl)
              done()

    it "can create a payment method and set the token and default", (done) ->
      specHelper.defaultGateway.customer.create {}, (err, response) ->
        creditCardParams =
          customerId: response.customer.id
          number: '5105105105105100'
          expirationDate: '05/2012'

        specHelper.defaultGateway.creditCard.create creditCardParams, (err, response) ->
          specHelper.defaultGateway.clientToken.generate {}, (err, result) ->
            clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken))
            authorizationFingerprint = clientToken.authorizationFingerprint

            params =
              authorizationFingerprint: authorizationFingerprint
              creditCard:
                number: '4111111111111111'
                expirationDate: '01/2020'

            myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))
            myHttp.post "/client_api/v1/payment_methods/credit_cards.json", params, (statusCode, body) ->
              nonce = JSON.parse(body).creditCards[0].nonce

              paymentMethodToken = specHelper.randomId()
              creditCardParams =
                customerId: customerId
                paymentMethodNonce: nonce
                token: paymentMethodToken
                options:
                  makeDefault: true

              specHelper.defaultGateway.paymentMethod.create creditCardParams, (err, response) ->
                assert.isNull(err)
                assert.isTrue(response.success)
                assert.isTrue(response.paymentMethod.default)
                assert.equal(paymentMethodToken, response.paymentMethod.token)

                done()

    it "returns an error when trying to create a paypal account only authorized for one-time use", (done) ->
      specHelper.defaultGateway.customer.create {}, (err, response) ->
        customerId = response.customer.id

        specHelper.defaultGateway.clientToken.generate {}, (err, result) ->
          clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken))
          authorizationFingerprint = clientToken.authorizationFingerprint

          params = {
            authorizationFingerprint: authorizationFingerprint,
            paypalAccount: {
              accessToken: 'PAYPAL_ACCESS_TOKEN'
            }
          }

          myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))
          myHttp.post "/client_api/v1/payment_methods/paypal_accounts.json", params, (statusCode, body) ->
            nonce = JSON.parse(body).paypalAccounts[0].nonce
            paypalAccountParams =
              customerId: customerId
              paymentMethodNonce: nonce

            specHelper.defaultGateway.paymentMethod.create paypalAccountParams, (err, response) ->
              assert.isNull(err)
              assert.isFalse(response.success)
              assert.equal(
                response.errors.for('paypalAccount').on('base')[0].code,
                '82902'
              )

              done()

    it "handles errors", (done) ->
      specHelper.defaultGateway.customer.create {}, (err, response) ->
        customerId = response.customer.id

        specHelper.defaultGateway.clientToken.generate {}, (err, result) ->
          clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken))
          authorizationFingerprint = clientToken.authorizationFingerprint

          params = {
            authorizationFingerprint: authorizationFingerprint,
            paypalAccount: {}
          }

          myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))
          myHttp.post "/client_api/v1/payment_methods/paypal_accounts.json", params, (statusCode, body) ->
            nonce = JSON.parse(body).paypalAccounts[0].nonce
            paypalAccountParams =
              customerId: customerId
              paymentMethodNonce: nonce

            specHelper.defaultGateway.paymentMethod.create paypalAccountParams, (err, response) ->
              assert.isFalse(response.success)
              assert.equal(response.errors.for('paypalAccount').on('base')[0].code, '82902')

              done()

  describe "find", ->
    context 'credit card', ->
      paymentMethodToken = null

      before (done) ->
        specHelper.defaultGateway.customer.create {firstName: 'John', lastName: 'Smith'}, (err, response) ->
          customerId = response.customer.id
          paymentMethodToken = specHelper.randomId()

          specHelper.defaultGateway.clientToken.generate {}, (err, result) ->
            clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken))
            authorizationFingerprint = clientToken.authorizationFingerprint
            params =
              authorizationFingerprint: authorizationFingerprint
              creditCard:
                token: paymentMethodToken
                number: '4111111111111111'
                expirationDate: '01/2020'

            myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))
            myHttp.post "/client_api/v1/payment_methods/credit_cards.json", params, (statusCode, body) ->
              nonce = JSON.parse(body).creditCards[0].nonce
              paymentMethodParams =
                customerId: customerId
                paymentMethodNonce: nonce
              specHelper.defaultGateway.paymentMethod.create paymentMethodParams, (err, creditCard) ->
                done()

      it 'finds the card', (done) ->
        specHelper.defaultGateway.paymentMethod.find paymentMethodToken, (err, creditCard) ->
          assert.isNull(err)
          assert.equal(creditCard.maskedNumber, '411111******1111')

          done()

    context 'paypal account', ->
      it "finds the paypal account", (done) ->
        specHelper.defaultGateway.customer.create {}, (err, response) ->
          paymentMethodParams =
            customerId: response.customer.id
            paymentMethodNonce: Nonces.PayPalFuturePayment

          specHelper.defaultGateway.paymentMethod.create paymentMethodParams, (err, response) ->
            paymentMethodToken = response.paymentMethod.token
            specHelper.defaultGateway.paymentMethod.find paymentMethodToken, (err, paypalAccount) ->
              assert.isNull(err)
              assert.isString(paypalAccount.email)

              done()

   it "handles not finding the paypal account", (done) ->
     specHelper.defaultGateway.paymentMethod.find 'NON_EXISTENT_TOKEN', (err, paypalAccount) ->
       assert.equal(err.type, braintree.errorTypes.notFoundError)

       done()

   it "handles whitespace", (done) ->
      specHelper.defaultGateway.paymentMethod.find ' ', (err, paypalAccount) ->
        assert.equal(err.type, braintree.errorTypes.notFoundError)

        done()

  describe "update", ->
    context 'credit card', ->

      it "updates the credit card", (done) ->
        specHelper.defaultGateway.customer.create {}, (err, response) ->
          customerId = response.customer.id

          creditCardParams =
            cardholderName: 'Original Holder'
            customerId: customerId
            cvv: '123'
            number: '4012888888881881'
            expirationDate: '05/2012'

          specHelper.defaultGateway.creditCard.create creditCardParams, (err, response) ->
            assert.isTrue(response.success)

            creditCard = response.creditCard

            updateParams =
              cardholderName: 'New Holder'
              cvv: '456'
              number: '5555555555554444'
              expirationDate: '06/2013'

            specHelper.defaultGateway.paymentMethod.update creditCard.token, updateParams, (err, response) ->
              assert.isNull(err)
              assert.isTrue(response.success)
              assert.equal(response.paymentMethod.token, creditCard.token)
              updatedCreditCard = response.paymentMethod
              assert.equal(updatedCreditCard.cardholderName, 'New Holder')
              assert.equal(updatedCreditCard.bin, '555555')
              assert.equal(updatedCreditCard.last4, '4444')
              assert.equal(updatedCreditCard.expirationDate, '06/2013')

              done()

      it "handles a not found error correctly", (done) ->
        specHelper.defaultGateway.customer.create {}, (err, response) ->
          customerId = response.customer.id
          updateParams =
            cardholderName: 'New Holder'
            cvv: '456'
            number: '5555555555554444'
            expirationDate: '06/2013'

          specHelper.defaultGateway.paymentMethod.update "doesNotExist", updateParams, (err, response) ->
            assert.isNull(response)
            assert.isNotNull(err)
            done()

      it "can pass expirationMonth and expirationYear", (done) ->
        specHelper.defaultGateway.customer.create {}, (err, response) ->
          customerId = response.customer.id

          creditCardParams =
            customerId: customerId
            number: '4012888888881881'
            expirationDate: '05/2012'

          specHelper.defaultGateway.creditCard.create creditCardParams, (err, response) ->
            assert.isTrue(response.success)

            creditCard = response.creditCard

            updateParams =
              expirationMonth: '07'
              expirationYear: '2011'

            specHelper.defaultGateway.paymentMethod.update creditCard.token, updateParams, (err, response) ->
              assert.isNull(err)
              assert.isTrue(response.success)
              updatedCreditCard = response.paymentMethod
              assert.equal(updatedCreditCard.expirationMonth, '07')
              assert.equal(updatedCreditCard.expirationYear, '2011')
              assert.equal(updatedCreditCard.expirationDate, '07/2011')

              done()

      it "verifies the update if options[verify_card]=true", (done) ->
        specHelper.defaultGateway.customer.create {}, (err, response) ->
          customerId = response.customer.id

          creditCardParams =
            cardholderName: 'Original Holder'
            customerId: customerId
            cvv: '123'
            number: '4012888888881881'
            expirationDate: '05/2012'

          specHelper.defaultGateway.creditCard.create creditCardParams, (err, response) ->
            assert.isTrue(response.success)

            creditCard = response.creditCard

            updateParams =
              cardholderName: 'New Holder'
              cvv: '456'
              number: '5105105105105100'
              expirationDate: '06/2013'
              options:
                verifyCard: 'true'

            specHelper.defaultGateway.paymentMethod.update creditCard.token, updateParams, (err, response) ->
              assert.isFalse(response.success)
              assert.equal(response.verification.status, 'processor_declined')
              assert.isNull(response.verification.gatewayRejectionReason)

              done()

      it "returns an error if invalid", (done) ->
        specHelper.defaultGateway.customer.create {}, (err, response) ->
          customerId = response.customer.id

          creditCardParams =
            cardholderName: 'Original Holder'
            customerId: customerId
            number: '4012888888881881'
            expirationDate: '05/2012'

          specHelper.defaultGateway.creditCard.create creditCardParams, (err, response) ->
            assert.isTrue(response.success)

            creditCard = response.creditCard

            updateParams =
              cardholderName: 'New Holder'
              number: 'invalid'
              expirationDate: '05/2014'

            specHelper.defaultGateway.paymentMethod.update creditCard.token, updateParams, (err, response) ->
              assert.isFalse(response.success)
              assert.equal(response.errors.for('creditCard').on('number')[0].message, "Credit card number must be 12-19 digits.")

              done()

      it "can update the default", (done) ->
        specHelper.defaultGateway.customer.create {}, (err, response) ->
          customerId = response.customer.id

          creditCardParams =
            customerId: customerId
            number: '4012888888881881'
            expirationDate: '05/2009'

          specHelper.defaultGateway.creditCard.create creditCardParams, (err, response) ->
            assert.isTrue(response.success)

            creditCard1 = response.creditCard

            specHelper.defaultGateway.creditCard.create creditCardParams, (err, response) ->
              assert.isTrue(response.success)

              creditCard2 = response.creditCard

              assert.isTrue(creditCard1.default)
              assert.isFalse(creditCard2.default)

              updateParams =
                options:
                  makeDefault: 'true'

              specHelper.defaultGateway.paymentMethod.update creditCard2.token, updateParams, (err, response) ->
                assert.isNull(err)
                assert.isTrue(response.success)
                specHelper.defaultGateway.paymentMethod.find creditCard1.token, (err, creditCard) ->
                  assert.isNull(err)
                  assert.isFalse(creditCard.default)

                specHelper.defaultGateway.paymentMethod.find creditCard2.token, (err, creditCard) ->
                  assert.isNull(err)
                  assert.isTrue(creditCard.default)

                done()

      context 'billing address', ->
        it "creates a new billing address by default", (done) ->
          specHelper.defaultGateway.customer.create {}, (err, response) ->
            customerId = response.customer.id

            creditCardParams =
              customerId: customerId
              number: '4012888888881881'
              expirationDate: '05/2012'
              billingAddress:
                streetAddress: "123 Nigeria Ave"

            specHelper.defaultGateway.creditCard.create creditCardParams, (err, response) ->
              assert.isTrue(response.success)

              creditCard = response.creditCard

              updateParams =
                billingAddress:
                  region: "IL"

              specHelper.defaultGateway.paymentMethod.update creditCard.token, updateParams, (err, response) ->
                assert.isNull(err)
                assert.isTrue(response.success)
                updatedCreditCard = response.paymentMethod
                assert.equal(updatedCreditCard.billingAddress.region, 'IL')
                assert.isNull(updatedCreditCard.billingAddress.streetAddress)
                differentAddresses = (updatedCreditCard.billingAddress.id != creditCard.billingAddress.id)
                assert.isTrue(differentAddresses)

                done()

        it "updates the billing address if option is specified", (done) ->
          specHelper.defaultGateway.customer.create {}, (err, response) ->
            customerId = response.customer.id

            creditCardParams =
              customerId: customerId
              number: '4012888888881881'
              expirationDate: '05/2012'
              billingAddress:
                streetAddress: "123 Nigeria Ave"

            specHelper.defaultGateway.creditCard.create creditCardParams, (err, response) ->
              assert.isTrue(response.success)

              creditCard = response.creditCard

              updateParams =
                billingAddress:
                  options:
                    updateExisting: 'true'
                  region: "IL"

              specHelper.defaultGateway.paymentMethod.update creditCard.token, updateParams, (err, response) ->
                assert.isNull(err)
                assert.isTrue(response.success)
                updatedCreditCard = response.paymentMethod
                assert.equal(updatedCreditCard.billingAddress.region, 'IL')
                assert.equal(updatedCreditCard.billingAddress.streetAddress, '123 Nigeria Ave')
                sameAddresses = (updatedCreditCard.billingAddress.id == creditCard.billingAddress.id)
                assert.isTrue(sameAddresses)

                done()

        it "updates the country via codes", (done) ->
          specHelper.defaultGateway.customer.create {}, (err, response) ->
            customerId = response.customer.id

            creditCardParams =
              customerId: customerId
              number: '4012888888881881'
              expirationDate: '05/2012'
              billingAddress:
                streetAddress: "123 Nigeria Ave"

            specHelper.defaultGateway.creditCard.create creditCardParams, (err, response) ->
              assert.isTrue(response.success)

              creditCard = response.creditCard

              updateParams =
                billingAddress:
                  countryName: "American Samoa"
                  countryCodeAlpha2: "AS"
                  countryCodeAlpha3: "ASM"
                  countryCodeNumeric: "016"
                  options:
                    updateExisting: 'true'

              specHelper.defaultGateway.paymentMethod.update creditCard.token, updateParams, (err, response) ->
                assert.isNull(err)
                assert.isTrue(response.success)
                updatedCreditCard = response.paymentMethod
                assert.equal(updatedCreditCard.billingAddress.countryName, 'American Samoa')
                assert.equal(updatedCreditCard.billingAddress.countryCodeAlpha2, 'AS')
                assert.equal(updatedCreditCard.billingAddress.countryCodeAlpha3, 'ASM')
                assert.equal(updatedCreditCard.billingAddress.countryCodeNumeric, '016')

                done()

        it "can update the billing address", (done) ->
          specHelper.defaultGateway.customer.create {}, (err, response) ->
            customerId = response.customer.id

            creditCardParams =
              cardholder_name: 'Original Holder'
              customerId: customerId
              cvv: '123'
              number: '4012888888881881'
              expirationDate: '05/2012'
              billingAddress:
                firstName: "Old First Name"
                lastName: "Old Last Name"
                Company: "Old Company"
                streetAddress: "123 Old St"
                extendedAddress: "Apt Old"
                locality: "Old City"
                region: "Old State"
                postalCode: "12345"
                countryName: "Canada"

            specHelper.defaultGateway.creditCard.create creditCardParams, (err, response) ->
              assert.isTrue(response.success)

              creditCard = response.creditCard

              updateParams =
                options:
                  verifyCard: 'false'
                billingAddress:
                  firstName: "New First Name"
                  lastName: "New Last Name"
                  company: "New Company"
                  streetAddress: "123 New St"
                  extendedAddress: "Apt New"
                  locality: "New City"
                  region: "New State"
                  postalCode: "56789"
                  countryName: "United States of America"

              specHelper.defaultGateway.paymentMethod.update creditCard.token, updateParams, (err, response) ->
                assert.isNull(err)
                assert.isTrue(response.success)
                address = response.paymentMethod.billingAddress
                assert.equal(address.firstName, "New First Name")
                assert.equal(address.lastName, "New Last Name")
                assert.equal(address.company, "New Company")
                assert.equal(address.streetAddress, "123 New St")
                assert.equal(address.extendedAddress, "Apt New")
                assert.equal(address.locality, "New City")
                assert.equal(address.region, "New State")
                assert.equal(address.postalCode, "56789")
                assert.equal(address.countryName, "United States of America")

                done()

    context 'paypal accounts', ->

      it "updates a paypal account's token", (done) ->
        specHelper.defaultGateway.customer.create {}, (err, response) ->
          customerId = response.customer.id
          originalToken = "paypal-account-#{specHelper.randomId()}"

          specHelper.defaultGateway.clientToken.generate {}, (err, result) ->
            clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken))
            authorizationFingerprint = clientToken.authorizationFingerprint

            params =
              authorizationFingerprint: authorizationFingerprint
              paypalAccount:
                consentCode: 'consent-code'
                token: originalToken

            myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))
            myHttp.post "/client_api/v1/payment_methods/paypal_accounts.json", params, (statusCode, body) ->
              nonce = JSON.parse(body).paypalAccounts[0].nonce
              paypalAccountParams =
                paymentMethodNonce: nonce
                customerId: customerId

              specHelper.defaultGateway.paymentMethod.create paypalAccountParams, (err, response) ->
                assert.isNull(err)
                assert.isTrue(response.success)

                originalResult = response.paymentMethod

                updatedToken = "UPDATED-TOKEN-#{specHelper.randomId()}"

                updateParams =
                  token: updatedToken

                specHelper.defaultGateway.paymentMethod.update originalToken, updateParams, (err, response) ->
                  assert.isNull(err)
                  assert.isTrue(response.success)

                  specHelper.defaultGateway.paypalAccount.find updatedToken, (err, paypalAccount) ->
                    assert.isNull(err)

                    assert.equal(paypalAccount.email, originalResult.email)

                    specHelper.defaultGateway.paypalAccount.find originalToken, (err, paypalAccount) ->
                      assert.isNull(paypalAccount)
                      assert.equal(err.type, braintree.errorTypes.notFoundError)

                      done()

      it "can make a paypal account the default payment method", (done) ->
        specHelper.defaultGateway.customer.create {}, (err, response) ->
          customerId = response.customer.id

          creditCardParams =
            cardholderName: 'Original Holder'
            customerId: customerId
            number: '4012888888881881'
            expirationDate: '05/2009'
            options:
              makeDefault: 'true'

          specHelper.defaultGateway.creditCard.create creditCardParams, (err, response) ->
            assert.isTrue(response.success)

            creditCard = response.creditCard

            specHelper.defaultGateway.clientToken.generate {}, (err, result) ->
              clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken))
              authorizationFingerprint = clientToken.authorizationFingerprint

              params =
                authorizationFingerprint: authorizationFingerprint
                paypalAccount:
                  consentCode: 'consent-code'

              myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))
              myHttp.post "/client_api/v1/payment_methods/paypal_accounts.json", params, (statusCode, body) ->
                nonce = JSON.parse(body).paypalAccounts[0].nonce
                paypalAccountParams =
                  paymentMethodNonce: nonce
                  customerId: customerId

                specHelper.defaultGateway.paymentMethod.create paypalAccountParams, (err, response) ->
                  assert.isNull(err)
                  assert.isTrue(response.success)

                  originalToken = response.paymentMethod.token

                  assert.isFalse(response.paymentMethod.default)

                  updateParams =
                    options:
                      makeDefault: 'true'

                  specHelper.defaultGateway.paymentMethod.update originalToken, updateParams, (err, response) ->
                    assert.isNull(err)
                    assert.isTrue(response.success)

                    specHelper.defaultGateway.paypalAccount.find originalToken, (err, paypalAccount) ->
                      assert.isTrue(paypalAccount.default)

                      specHelper.defaultGateway.creditCard.find creditCard.token, (err, creditCard) ->
                        assert.isFalse(creditCard.default)

                        done()

      it "returns an error if a token for account is used to attempt an update", (done) ->
        specHelper.defaultGateway.customer.create {}, (err, response) ->
          customerId = response.customer.id
          firstToken = "paypal-account-#{specHelper.randomId()}"
          secondToken = "paypal-account-#{specHelper.randomId()}"

          specHelper.defaultGateway.clientToken.generate {}, (err, result) ->
            clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken))
            authorizationFingerprint = clientToken.authorizationFingerprint

            params =
              authorizationFingerprint: authorizationFingerprint
              paypalAccount:
                consentCode: 'consent-code'
                token: firstToken

            myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))
            myHttp.post "/client_api/v1/payment_methods/paypal_accounts.json", params, (statusCode, body) ->
              firstNonce = JSON.parse(body).paypalAccounts[0].nonce
              paypalAccountParams =
                paymentMethodNonce: firstNonce
                customerId: customerId

              specHelper.defaultGateway.paymentMethod.create paypalAccountParams, (err, response) ->
                assert.isNull(err)
                assert.isTrue(response.success)

                firstResult = response.paymentMethod

                params =
                  authorizationFingerprint: authorizationFingerprint
                  paypalAccount:
                    consentCode: 'consent-code'
                    token: secondToken

                myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))
                myHttp.post "/client_api/v1/payment_methods/paypal_accounts.json", params, (statusCode, body) ->
                  secondNonce = JSON.parse(body).paypalAccounts[0].nonce
                  paypalAccountParams =
                    paymentMethodNonce: secondNonce
                    customerId: customerId

                  specHelper.defaultGateway.paymentMethod.create paypalAccountParams, (err, response) ->
                    assert.isNull(err)
                    assert.isTrue(response.success)

                    secondResult = response.paymentMethod

                    updateParams =
                      token: secondToken

                    specHelper.defaultGateway.paymentMethod.update firstToken, updateParams, (err, response) ->
                      assert.isNull(err)
                      assert.isFalse(response.success)

                      assert.equal(response.errors.deepErrors()[0].code, "92906")

                      done()

  describe "delete", (done) ->
    paymentMethodToken = null

    context 'credit card', ->
      before (done) ->
        specHelper.defaultGateway.customer.create {}, (err, response) ->
          customerId = response.customer.id

          specHelper.defaultGateway.clientToken.generate {}, (err, result) ->
            clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken))
            authorizationFingerprint = clientToken.authorizationFingerprint
            params =
              authorizationFingerprint: authorizationFingerprint
              creditCard:
                number: '4111111111111111'
                expirationDate: '01/2020'

            myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))
            myHttp.post "/client_api/v1/payment_methods/credit_cards.json", params, (statusCode, body) ->
              nonce = JSON.parse(body).creditCards[0].nonce
              paymentMethodParams =
                customerId: customerId
                paymentMethodNonce: nonce
              specHelper.defaultGateway.paymentMethod.create paymentMethodParams, (err, response) ->
                paymentMethodToken = response.paymentMethod.token
                done()

      it 'deletes the credit card', (done) ->
        specHelper.defaultGateway.paymentMethod.delete paymentMethodToken, (err) ->
          assert.isNull(err)

          specHelper.defaultGateway.paymentMethod.find paymentMethodToken, (err, response) ->
            assert.equal(err.type, braintree.errorTypes.notFoundError)
            done()

    context 'paypal account', ->
      before (done) ->
        specHelper.defaultGateway.customer.create {}, (err, response) ->
          customerId = response.customer.id

          specHelper.defaultGateway.clientToken.generate {}, (err, result) ->
            clientToken = JSON.parse(specHelper.decodeClientToken(result.clientToken))
            authorizationFingerprint = clientToken.authorizationFingerprint

            params =
              authorizationFingerprint: authorizationFingerprint
              paypalAccount:
                consentCode: 'PAYPAL_CONSENT_CODE'

            myHttp = new specHelper.clientApiHttp(new Config(specHelper.defaultConfig))
            myHttp.post "/client_api/v1/payment_methods/paypal_accounts.json", params, (statusCode, body) ->
              nonce = JSON.parse(body).paypalAccounts[0].nonce
              paypalAccountParams =
                customerId: customerId
                paymentMethodNonce: nonce

              specHelper.defaultGateway.paymentMethod.create paypalAccountParams, (err, response) ->
                paymentMethodToken = response.paymentMethod.token
                done()


      it "deletes the paypal account", (done) ->
        specHelper.defaultGateway.paymentMethod.delete paymentMethodToken, (err) ->
          assert.isNull(err)

          specHelper.defaultGateway.paypalAccount.find paymentMethodToken, (err, response) ->
            assert.equal(err.type, braintree.errorTypes.notFoundError)
            done()

    it "handles invalid tokens", (done) ->
      specHelper.defaultGateway.paymentMethod.delete 'NONEXISTENT_TOKEN', (err) ->
        assert.equal(err.type, braintree.errorTypes.notFoundError)

        done()

