{AttributeSetter} = require('./attribute_setter')
{TransactionDetails} = require('./transaction_details')

class Dispute extends AttributeSetter
  @Status =
    Open : 'open'
    Lost : 'lost'
    Won  : 'won'
  @Reason =
    CancelledRecurringTransaction : 'cancelled_recurring_transaction'
    CreditNotProcessed            : 'credit_not_processed'
    Duplicate                     : 'duplicate'
    Fraud                         : 'fraud'
    General                       : 'general'
    InvalidAccount                : 'invalid_account'
    NotRecognized                 : 'not_recognized'
    ProductNotReceived            : 'product_not_received'
    ProductUnsatisfactory         : 'product_unsatisfactory'
    TransactionAmountDiffers      : 'transaction_amount_differs'

  constructor: (attributes) ->
    super attributes
    @transactionDetails = new TransactionDetails(attributes.transaction)

exports.Dispute = Dispute
