require('../../spec_helper')
{ValidationErrorCodes} = require('../../../lib/braintree/validation_error_codes')

braintree = specHelper.braintree

describe "MerchantGateway", ->
  describe "create", ->
    it "creates a merchant", (done) ->
      gateway = braintree.connect {
        clientId: 'client_id$development$integration_client_id'
        clientSecret: 'client_secret$development$integration_client_secret'
      }

      gateway.merchant.create {email: 'name@email.com', countryCodeAlpha3: 'USA', paymentMethods: ['credit_card', 'paypal']}, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)

        merchant = response.merchant
        assert.isNotNull(merchant.id)
        assert.equal(merchant.email, 'name@email.com')
        assert.equal(merchant.companyName, 'name@email.com')
        assert.equal(merchant.countryCodeAlpha3, 'USA')
        assert.equal(merchant.countryCodeAlpha2, 'US')
        assert.equal(merchant.countryCodeNumeric, '840')
        assert.equal(merchant.countryName, 'United States of America')

        credentials = response.credentials
        assert.isNotNull(credentials.accessToken)
        assert.equal(credentials.accessToken.indexOf('access_token'), 0)
        assert.isNotNull(credentials.refreshToken)
        assert.isNotNull(credentials.expiresAt)
        assert.equal(credentials.tokenType, 'bearer')

        done()


  it "returns an error when using invalid payment methods", (done) ->
    gateway = braintree.connect {
      clientId: 'client_id$development$integration_client_id'
      clientSecret: 'client_secret$development$integration_client_secret'
    }

    gateway.merchant.create {email: 'name@email.com', countryCodeAlpha3: 'USA', paymentMethods: ['fake_money']}, (err, response) ->

      assert.isNotNull(response.errors)
      assert.isFalse(response.success)

      assert.equal(
        response.errors.for('merchant').on('paymentMethods')[0].code,
        ValidationErrorCodes.Merchant.PaymentMethodsAreInvalid,
      )

      done()
