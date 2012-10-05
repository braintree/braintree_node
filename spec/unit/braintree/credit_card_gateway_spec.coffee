require('../../spec_helper')
{CreditCardGateway} = require('../../../lib/braintree/credit_card_gateway')

describe "CreditCardGateway", ->
  describe "dateFormat", ->
    it "works with a month boundary", ->
      gateway = new CreditCardGateway(specHelper.gateway)
      date = new Date("2016-10-1")

      assert.equal(gateway.dateFormat(date), "102016")
