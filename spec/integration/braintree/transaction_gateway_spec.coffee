require('../../spec_helper')

{_} = require('underscore')
braintree = specHelper.braintree
{CreditCardNumbers} = require('../../../lib/braintree/test/credit_card_numbers')
{CreditCard} = require('../../../lib/braintree/credit_card')

createTransactionToRefund = (callback) ->
  specHelper.defaultGateway.transaction.sale(
    amount: '5.00'
    creditCard:
      number: '5105105105105100'
      expirationDate: '05/2012'
    options:
      submitForSettlement: true
  , (err, result) ->
    specHelper.settleTransaction(result.transaction.id, (err, settleResult) ->
      specHelper.defaultGateway.transaction.find(result.transaction.id, (err, transaction) ->
        callback(transaction)
      )
    )
  )

vows
  .describe('TransactionGateway')
  .addBatch
    'credit':
      'for a minimal case':
        topic: ->
          specHelper.defaultGateway.transaction.credit(
            amount: '5.00'
            creditCard:
              number: '5105105105105100'
              expirationDate: '05/12'
          , @callback)
          undefined
        'does not have an error': (err, response) ->
          assert.isNull(err)
        'is successful': (err, response) ->
          assert.isTrue(response.success)
        'is a credit': (err, response) ->
          assert.equal(response.transaction.type, 'credit')
        'is for 5.00': (err, response) ->
          assert.equal(response.transaction.amount, '5.00')
        'has a masked number of 510510******5100': (err, response) ->
          assert.equal(response.transaction.creditCard.maskedNumber, '510510******5100')

      'with errors':
        topic: ->
          specHelper.defaultGateway.transaction.credit(
            creditCard:
              number: '5105105105105100'
          , @callback)
          undefined
        'is unsuccessful': (err, response) ->
          assert.isFalse(response.success)
        'has a unified message': (err, response) ->
          assert.equal(response.message, 'Amount is required.\nExpiration date is required.')
        'has an error on amount': (err, response) ->
          assert.equal(
            response.errors.for('transaction').on('amount')[0].code,
            '81502'
          )
        'has an attribute on ValidationError object': (err, response) ->
          assert.equal(
            response.errors.for('transaction').on('amount')[0].attribute,
            'amount'
          )
        'has a nested error on creditCard.expirationDate': (err, response) ->
          assert.equal(
            response.errors.for('transaction').for('creditCard').on('expirationDate')[0].code,
            '81709'
          )
        'returns deepErrors': (err, response) ->
          errorCodes = _.map(response.errors.deepErrors(), (error) ->
            error.code
          )
          assert.equal(errorCodes.length, 2)
          assert.include(errorCodes, '81502')
          assert.include(errorCodes, '81709')

    'sale':
      'for a minimal case':
        topic: ->
          specHelper.defaultGateway.transaction.sale(
            amount: '5.00'
            creditCard:
              number: '5105105105105100'
              expirationDate: '05/12'
          , @callback)
          undefined
        'does not have an error': (err, response) ->
          assert.isNull(err)
        'is successful': (err, response) ->
          assert.isTrue(response.success)
        'is a sale': (err, response) ->
          assert.equal(response.transaction.type, 'sale')
        'is for 5.00': (err, response) ->
          assert.equal(response.transaction.amount, '5.00')
        'has a masked number of 510510******5100': (err, response) ->
          assert.equal(response.transaction.creditCard.maskedNumber, '510510******5100')

      'using a customer from the vault':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            firstName: 'Adam'
            lastName: 'Jones'
            creditCard:
              cardholderName: 'Adam Jones'
              number: '5105105105105100'
              expirationDate: '05/2014'
          , (err, result) ->
            specHelper.defaultGateway.transaction.sale(
              customer_id: result.customer.id
              amount: '100.00'
            , callback)
          )
          undefined
        'does not have an error': (err, response) ->
          assert.isNull(err)
        'is successful': (err, response) ->
          assert.isTrue(response.success)
        'is a sale': (err, response) ->
          assert.equal(response.transaction.type, 'sale')
        'snapshots customer details': (err, response) ->
          assert.equal(response.transaction.customer.firstName, 'Adam')
          assert.equal(response.transaction.customer.lastName, 'Jones')
        'snapshots credit card details': (err, response) ->
          assert.equal(response.transaction.creditCard.cardholderName, 'Adam Jones')
          assert.equal(response.transaction.creditCard.maskedNumber, '510510******5100')
          assert.equal(response.transaction.creditCard.expirationDate, '05/2014')

      'using a credit card from the vault':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.customer.create(
            firstName: 'Adam'
            lastName: 'Jones'
            creditCard:
              cardholderName: 'Adam Jones'
              number: '5105105105105100'
              expirationDate: '05/2014'
          , (err, result) ->
            specHelper.defaultGateway.transaction.sale(
              payment_method_token: result.customer.creditCards[0].token
              amount: '100.00'
            , callback)
          )
          undefined
        'does not have an error': (err, response) ->
          assert.isNull(err)
        'is successful': (err, response) ->
          assert.isTrue(response.success)
        'is a sale': (err, response) ->
          assert.equal(response.transaction.type, 'sale')
        'snapshots customer details': (err, response) ->
          assert.equal(response.transaction.customer.firstName, 'Adam')
          assert.equal(response.transaction.customer.lastName, 'Jones')
        'snapshots credit card details': (err, response) ->
          assert.equal(response.transaction.creditCard.cardholderName, 'Adam Jones')
          assert.equal(response.transaction.creditCard.maskedNumber, '510510******5100')
          assert.equal(response.transaction.creditCard.expirationDate, '05/2014')

      'with the submit for settlement option':
        topic: ->
          specHelper.defaultGateway.transaction.sale(
            amount: '5.00'
            creditCard:
              number: '5105105105105100'
              expirationDate: '05/12'
            options:
              submitForSettlement: true
          , @callback)
          undefined
        'is successful': (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
        'submits the transaction for settlement': (err, response) ->
          assert.equal(response.transaction.status, 'submitted_for_settlement')

      'with the store in vault in option':
        topic: ->
          specHelper.defaultGateway.transaction.sale(
            amount: '5.00'
            creditCard:
              number: '5105105105105100'
              expirationDate: '05/12'
            options:
              storeInVault: true
          , @callback)
          undefined
        'is successful': (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
        'stores the customer and credit card in the vault': (err, response) ->
          assert.match(response.transaction.customer.id, /^\d+$/)
          assert.match(response.transaction.creditCard.token, /^\w+$/)

      'with a custom field':
        topic: ->
          specHelper.defaultGateway.transaction.sale(
            amount: '5.00'
            creditCard:
              number: '5105105105105100'
              expirationDate: '05/12'
            customFields:
              storeMe: 'custom value'
          , @callback)
          undefined
        'does not have an error': (err, response) ->
          assert.isNull(err)
        'is successful': (err, response) ->
          assert.isTrue(response.success)
        'has custom fields in response': (err, response) ->
          assert.equal(response.transaction.customFields.storeMe, 'custom value')

      'when setting recurring':
        topic: ->
          specHelper.defaultGateway.transaction.sale(
            amount: '5.00'
            creditCard:
              number: '5105105105105100'
              expirationDate: '05/12'
            recurring: true
          , @callback)
          undefined
        'does not have an error': (err, response) ->
          assert.isNull(err)
        'is successful': (err, response) ->
          assert.isTrue(response.success)
        'sets recurring to true': (err, response) ->
          assert.equal(response.transaction.recurring, true)

      'when using a card with card type indicators':
        topic: ->
          specHelper.defaultGateway.transaction.sale(
            amount: '5.00'
            creditCard:
              number: CreditCardNumbers.CardTypeIndicators.Unknown
              expirationDate: '05/12'
          , @callback)
          undefined
        'has cardtype indicator fields in result': (err, response) ->
          assert.equal(response.transaction.creditCard.prepaid, CreditCard.Prepaid.Unknown)
          assert.equal(response.transaction.creditCard.durbinRegulated, CreditCard.DurbinRegulated.Unknown)
          assert.equal(response.transaction.creditCard.commercial, CreditCard.Commercial.Unknown)
          assert.equal(response.transaction.creditCard.healthcare, CreditCard.Healthcare.Unknown)
          assert.equal(response.transaction.creditCard.debit, CreditCard.Debit.Unknown)
          assert.equal(response.transaction.creditCard.payroll, CreditCard.Payroll.Unknown)


      'when processor declined':
        topic: ->
          specHelper.defaultGateway.transaction.sale(
            amount: '2000.00'
            creditCard:
              number: '5105105105105100'
              expirationDate: '05/12'
          , @callback)
          undefined
        'is unsuccessful': (err, response) ->
          assert.isFalse(response.success)
        'has a transaction': (err, response) ->
          assert.equal(response.transaction.amount, '2000.00')
        'has a status of processor_declined': (err, response) ->
          assert.equal(response.transaction.status, 'processor_declined')

      'with errors':
        topic: ->
          specHelper.defaultGateway.transaction.sale(
            creditCard:
              number: '5105105105105100'
          , @callback)
          undefined
        'is unsuccessful': (err, response) ->
          assert.isFalse(response.success)
        'has a unified message': (err, response) ->
          assert.equal(response.message, 'Amount is required.\nExpiration date is required.')
        'has an error on amount': (err, response) ->
          assert.equal(
            response.errors.for('transaction').on('amount')[0].code,
            '81502'
          )
        'has an attribute on ValidationError objects': (err, response) ->
          assert.equal(
            response.errors.for('transaction').on('amount')[0].attribute,
            'amount'
          )
        'has a nested error on creditCard.expirationDate': (err, response) ->
          assert.equal(
            response.errors.for('transaction').for('creditCard').on('expirationDate')[0].code,
            '81709'
          )
        'returns deepErrors': (err, response) ->
          errorCodes = _.map(response.errors.deepErrors(), (error) ->
            error.code
          )
          assert.equal(errorCodes.length, 2)
          assert.include(errorCodes, '81502')
          assert.include(errorCodes, '81709')

    'find':
      'when found':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.transaction.sale(
            amount: '5.00'
            creditCard:
              number: '5105105105105100'
              expirationDate: '05/12'
          , (err, response) ->
            specHelper.defaultGateway.transaction.find(response.transaction.id, callback)
          )
          undefined
        'returns transaction details': (err, transaction) ->
          assert.equal(transaction.amount, '5.00')

      'when not found':
        topic: ->
          specHelper.defaultGateway.transaction.find('nonexistent_transaction', @callback)
          undefined
        'returns a not found error': (err, response) ->
          assert.equal(err.type, braintree.errorTypes.notFoundError)

      'when the id is whitespace':
        topic: ->
          specHelper.defaultGateway.transaction.find(' ', @callback)
          undefined
        'returns a not found error': (err, address) ->
          assert.equal(err.type, braintree.errorTypes.notFoundError)

    'refund':
      'when the transaction can be refunded':
        topic: ->
          callback = @callback
          createTransactionToRefund((transaction) ->
            specHelper.defaultGateway.transaction.refund(transaction.id, callback)
          )
          undefined
        'is successful': (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
        'creates a credit with a reference to the refunded transaction': (err, response) ->
          assert.equal(response.transaction.type, 'credit')
          assert.match(response.transaction.refund_id, /^\w+$/)

      'partial amount':
        topic: ->
          callback = @callback
          createTransactionToRefund((transaction) ->
            specHelper.defaultGateway.transaction.refund(transaction.id, '1.00', callback)
          )
          undefined
        'is successful': (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
        'creates a credit for the given amount': (err, response) ->
          assert.equal(response.transaction.type, 'credit')
          assert.match(response.transaction.refund_id, /^\w+$/)
          assert.equal(response.transaction.amount, '1.00')

      'when transaction amount cannot be refunded':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.transaction.sale(
            amount: '5.00'
            creditCard:
              number: '5105105105105100'
              expirationDate: '05/12'
            options:
              submitForSettlement: true
          , (err, response) ->
            specHelper.defaultGateway.transaction.refund(response.transaction.id, callback)
          )
          undefined
        'does not have an error': (err, response) ->
          assert.isNull(err)
        'is not successful': (err, response) ->
          assert.isFalse(response.success)
        'has error 91507 on base': (err, response) ->
          assert.equal(response.errors.for('transaction').on('base')[0].code, '91506')

    'submitForSettlement':
      'when submitting an authorized transaction for settlement':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.transaction.sale(
            amount: '5.00'
            creditCard:
              number: '5105105105105100'
              expirationDate: '05/12'
          , (err, response) ->
            specHelper.defaultGateway.transaction.submitForSettlement(response.transaction.id, callback)
          )
          undefined
        'is successful': (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
        'sets the status to submitted_for_settlement': (err, response) ->
          assert.equal(response.transaction.status, 'submitted_for_settlement')
        'submits the entire amount for settlement': (err, response) ->
          assert.equal(response.transaction.amount, '5.00')

      'when submitting a partial amount for settlement':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.transaction.sale(
            amount: '5.00'
            creditCard:
              number: '5105105105105100'
              expirationDate: '05/12'
          , (err, response) ->
            specHelper.defaultGateway.transaction.submitForSettlement(response.transaction.id, '3.00', callback)
          )
          undefined
        'is successful': (err, response) ->
          assert.isNull(err)
          assert.isTrue(response.success)
        'sets the status to submitted_for_settlement': (err, response) ->
          assert.equal(response.transaction.status, 'submitted_for_settlement')
        'submits the specified amount for settlement': (err, response) ->
          assert.equal(response.transaction.amount, '3.00')

      'when transaction cannot be submitted for settlement':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.transaction.sale(
            amount: '5.00'
            creditCard:
              number: '5105105105105100'
              expirationDate: '05/12'
            options:
              submitForSettlement: true
          , (err, response) ->
            specHelper.defaultGateway.transaction.submitForSettlement(response.transaction.id, callback)
          )
          undefined
        'does not have an error': (err, response) ->
          assert.isNull(err)
        'is not successful': (err, response) ->
          assert.isFalse(response.success)
        'has error 91507 on base': (err, response) ->
          assert.equal(response.errors.for('transaction').on('base')[0].code, '91507')

    'void':
      'when voiding an authorized transaction':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.transaction.sale(
            amount: '5.00'
            creditCard:
              number: '5105105105105100'
              expirationDate: '05/12'
          , (err, response) ->
            specHelper.defaultGateway.transaction.void(response.transaction.id, callback)
          )
          undefined
        'does not have an error': (err, response) ->
          assert.isNull(err)
        'is successful': (err, response) ->
          assert.isTrue(response.success)
        'sets the status to voided': (err, response) ->
          assert.equal(response.transaction.status, 'voided')

      'when transaction cannot be voided':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.transaction.sale(
            amount: '5.00'
            creditCard:
              number: '5105105105105100'
              expirationDate: '05/12'
          , (err, response) ->
            specHelper.defaultGateway.transaction.void(response.transaction.id, (err, response) ->
              specHelper.defaultGateway.transaction.void(response.transaction.id, callback)
            )
          )
          undefined
        'does not have an error': (err, response) ->
          assert.isNull(err)
        'is not successful': (err, response) ->
          assert.isFalse(response.success)
        'has error 91504 on base': (err, response) ->
          assert.equal(response.errors.for('transaction').on('base')[0].code, '91504')

    'cloneTransaction':
      'for a minimal case':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.transaction.sale(
            amount: '5.00'
            creditCard:
              number: '5105105105105100'
              expirationDate: '05/12'
          , (err, result) ->
            specHelper.defaultGateway.transaction.cloneTransaction(result.transaction.id,
              amount: '123.45'
              channel: 'MyShoppingCartProvider'
              options:
                submitForSettlement: 'false'
              , callback)
          )
          undefined
        'is successful': (err, response) ->
          assert.isTrue(response.success)
        'it copies and updates fields': (err, response) ->
          transaction = response.transaction
          assert.equal(transaction.amount, '123.45')
          assert.equal(transaction.channel, 'MyShoppingCartProvider')
          assert.equal(transaction.creditCard.maskedNumber, '510510******5100')
          assert.equal(transaction.creditCard.expirationDate, '05/2012')

      'with validation errors':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.transaction.credit(
            amount: '5.00'
            creditCard:
              number: '5105105105105100'
              expirationDate: '05/12'
          , (err, result) ->
            specHelper.defaultGateway.transaction.cloneTransaction(result.transaction.id, amount: '123.45', callback)
          )
          undefined
        'is unsuccessful': (err, response) ->
          assert.isFalse(response.success)
        'has an error on base': (err, response) ->
          assert.equal(
            response.errors.for('transaction').on('base')[0].code,
            '91543'
          )

      'with submitForSettlement':
        topic: ->
          callback = @callback
          specHelper.defaultGateway.transaction.sale(
            amount: '5.00'
            creditCard:
              number: '5105105105105100'
              expirationDate: '05/12'
          , (err, result) ->
            specHelper.defaultGateway.transaction.cloneTransaction(result.transaction.id,
              amount: '123.45'
              options:
                submitForSettlement: "true"
              , callback)
          )
          undefined
        'is successful': (err, response) ->
          assert.isTrue(response.success)
          assert.equal(response.transaction.status, 'submitted_for_settlement')

  .export(module)
