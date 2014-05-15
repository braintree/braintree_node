require('../../spec_helper')
_ = require('underscore')._
braintree = specHelper.braintree
util = require('util')
{PayPalAccount} = require('../../../lib/braintree/paypal_account')
{Config} = require('../../../lib/braintree/config')

describe "PayPalGatewayGateway", ->
  describe "find", ->
    it "finds the paypal account", (done) ->
      specHelper.paypalMerchantGateway.paypalAccount.find 'PAYPAL_ACCOUNT', (err, paypalAccount) ->
        assert.isNull(err)
        assert.isNotNull(paypalAccount.email)

        done()

    it "handles not finding the card"#, (done) ->
      # specHelper.defaultGateway.creditCard.find 'nonexistent_token', (err, creditCard) ->
      #   assert.equal(err.type, braintree.errorTypes.notFoundError)

      #   done()

    it "handles whitespace"#, (done) ->
      # specHelper.defaultGateway.creditCard.find ' ', (err, creditCard) ->
      #   assert.equal(err.type, braintree.errorTypes.notFoundError)

      #   done()

  describe "update", ->
    creditCardToken = null

    # before (done) ->
      # customerParams =
      #   creditCard:
      #     cardholderName: 'Old Cardholder Name',
      #     number: '5105105105105100',
      #     expirationDate: '05/2014'
      #     billingAddress:
      #       streetAddress: '123 Old St',
      #       locality: 'Old City',
      #       region: 'Old Region'

      # specHelper.defaultGateway.customer.create customerParams, (err, response) ->
      #   creditCardToken = response.customer.creditCards[0].token
      #   done()

    it "updates the card"#, (done) ->
      # updateParams =
      #   cardholderName: 'New Cardholder Name',
      #   number: '4111111111111111',
      #   expirationDate: '12/2015'

      # specHelper.defaultGateway.creditCard.update creditCardToken, updateParams, (err, response) ->
      #   assert.isNull(err)
      #   assert.isTrue(response.success)
      #   assert.equal(response.creditCard.cardholderName, 'New Cardholder Name')
      #   assert.equal(response.creditCard.maskedNumber, '411111******1111')
      #   assert.equal(response.creditCard.expirationDate, '12/2015')

      #   done()

    it "handles errors"#, (done) ->
      # updateParams =
      #   number: 'invalid'

      # specHelper.defaultGateway.creditCard.update creditCardToken, updateParams, (err, response) ->
      #   assert.isFalse(response.success)
      #   assert.equal(response.message, 'Credit card number must be 12-19 digits.')
      #   assert.equal(
      #     response.errors.for('creditCard').on('number')[0].code,
      #     '81716'
      #   )
      #   assert.equal(
      #     response.errors.for('creditCard').on('number')[0].attribute,
      #     'number'
      #   )
      #   errorCodes = (error.code for error in response.errors.deepErrors())
      #   assert.equal(1, errorCodes.length)
      #   assert.include(errorCodes, '81716')

      #   done()

  describe "delete", (done) ->
    customerToken = null

    # before (done) ->
      # customerParams =
      #   creditCard:
      #     number: '5105105105105100',
      #     expirationDate: '05/2014'

      # specHelper.defaultGateway.customer.create customerParams, (err, response) ->
      #   customerToken = response.customer.creditCards[0].token
      #   done()

    it "deletes the credit card"#, (done) ->
      # specHelper.defaultGateway.creditCard.delete customerToken, (err) ->
      #   assert.isNull(err)

      #   specHelper.defaultGateway.creditCard.find customerToken, (err, response) ->
      #     assert.equal(err.type, braintree.errorTypes.notFoundError)
      #     done()

    it "handles invalid tokens"#, (done) ->
      # specHelper.defaultGateway.creditCard.delete 'nonexistent_token', (err) ->
      #   assert.equal(err.type, braintree.errorTypes.notFoundError)

      #   done()

