require('../../spec_helper')
{CreditCardGateway} = require('../../../lib/braintree/credit_card_gateway')

vows
  .describe('CreditCardGateway')
  .addBatch
    'dateFormat':
      'month boundary':
        topic: (new CreditCardGateway(specHelper.gateway)).dateFormat(new Date('2016-10-1'))
        'returns the expected date format': (result) ->
          assert.equal(result, '102016')
  .export(module)
