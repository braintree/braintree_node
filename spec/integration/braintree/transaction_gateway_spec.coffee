require('../../spec_helper')

{_} = require('underscore')
braintree = specHelper.braintree
{CreditCardNumbers} = require('../../../lib/braintree/test/credit_card_numbers')
{VenmoSdk} = require('../../../lib/braintree/test/venmo_sdk')
{CreditCard} = require('../../../lib/braintree/credit_card')
{ValidationErrorCodes} = require('../../../lib/braintree/validation_error_codes')

createTransactionToRefund = (callback) ->
  transactionParams =
    amount: '5.00'
    creditCard:
      number: '5105105105105100'
      expirationDate: '05/2012'
    options:
      submitForSettlement: true

  specHelper.defaultGateway.transaction.sale transactionParams, (err, result) ->
    specHelper.settleTransaction result.transaction.id, (err, settleResult) ->
      specHelper.defaultGateway.transaction.find result.transaction.id, (err, transaction) ->
        callback(transaction)

describe "TransactionGateway", ->
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

    it "can use venmo sdk payment method codes", (done) ->
      transactionParams =
        amount: '1.00'
        venmoSdkPaymentMethodCode: VenmoSdk.VisaPaymentMethodCode

      specHelper.defaultGateway.transaction.sale transactionParams, (err, response) ->
        assert.isNull(err)
        assert.isTrue(response.success)
        assert.equal(response.transaction.creditCard.bin, "411111")

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
        assert.equal(disbursementDetails.fundsHeld, false)

        done()

    it "returns a not found error if given a bad id", (done) ->
      specHelper.defaultGateway.transaction.find 'nonexistent_transaction', (err, response) ->
        assert.equal(err.type, braintree.errorTypes.notFoundError)

        done()

    it "handles whitespace ids", (done) ->
      specHelper.defaultGateway.transaction.find ' ', (err, response) ->
        assert.equal(err.type, braintree.errorTypes.notFoundError)

        done()

  describe "refund", ->
    it "refunds a transaction", (done) ->
      createTransactionToRefund (transaction) ->
        specHelper.defaultGateway.transaction.refund transaction.id, (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
          assert.equal(response.transaction.type, 'credit')
          assert.match(response.transaction.refund_id, /^\w+$/)

          done()

    it "allows refunding partial amounts", (done) ->
      createTransactionToRefund (transaction) ->
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

    it "handles validation erros", (done) ->
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
